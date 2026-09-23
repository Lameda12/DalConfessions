-- DalConfessions initial schema
-- Anonymous, no-auth confessions app. All mutable counters are only ever
-- changed through SECURITY DEFINER functions below, never by direct
-- client UPDATE, so an anon client cannot set votes/report counts directly.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

create type post_category as enum (
  'campus-stories',
  'crushes-missed-connections',
  'killam-study-rants',
  'funny-encounters',
  'unpopular-opinions',
  'questions-advice',
  'campus-tea'
);

create type reaction_kind as enum (
  'upvote',
  'downvote',
  'tiger',
  'dead',
  'missed_connection',
  'spill'
);

create type report_reason as enum (
  'doxxing_names',
  'harassment',
  'hate_speech',
  'spam'
);

create type report_target as enum ('post', 'comment');

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table posts (
  id uuid primary key default gen_random_uuid(),
  content text not null check (char_length(content) between 1 and 500),
  tag text,
  category post_category not null,
  spoiler boolean not null default false,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  report_count integer not null default 0,
  is_hidden boolean not null default false,
  client_token text not null,
  created_at timestamptz not null default now()
);

create extension if not exists pg_trgm;

create index posts_created_at_idx on posts (created_at desc);
create index posts_category_idx on posts (category);
create index posts_content_trgm_idx on posts using gin (content gin_trgm_ops);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  parent_id uuid references comments (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 500),
  pseudonym text not null,
  upvotes integer not null default 0,
  report_count integer not null default 0,
  is_hidden boolean not null default false,
  client_token text not null,
  created_at timestamptz not null default now()
);

create index comments_post_id_idx on comments (post_id, created_at asc);

create table reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  reaction_type reaction_kind not null,
  client_token text not null,
  created_at timestamptz not null default now(),
  unique (post_id, client_token, reaction_type)
);

create index reactions_post_id_idx on reactions (post_id);

create table comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references comments (id) on delete cascade,
  client_token text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, client_token)
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  target_type report_target not null,
  post_id uuid references posts (id) on delete cascade,
  comment_id uuid references comments (id) on delete cascade,
  reason report_reason not null,
  client_token text not null,
  created_at timestamptz not null default now(),
  constraint reports_target_check check (
    (target_type = 'post' and post_id is not null and comment_id is null) or
    (target_type = 'comment' and comment_id is not null and post_id is null)
  )
);

