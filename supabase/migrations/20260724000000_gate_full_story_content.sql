-- Close the anon-key gating gap: previously "published_stories_public_read"
-- exposed every column (including Legal Mentor / Exam Lens / quiz /
-- before_you_leave / pyq_question_ids) to the anon role, and
-- pyq_passages/pyq_questions were "using (true)" - fully open. Since the
-- app's own Supabase client also only ever holds the anon key, there was no
-- way to distinguish "the Next.js server rendering for a signed-in user"
-- from "anyone with the public anon key" - both present the identical
-- credential. Direct REST calls to Supabase (curl + the public
-- NEXT_PUBLIC_SUPABASE_ANON_KEY, visible in any deployed client bundle)
-- could read every gated field without ever signing in.
--
-- Fix: the anon/authenticated roles now only ever see a teaser-only view
-- (published_stories_teaser) - exactly what an unauthenticated visitor
-- already sees rendered on the site today. Full-row reads (Legal Mentor,
-- Exam Lens, quiz, PYQ) now require the service_role key, held only
-- server-side (SUPABASE_SERVICE_ROLE_KEY, never NEXT_PUBLIC_) and used only
-- when user.signedIn is true - see lib/supabase/serviceRole.ts. This
-- supersedes AGENTS.md/CLAUDE.md's older "this repo never holds
-- service_role" rule; see those files' updated wording.

drop policy if exists "published_stories_public_read" on public.published_stories;
drop policy if exists "pyq_passages_public_read" on public.pyq_passages;
drop policy if exists "pyq_questions_public_read" on public.pyq_questions;

-- Views run as their owner (not the querying role) by default in Postgres,
-- so this teaser view can still read the RLS-locked-down base table (the
-- migration-runner role owns it) while only ever emitting the columns
-- listed here - the column-level restriction anon-role RLS policies alone
-- can't express.
create view public.published_stories_teaser
with (security_invoker = false) as
select
  id, edition_date, slug, title, category, exam_tags, reading_time_min,
  summary, what_happened, background, what_court_held, sources,
  decision, status, published_at, created_at
from public.published_stories
where status = 'published';

grant select on public.published_stories_teaser to anon, authenticated;
