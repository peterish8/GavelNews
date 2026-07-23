-- Phase 1: Supabase Foundation & Reading-Flow Decision
-- published_stories schema, matching gavel-news engine's supabase_sync.py
-- payload field-for-field (see engine/supabase_sync.py::_story_to_payload).
--
-- Reading-flow decision (locked in .planning/STATE.md): story pages are
-- publicly readable as a teaser (title/summary/what_happened/background/
-- sources); deeper content (why_it_matters, key_points, PYQ, Legal Mentor
-- deep-dive, Exam Lens, quiz, before_you_leave) is still selected here (RLS
-- only gates row visibility, not column visibility) — the app layer gates
-- those fields behind sign-in, per app/story/[slug]/page.tsx.

create table if not exists public.published_stories (
  id                          text primary key,
  edition_date                date not null,
  slug                        text not null unique,
  title                       text not null,
  category                    text not null default 'legal-current-affairs',
  exam_tags                   jsonb not null default '["Both"]'::jsonb,
  reading_time_min            integer not null default 1,
  summary                     text,

  -- Public teaser
  what_happened               text not null default '',
  background                  text not null default '',
  what_court_held             text,
  why_it_matters              text not null default '',
  key_points                  jsonb not null default '[]'::jsonb,
  sources                     jsonb not null default '[]'::jsonb,

  decision                    text not null default 'must_cover',
  status                      text not null default 'published',
  published_at                timestamptz,

  -- Legal Mentor deep-dive (gated in the app)
  what_actually_happening     text,
  why_did_this_happen         text,
  important_terms             jsonb not null default '[]'::jsonb,
  law_behind_it               text,
  analogy                     text,
  friend_explanation          text,
  common_confusions           jsonb not null default '[]'::jsonb,

  -- Exam Lens (gated in the app)
  pyq_keyword                 text,
  exam_lens                   jsonb not null default '{}'::jsonb,

  -- Challenge + Answers: fixed, pre-authored quiz (gated in the app)
  quiz                        jsonb not null default '[]'::jsonb,

  -- Before You Leave
  before_you_leave            jsonb not null default '{}'::jsonb,

  created_at                  timestamptz not null default now()
);

create index if not exists idx_published_stories_edition_date on public.published_stories (edition_date desc);
create index if not exists idx_published_stories_category on public.published_stories (category);
create index if not exists idx_published_stories_status on public.published_stories (status);

alter table public.published_stories enable row level security;

-- Public/anon and signed-in users can read published rows. The engine repo
-- writes via the service_role key, which bypasses RLS entirely, so no
-- write policy is defined here (matches the "this repo never holds
-- service_role" rule in AGENTS.md/CLAUDE.md).
create policy "published_stories_public_read"
  on public.published_stories
  for select
  to anon, authenticated
  using (status = 'published');
