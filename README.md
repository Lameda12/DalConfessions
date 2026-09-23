# DalConfessions

Anonymous confessions and community app for Dalhousie students. No sign-up, no email — anyone can browse, post, react, and comment anonymously.

**Every confession vanishes 6 hours after it's posted — comments, votes, and all.** Once said, once forgotten. That's the whole hook.

Built with React + TypeScript + Vite + Tailwind CSS v4, backed by Supabase (Postgres + RLS).

## Stack

- **Frontend**: React 19, React Router, TanStack Query, Tailwind CSS v4
- **Backend**: Supabase (Postgres, Row Level Security, SECURITY DEFINER RPC functions for votes/reactions/reports)
- **Hosting**: Vercel (static SPA build)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

## Setting up the database

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_init.sql`. This creates the `posts`, `comments`, `reactions`, `comment_reactions`, and `reports` tables, the RLS policies, the vote/report RPC functions, the `posts_feed` trending view, and seeds a batch of sample confessions.
3. Enable the **pg_cron** extension: Database → Extensions → search "pg_cron" → Enable.
4. In the SQL Editor, run `supabase/migrations/0002_evaporation.sql`. This adds the 6-hour evaporation window to `posts_feed` (so expired posts vanish from every read path instantly) and schedules a cron job that hard-deletes posts older than 6 hours every 5 minutes — comments, reactions, and reports cascade-delete with them.
5. Copy your project's **Project URL** and **anon public key** from Settings → API.

If pg_cron isn't available on your plan, run everything in `0002_evaporation.sql` except the last two statements (`create extension pg_cron` and `cron.schedule(...)`). The app still *looks* right — the `posts_feed` view filters out anything older than 6 hours from every read path, so expired posts vanish from the UI regardless. Without the cron job, though, the rows just sit in the `posts` table forever instead of actually being deleted — "forgotten" becomes "hidden," not gone.

## Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. In Vercel, **Add New Project** → import this repository. Vercel will detect the Vite framework and use the settings in `vercel.json` (build command `npm run build`, output directory `dist`, SPA rewrites for client-side routing).
3. Add two Environment Variables in the Vercel project settings (Production, Preview, and Development):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy. Every route (`/`, `/post/:id`, `/categories`, `/categories/:slug`, `/search`) is served through `index.html` via the rewrite rule in `vercel.json`, so client-side routing works on direct loads and refreshes.

## Project structure

```
src/
  components/    UI components (layout, posts, compose, comments, common)
  context/       ComposeContext (global "whisper" modal state)
  data/          Static category + reaction metadata
  hooks/         TanStack Query hooks wrapping Supabase reads/writes
  lib/           Supabase client, device token, moderation checks, share-card renderer
  pages/         Route-level pages (Feed, Post detail, Categories, Search)
  types/         Shared TypeScript types
supabase/
  migrations/    SQL schema, RLS policies, RPC functions, seed data
```

## Notes on the current build

- **Evaporation**: every confession (and its comments/reactions/reports) is gone 6 hours after posting. This is the product's core hook, not a moderation feature — see `supabase/migrations/0002_evaporation.sql`. Because of it, the feed only has Trending and Latest tabs; anything like "Top of Week" or "Campus Classics" doesn't make sense when nothing survives past 6 hours.
- No accounts, notifications, or DMs — fully anonymous by device token stored in `localStorage`.
- Posts/comments with 3+ reports auto-blur behind a warning; there's no moderation review dashboard yet (reports are stored, ready for a future admin view).
- Vote/reaction/report counters are only ever mutated through `SECURITY DEFINER` Postgres functions, so an anonymous client can't set counts directly.
