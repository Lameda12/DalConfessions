-- Evaporating confessions: everything vanishes 6 hours after posting.
-- "Once said, once forgotten" — the core hook of DalConfessions.

-- Bake the 6-hour window into the feed view itself so every read path
-- (feed, search, category counts, trending sidebar) naturally excludes
-- expired posts even in the few minutes before the cleanup job runs.
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
  coalesce(rc.reaction_counts, '{}'::jsonb) as reaction_counts,
  (p.created_at + interval '6 hours') as expires_at
from posts p
left join lateral (
  select jsonb_object_agg(t.reaction_type, t.cnt) as reaction_counts
  from (
    select reaction_type, count(*) as cnt
    from reactions r
    where r.post_id = p.id and r.reaction_type not in ('upvote', 'downvote')
    group by reaction_type
  ) t
) rc on true
where p.created_at > now() - interval '6 hours';

grant select on posts_feed to anon, authenticated;

-- posts_feed is now the only source of truth for "live" posts. Category
-- counts should use it too, so an evaporated post's count drops instantly.
create or replace view category_counts as
select category, count(*) as count
from posts_feed
group by category;

grant select on category_counts to anon, authenticated;

-- Hard-delete evaporated posts. Comments, reactions, comment_reactions,
-- and reports all cascade-delete via their FKs — the whole thread and
-- its report history go with it. This is a genuine forget, not a hide.
create or replace function evaporate_expired_posts() returns void
language sql
security definer
set search_path = public
as $$
  delete from posts where created_at <= now() - interval '6 hours';
$$;

-- Requires the pg_cron extension enabled for this project. In the
-- Supabase dashboard: Database -> Extensions -> search "pg_cron" -> Enable.
-- Then re-run just the block below (safe to re-run: cron.schedule upserts
-- by job name).
create extension if not exists pg_cron;

select cron.schedule(
  'evaporate-confessions',
  '*/5 * * * *',
  $$select evaporate_expired_posts();$$
);
