-- GavelNews article schema v2: hero/story/law_decode/exam_radar/challenge/
-- one_line_revision/visual_memory_card, on top of the existing v1 columns.
-- Field names match engine/supabase_sync.py::_story_to_payload() exactly
-- (schema_version=1 rows keep populating only the original v1 columns;
-- schema_version=2 rows populate these new ones, per that function's
-- docstring on dual-read support).
--
-- `sources` is unchanged (already jsonb) - it holds a v1 array or a v2
-- {primary, secondary} object depending on schema_version, per
-- _story_to_payload's sources_field logic.

alter table public.published_stories
  add column if not exists schema_version    integer not null default 1,
  add column if not exists hero              jsonb not null default '{}'::jsonb,
  add column if not exists story              jsonb not null default '{}'::jsonb,
  add column if not exists law_decode        jsonb not null default '{}'::jsonb,
  add column if not exists exam_radar        jsonb not null default '{}'::jsonb,
  add column if not exists challenge         jsonb not null default '{}'::jsonb,
  add column if not exists one_line_revision jsonb not null default '{}'::jsonb,
  add column if not exists visual_memory_card text;

create index if not exists idx_published_stories_schema_version
  on public.published_stories (schema_version);

-- Extend the public teaser view with the v2 public-facing fields (hero +
-- story block == the v2 equivalent of what_happened/background). The
-- deep-dive gated fields (law_decode/exam_radar/challenge/
-- one_line_revision/visual_memory_card) stay out of this view, same as
-- their v1 equivalents (what_actually_happening/exam_lens/quiz/etc.) -
-- those still require the service_role full-row read gated behind sign-in
-- (see lib/supabase/serviceRole.ts).
create or replace view public.published_stories_teaser
with (security_invoker = false) as
select
  id, edition_date, slug, title, category, exam_tags, reading_time_min,
  summary, what_happened, background, what_court_held, sources,
  decision, status, published_at, created_at,
  schema_version, hero, story
from public.published_stories
where status = 'published';

grant select on public.published_stories_teaser to anon, authenticated;
