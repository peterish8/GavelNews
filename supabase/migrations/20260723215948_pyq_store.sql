-- Shared, reusable PYQ store. Grows incrementally: only questions a story
-- actually links to (via published_stories.pyq_question_ids, verified by
-- the gavel-news engine's search_pyqs against the real ingested CLAT PG
-- corpus) ever land here - never a bulk dump of the whole corpus. The same
-- question row can be linked from any number of current-affairs stories.

create table if not exists public.pyq_passages (
  id             text primary key,   -- e.g. '2021_P08'
  exam           text not null,
  year           integer not null,
  passage_number integer,
  text           text not null default '',
  topic          text,
  concept        text,
  created_at     timestamptz not null default now()
);

create table if not exists public.pyq_questions (
  id              text primary key,   -- e.g. '2021_P05_Q043'
  passage_id      text references public.pyq_passages(id) on delete set null,
  exam            text not null,
  year            integer not null,
  question_number integer,
  question_text   text not null default '',
  option_a        text,
  option_b        text,
  option_c        text,
  option_d        text,
  correct_answer  text,   -- 'A' | 'B' | 'C' | 'D'
  explanation     text,
  topic           text,
  difficulty      text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pyq_questions_passage on public.pyq_questions (passage_id);

-- Link stories to the specific verified questions they cite.
alter table public.published_stories
  add column if not exists pyq_question_ids jsonb not null default '[]'::jsonb;

alter table public.pyq_passages enable row level security;
alter table public.pyq_questions enable row level security;

-- Public/anon and signed-in users can read PYQ content. Writes are done by
-- the engine repo's service_role key (bypasses RLS), same pattern as
-- published_stories.
create policy "pyq_passages_public_read"
  on public.pyq_passages for select
  to anon, authenticated
  using (true);

create policy "pyq_questions_public_read"
  on public.pyq_questions for select
  to anon, authenticated
  using (true);
