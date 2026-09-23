-- Fixes a real bug: toggle_post_reaction and toggle_comment_upvote declared
-- OUT parameters named the same as the columns they update (upvotes,
-- downvotes), so every UPDATE ... SET x = x ± 1 inside them hit
-- "column reference is ambiguous" (Postgres 42702) and the whole RPC call
-- failed. The client's optimistic UI update would show the new count, then
-- the post-mutation refetch pulled back the real (unchanged) count — every
-- upvote/downvote/reaction/comment-upvote appeared to "revert" because the
-- write never actually happened. Fixed by qualifying the RHS references
-- with the table name (the LHS of `SET x = ...` is never ambiguous, only
-- the expression on the right was).
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
      update posts set upvotes = greatest(posts.upvotes - 1, 0) where id = p_post_id;
    elsif p_reaction = 'downvote' then
      update posts set downvotes = greatest(posts.downvotes - 1, 0) where id = p_post_id;
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
        update posts set upvotes = greatest(posts.upvotes - 1, 0) where id = p_post_id;
      else
        update posts set downvotes = greatest(posts.downvotes - 1, 0) where id = p_post_id;
      end if;
    end if;

    insert into reactions (post_id, reaction_type, client_token)
    values (p_post_id, p_reaction, p_client_token);

    if p_reaction = 'upvote' then
      update posts set upvotes = posts.upvotes + 1 where id = p_post_id;
    elsif p_reaction = 'downvote' then
      update posts set downvotes = posts.downvotes + 1 where id = p_post_id;
    end if;

    active := true;
  end if;

  return query select active, posts.upvotes, posts.downvotes from posts where id = p_post_id;
end;
$$;

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
    update comments set upvotes = greatest(comments.upvotes - 1, 0) where id = p_comment_id;
    active := false;
  else
    insert into comment_reactions (comment_id, client_token) values (p_comment_id, p_client_token);
    update comments set upvotes = comments.upvotes + 1 where id = p_comment_id;
    active := true;
  end if;

  return query select active, comments.upvotes from comments where id = p_comment_id;
end;
$$;

-- Security hardening, now that this app is shared publicly:
--
-- Views created by a privileged role default to running with the
-- creator's permissions rather than the querying user's, bypassing RLS
-- on the underlying tables. Not exploitable today (posts/reactions are
-- already fully public-readable), but wrong to leave in place.
alter view posts_feed set (security_invoker = true);
alter view category_counts set (security_invoker = true);

-- Pin the search path so this function can't be tricked by a
-- search_path set on the calling session/role.
alter function search_posts(text) set search_path = public;

-- Comment replies/thread loading filters by parent_id; this FK had no
-- covering index.
create index if not exists comments_parent_id_idx on comments (parent_id);
