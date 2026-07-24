-- Data cleanup to match the v2 schema field removal (law_decode.static_connections
-- and exam_radar.likely_questions dropped from the authoring contract - see
-- engine repo commit 1df2b6e and gavel-news-web commit 46dadc3). Strips the
-- now-unused keys from already-synced schema_version=2 rows so the stored
-- JSON matches what the app actually reads/writes going forward.
--
-- The jsonb `-` operator removes a key if present and is a no-op otherwise,
-- so this is safe to re-run and safe against rows that never had these keys.

update public.published_stories
set law_decode = law_decode - 'static_connections'
where schema_version = 2
  and law_decode ? 'static_connections';

update public.published_stories
set exam_radar = exam_radar - 'likely_questions'
where schema_version = 2
  and exam_radar ? 'likely_questions';