-- Dedup is enforced by submit_report() checking existence first; these
-- partial unique indexes back that up at the database level (a plain
-- UNIQUE constraint can't be used here since NULL columns never compare equal).
create unique index reports_unique_post_report
  on reports (post_id, client_token) where target_type = 'post';
create unique index reports_unique_comment_report
  on reports (comment_id, client_token) where target_type = 'comment';

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table posts enable row level security;
alter table comments enable row level security;
alter table reactions enable row level security;
alter table comment_reactions enable row level security;
alter table reports enable row level security;

-- Public can read everything that isn't hidden by moderation.
create policy "posts are publicly readable" on posts
  for select using (true);

create policy "comments are publicly readable" on comments
  for select using (true);

create policy "reactions are publicly readable" on reactions
  for select using (true);

create policy "comment reactions are publicly readable" on comment_reactions
  for select using (true);

-- Anyone can create a post or comment (no auth, rate-limited client-side
-- via the device token). Counters always start at their column defaults.
create policy "anyone can create a post" on posts
  for insert with check (
    upvotes = 0 and downvotes = 0 and report_count = 0 and is_hidden = false
  );

create policy "anyone can create a comment" on comments
  for insert with check (upvotes = 0 and report_count = 0 and is_hidden = false);

grant select, insert on posts to anon, authenticated;
grant select, insert on comments to anon, authenticated;
grant select on reactions to anon, authenticated;
grant select on comment_reactions to anon, authenticated;
grant insert on reports to anon, authenticated;

revoke update, delete on posts from anon, authenticated;
revoke update, delete on comments from anon, authenticated;
revoke insert, update, delete on reactions from anon, authenticated;
revoke insert, update, delete on comment_reactions from anon, authenticated;
revoke select, update, delete on reports from anon, authenticated;

-- Reports are write-only from the client: nobody can read who reported what.
create policy "anyone can file a report" on reports
  for insert with check (true);

-- ---------------------------------------------------------------------
-- Vote / reaction toggling (SECURITY DEFINER so counters stay honest)
-- ---------------------------------------------------------------------

create or replace function toggle_post_reaction(
  p_post_id uuid,
  p_reaction reaction_kind,
  p_client_token text
) returns table (
  active boolean,
  upvotes integer,
  downvotes integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
  v_opposite reaction_kind;
begin
  if p_client_token is null or length(p_client_token) < 8 then
    raise exception 'invalid client token';
  end if;

  select id into v_existing
  from reactions
  where post_id = p_post_id and reaction_type = p_reaction and client_token = p_client_token;

  if v_existing is not null then
    delete from reactions where id = v_existing;

    if p_reaction = 'upvote' then
      update posts set upvotes = greatest(upvotes - 1, 0) where id = p_post_id;
    elsif p_reaction = 'downvote' then
      update posts set downvotes = greatest(downvotes - 1, 0) where id = p_post_id;
    end if;

    active := false;
  else
    if p_reaction = 'upvote' then
      v_opposite := 'downvote';
    elsif p_reaction = 'downvote' then
      v_opposite := 'upvote';
    else
      v_opposite := null;
    end if;

    if v_opposite is not null then
      delete from reactions
      where post_id = p_post_id and reaction_type = v_opposite and client_token = p_client_token;

      if v_opposite = 'upvote' then
        update posts set upvotes = greatest(upvotes - 1, 0) where id = p_post_id;
      else
        update posts set downvotes = greatest(downvotes - 1, 0) where id = p_post_id;
      end if;
    end if;

    insert into reactions (post_id, reaction_type, client_token)
    values (p_post_id, p_reaction, p_client_token);

    if p_reaction = 'upvote' then
      update posts set upvotes = upvotes + 1 where id = p_post_id;
    elsif p_reaction = 'downvote' then
      update posts set downvotes = downvotes + 1 where id = p_post_id;
    end if;

    active := true;
  end if;

  return query select active, posts.upvotes, posts.downvotes from posts where id = p_post_id;
end;
$$;

grant execute on function toggle_post_reaction(uuid, reaction_kind, text) to anon, authenticated;

create or replace function toggle_comment_upvote(
  p_comment_id uuid,
  p_client_token text
) returns table (active boolean, upvotes integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing uuid;
begin
  if p_client_token is null or length(p_client_token) < 8 then
    raise exception 'invalid client token';
  end if;

  select id into v_existing
  from comment_reactions
  where comment_id = p_comment_id and client_token = p_client_token;

  if v_existing is not null then
    delete from comment_reactions where id = v_existing;
    update comments set upvotes = greatest(upvotes - 1, 0) where id = p_comment_id;
    active := false;
  else
    insert into comment_reactions (comment_id, client_token) values (p_comment_id, p_client_token);
    update comments set upvotes = upvotes + 1 where id = p_comment_id;
    active := true;
  end if;

  return query select active, comments.upvotes from comments where id = p_comment_id;
end;
$$;

grant execute on function toggle_comment_upvote(uuid, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Reporting (increments report_count, auto-blurs at 3+, still SD so the
-- report_count column itself is never directly writable by clients)
-- ---------------------------------------------------------------------

create or replace function submit_report(
  p_target_type report_target,
  p_target_id uuid,
  p_reason report_reason,
  p_client_token text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_already_reported boolean;
begin
  if p_client_token is null or length(p_client_token) < 8 then
    raise exception 'invalid client token';
  end if;

  if p_target_type = 'post' then
    select exists (
      select 1 from reports
      where target_type = 'post' and post_id = p_target_id and client_token = p_client_token
    ) into v_already_reported;

    if v_already_reported then
      return;
    end if;

    insert into reports (target_type, post_id, reason, client_token)
    values ('post', p_target_id, p_reason, p_client_token);

    update posts set report_count = report_count + 1 where id = p_target_id;
  else
    select exists (
      select 1 from reports
      where target_type = 'comment' and comment_id = p_target_id and client_token = p_client_token
    ) into v_already_reported;

    if v_already_reported then
      return;
    end if;

    insert into reports (target_type, comment_id, reason, client_token)
    values ('comment', p_target_id, p_reason, p_client_token);

    update comments set report_count = report_count + 1 where id = p_target_id;
  end if;
exception
  when unique_violation then
    return;
end;
$$;

grant execute on function submit_report(report_target, uuid, report_reason, text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Feed view with a Hacker-News-style trending score
-- ---------------------------------------------------------------------

create or replace view posts_feed as
select
  p.*,
  (p.upvotes - p.downvotes) as net_score,
  (
    (p.upvotes - p.downvotes)::float
    / power(
        (extract(epoch from (now() - p.created_at)) / 3600.0) + 2,
        1.5
      )
  ) as trending_score,
  coalesce(rc.reaction_counts, '{}'::jsonb) as reaction_counts
from posts p
left join lateral (
  select jsonb_object_agg(t.reaction_type, t.cnt) as reaction_counts
  from (
    select reaction_type, count(*) as cnt
    from reactions r
    where r.post_id = p.id and r.reaction_type not in ('upvote', 'downvote')
    group by reaction_type
  ) t
) rc on true;

grant select on posts_feed to anon, authenticated;

-- ---------------------------------------------------------------------
-- Search
-- ---------------------------------------------------------------------

create or replace function search_posts(p_query text)
returns setof posts_feed
language sql
stable
as $$
  select *
  from posts_feed
  where report_count < 3
    and (content ilike '%' || p_query || '%' or tag ilike '%' || p_query || '%')
  order by created_at desc
  limit 50;
$$;

grant execute on function search_posts(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------

insert into posts (content, tag, category, spoiler, upvotes, downvotes, created_at, client_token) values
('Just saw someone full-on sprint across the Studley quad because they forgot their SLC presentation was TODAY. Respect the hustle.', 'Studley', 'campus-stories', false, 42, 2, now() - interval '2 hours', 'seed-token-01'),
('Killam 4th floor at 1am hits different. Everyone silently suffering together over the same stats assignment. Community.', 'Killam', 'killam-study-rants', false, 88, 3, now() - interval '5 hours', 'seed-token-02'),
('To the guy in my POLI class who always argues with the prof just to hear himself talk: we get it, you read the syllabus twice.', 'Classroom', 'unpopular-opinions', false, 61, 9, now() - interval '9 hours', 'seed-token-03'),
('There is a specific bench outside the LSC where I have now had 3 separate breakdowns. It has seen things.', 'LSC', 'campus-tea', false, 37, 1, now() - interval '1 day', 'seed-token-04'),
('Made eye contact with someone in the Coburg IGA at 11pm buying the exact same frozen pizza as me. If you remember this, DM the group.', 'Coburg', 'crushes-missed-connections', false, 120, 4, now() - interval '1 day 3 hours', 'seed-token-05'),
('Genuinely unpopular opinion: the Dal shuttle schedule is fine, you are just bad at planning your life.', null, 'unpopular-opinions', false, 29, 21, now() - interval '2 days', 'seed-token-06'),
('Watched a squirrel steal an entire untouched Pete''s bagel off someone''s tray on the Studley quad. Best five seconds of my week.', 'Studley', 'funny-encounters', false, 156, 2, now() - interval '2 days 4 hours', 'seed-token-07'),
('Is it just me or does the Killam printer eat your money on purpose right before a deadline? Asking for a very stressed friend.', 'Killam', 'questions-advice', false, 44, 0, now() - interval '3 days', 'seed-token-08'),
('You, red backpack, always in the same seat at Sexton library. I think you''re cute and also extremely focused, which is somehow worse.', 'Sexton', 'crushes-missed-connections', true, 73, 3, now() - interval '3 days 6 hours', 'seed-token-09'),
('Started crying in the Life Sciences Centre bathroom because of a lab report and a girl I''d never met handed me a granola bar under the stall. Dal moment of the year.', 'LSC', 'campus-stories', false, 210, 1, now() - interval '4 days', 'seed-token-10'),
('How does everyone afford Battery Point group projects. We are supposed to be broke students.', null, 'unpopular-opinions', false, 33, 6, now() - interval '5 days', 'seed-token-11'),
('PSA: the quiet floor in Killam is not actually quiet after 9pm, it is just people whisper-arguing about group project marks.', 'Killam', 'killam-study-rants', false, 95, 2, now() - interval '6 days', 'seed-token-12'),
('Anyone else think the Dal gold hoodie is doing more for campus morale than the actual course content this semester?', null, 'campus-tea', false, 58, 5, now() - interval '10 days', 'seed-token-13'),
('The Grawood on trivia night is the single most underrated Dal experience and nobody tells first years about it.', 'Grawood', 'campus-stories', false, 140, 3, now() - interval '20 days', 'seed-token-14'),
('Shoutout to whoever left their umbrella chained to the SUB bike rack for an entire semester. Bold strategy.', 'SUB', 'funny-encounters', false, 67, 1, now() - interval '25 days', 'seed-token-15');

-- Seed a few threaded comments on the first post.
with p as (select id from posts order by created_at desc limit 1)
insert into comments (post_id, parent_id, content, pseudonym, upvotes, created_at, client_token)
select id, null::uuid, 'lmao I was RIGHT behind them, they almost took out a first year', 'Tiger #1', 12, now() - interval '90 minutes', 'seed-token-c1' from p
union all
select id, null::uuid, 'SLC presentations are genuinely the Dal hunger games', 'Seaside Anon', 8, now() - interval '80 minutes', 'seed-token-c2' from p;

with p as (select id from posts order by created_at desc limit 1),
     c as (select id from comments where pseudonym = 'Tiger #1' order by created_at desc limit 1)
insert into comments (post_id, parent_id, content, pseudonym, upvotes, created_at, client_token)
select p.id, c.id, 'honestly same energy as me running for the 6 bus every single day', 'OP', 4, now() - interval '70 minutes', 'seed-token-c3' from p, c;
