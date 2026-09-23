# DalConfessions

Anonymous confessions and community app for Dalhousie students. No sign-up, no email — anyone can browse, post, react, and comment anonymously.

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
3. Copy your project's **Project URL** and **anon public key** from Settings → API.

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

- No accounts, notifications, or DMs — fully anonymous by device token stored in `localStorage`.
- Posts/comments with 3+ reports auto-blur behind a warning; there's no moderation review dashboard yet (reports are stored, ready for a future admin view).
- Vote/reaction/report counters are only ever mutated through `SECURITY DEFINER` Postgres functions, so an anonymous client can't set counts directly.
