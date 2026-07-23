---
quick_id: 260723-kv7
status: complete
---

# Quick Task 260723-kv7: Pull Supabase project credentials via CLI — Summary

## What happened

1. Confirmed the Supabase CLI (`supabase --version` → 2.109.1) was already authenticated and the project already linked (`supabase projects list` showed `gavel-news-web` linked to ref `fewdjzjkdblnvzvtjzgz`, project "GavelNews", `ACTIVE_HEALTHY`).
2. Ran `supabase projects api-keys --project-ref fewdjzjkdblnvzvtjzgz` to fetch the key set (anon, service_role, publishable, secret).
3. Wrote only `NEXT_PUBLIC_SUPABASE_URL` (`https://fewdjzjkdblnvzvtjzgz.supabase.co`) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (legacy anon JWT) into `.env.local`, preserving the existing `VERCEL_OIDC_TOKEN` line.
4. Verified: no `service_role`/`sb_secret_` value present in the file; `.env.local` remains git-ignored (`.gitignore:44`) and shows no `git status` entry — nothing was staged or committed.

## Deviations from plan

None.

## Notes for follow-up

- `DATA_SOURCE` was intentionally left untouched (still defaults to `mock` per `lib/data/index.ts`) — flipping it to `supabase` and exercising the live client is a separate task, since Phase 1 (schema/RLS/seed data) hasn't shipped yet per STATE.md.
- Credentials live only in the local, git-ignored `.env.local` — nothing was pushed or logged elsewhere in this session.
