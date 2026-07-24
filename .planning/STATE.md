# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-22)

**Core value:** A CLAT PG aspirant can sign up in under a minute and immediately get genuinely useful daily current-affairs content
**Current focus:** Phase 1 — Supabase Foundation & Reading-Flow Decision

## Current Position

Phase: 1 of 5 (Supabase Foundation & Reading-Flow Decision)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-07-22 — Roadmap created from requirements and research; ready to plan Phase 1

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: none yet
- Trend: N/A

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 1]: Teaser pattern chosen — story pages publicly readable in summary form (headline, summary, what happened, background, sources), full depth (key points, why it matters, PYQ) gated behind signup. Resolves the SEO-vs-login-wall tension research flagged as the top structural risk. Phase 1 must encode this in the `published_stories` RLS/read policy.
- [Pre-Phase 1]: This repo never holds the Supabase service-role key — writes to `published_stories` belong solely to the sibling `gavel-news` engine repo.
- [Pre-Phase 1]: Privacy Policy/Terms + explicit DPDP-compliant consent copy is a Phase 2 (v1) deliverable, not post-launch polish.
- [2026-07-23, Pre-Phase 1]: Folded the GavelNews Content Architecture (Legal Mentor deep-dive, Exam Lens, fixed pre-authored quiz) into Phase 1 (schema) and Phase 3 (rendering) rather than opening a new milestone — v1.0 hadn't started executing yet, so there was nothing shipped to avoid disrupting. Added CONTENT-09/10/11 to REQUIREMENTS.md and a Phase 1 success criterion for the matching schema fields. Moved the "five-question mastery quiz" Out-of-Scope entry in PROJECT.md to Active — the deferral was about a dynamic/scored/tracked quiz specifically; this fixed, stateless, pre-authored version isn't that build. Scored/tracked quiz attempts and revision-queue features remain deferred.
- [2026-07-23]: The sibling `gavel-news` engine repo's `editorial.py`/`db.py`/`mcp_server.py`/`supabase_sync.py`/`CLAUDE.md`/admin-preview were updated to produce and store the new fields (verified via the engine's own smoke test + a manual round-trip check). Phase 1's `published_stories` schema must match those exact snake_case field names.

### Pending Todos

None yet.

### Blockers/Concerns

- Supabase project "GavelNews" (ref `fewdjzjkdblnvzvtjzgz`) now exists and is linked via the CLI; anon URL/key are in local `.env.local` (260723-kv7). Schema/RLS/seed data still not shipped — Phase 1 work remains.
- Watch item (MEDIUM confidence per research): Next.js 16 renamed `middleware.ts`/`middleware()` to `proxy.ts`/`proxy()` — verify against the pinned Next.js version when Phase 2 (auth/session) is planned, not from tutorial code.
- [RESOLVED 2026-07-23]: Confirmed the "GavelNews" project exposes both legacy (`anon`/`service_role` JWTs) and new (`sb_publishable_...`/`sb_secret_...`) key formats side by side. `gavel-news-web`'s `.env.local` uses the legacy `anon` JWT (pulled 260723-kv7); the sibling `gavel-news` engine repo's new `.env` (2026-07-23, gitignored) uses the new `sb_secret_...` key for `SUPABASE_KEY` — verified working against the live project (auth succeeds; only error is "table not found", expected since Phase 1 schema isn't built yet). Formats don't need to match between anon/service sides; no action required, but worth switching `gavel-news-web` to `sb_publishable_...` for consistency if convenient during Phase 1.
- Watch item: Engine repo's actual field coverage for exam-relevance/category tagging is unverified — confirm `published_stories`' real field shape (via the engine repo's `editorial.py`/`supabase_sync.py`) before committing to filter UI in Phase 3.
- DPDP Act consent guidance used in Phase 2 is based on MEDIUM-confidence secondary sources, not primary statute — flag for real legal review before public launch.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260722-ur8 | Rewrite CLAUDE.md to be concise per best practices and create AGENTS.md | 2026-07-22 | b2e6eb9 | [260722-ur8-rewrite-claude-md-to-be-concise-per-best](./quick/260722-ur8-rewrite-claude-md-to-be-concise-per-best/) |
| 260722-w8i | Reduce excessive vertical whitespace in homepage hero section (app/page.tsx) | 2026-07-22 | 41242d7 | [260722-w8i-reduce-excessive-vertical-whitespace-in-](./quick/260722-w8i-reduce-excessive-vertical-whitespace-in-/) |
| 260722-wcu | Merge AppShell top header utility row and masthead row into one compact row | 2026-07-22 | 0597d8c | [260722-wcu-merge-appshell-top-header-utility-row-an](./quick/260722-wcu-merge-appshell-top-header-utility-row-an/) |
| 260722-wf7 | Center AppShell nameplate independent of search expand; stack Gavel News / Daily Legal Brief; bump font | 2026-07-22 | ff952d1 | [260722-wf7-center-appshell-nameplate-independent-of](./quick/260722-wf7-center-appshell-nameplate-independent-of/) |
| 260722-wgo | Add proper share button for story pages with Open Graph meta tags and Web Share API | 2026-07-22 | 4986528 | [260722-wgo-add-proper-share-button-for-story-pages-](./quick/260722-wgo-add-proper-share-button-for-story-pages-/) |
| 260722-wmp | Redesign PYQSidebar (Past CLAT questions box) to be bigger and better UI | 2026-07-22 | 3dfaa71 | [260722-wmp-redesign-pyqsidebar-past-clat-questions-](./quick/260722-wmp-redesign-pyqsidebar-past-clat-questions-/) |
| 260722-wzk | Upgrade Next.js 15.1.4 -> 15.5.21 to patch flagged CVEs (middleware auth bypass, React flight RCE, multiple DoS/XSS advisories) | 2026-07-22 | 54bdaf0 | [260722-wzk-upgrade-next-js-from-15-1-4-to-latest-pa](./quick/260722-wzk-upgrade-next-js-from-15-1-4-to-latest-pa/) |
| 260723-0vx | Make the per-story OG preview card professional (Source Serif 4 + IBM Plex Mono fonts) | 2026-07-23 | 849531d | [260723-0vx-make-the-per-story-og-preview-card-profe](./quick/260723-0vx-make-the-per-story-og-preview-card-profe/) |
| 260723-kv7 | Pull Supabase project credentials via CLI (project URL + anon key) and write them to .env.local, excluding service_role key | 2026-07-23 | (docs-only, .env.local is git-ignored) | [260723-kv7-pull-supabase-project-credentials-via-cl](./quick/260723-kv7-pull-supabase-project-credentials-via-cl/) |
| 260723-l3i | Fix dark-theme color issues: why-it-matters box, TTS pink accent -> red, footer invisible background | 2026-07-23 | 455ab82 | [260723-l3i-fix-dark-theme-color-issues-on-the-story](./quick/260723-l3i-fix-dark-theme-color-issues-on-the-story/) |
| 260723-krt | Redesign OG preview card into centered light-theme masthead (Gavel News wordmark + Daily Legal Brief tagline, mirroring the real site header) | 2026-07-23 | 76f3c2b | [260723-krt-redesign-og-card-into-centered-light-the](./quick/260723-krt-redesign-og-card-into-centered-light-the/) |
| 260723-m87 | Update CLAUDE.md and AGENTS.md to reflect current Next.js version (15.5.21), Supabase link status, and new components/lib files | 2026-07-23 | (pending) | [260723-m87-update-claude-md-and-agents-md-to-reflec](./quick/260723-m87-update-claude-md-and-agents-md-to-reflec/) |
| 260723-nmi | Make story TTS click-to-seek word-precise instead of sentence-precise | 2026-07-23 | 98bfe02 | [260723-nmi-make-story-tts-click-to-seek-word-precis](./quick/260723-nmi-make-story-tts-click-to-seek-word-precis/) |
| 260723-nwa | Re-skin sidebar/app-shell nav to remove AI-slop tells (boxed edition widget, repeated eyebrow, nested mobile pill) while preserving IA | 2026-07-23 | 66dc992 | [260723-nwa-re-skin-the-sidebar-app-shell-navigation](./quick/260723-nwa-re-skin-the-sidebar-app-shell-navigation/) |
| 260723-o65 | Fix low-contrast nav item titles in Sidebar - make them black/ink instead of muted ink-2 | 2026-07-23 | cebacf8 | [260723-o65-fix-low-contrast-nav-item-titles-in-side](./quick/260723-o65-fix-low-contrast-nav-item-titles-in-side/) |
| 260723-oan | Add Markdown rendering support for story body content (react-markdown + remark-gfm) instead of plain text | 2026-07-23 | c0b89f0 | [260723-oan-add-markdown-rendering-support-for-story](./quick/260723-oan-add-markdown-rendering-support-for-story/) |
| 260723-ox4 | Fix mismatched sidebar-header and top-header heights so their border lines align (both now h-16) | 2026-07-23 | d2418b1 | [260723-ox4-fix-mismatched-sidebar-header-and-top-he](./quick/260723-ox4-fix-mismatched-sidebar-header-and-top-he/) |
| 260723-pos | Redesign per-story OG image into a newspaper-masthead layout (masthead bar, brand panel + headline row, dark footer bar) | 2026-07-23 | (pending) | [260723-pos-redesign-per-story-og-image-into-a-newsp](./quick/260723-pos-redesign-per-story-og-image-into-a-newsp/) |
| 260723-ua1 | Give the nav a distinctive legal-editorial identity: brand-blend masthead rule, docket-index nav markers, § serif-italic section labels, left-rule active state | 2026-07-23 | ad2f4e9 | [260723-ua1-make-the-nav-bar-ui-look-better-and-more](./quick/260723-ua1-make-the-nav-bar-ui-look-better-and-more/) |
| 260723-vk1 | Fix PYQSidebar: render markdown in question/options/explanation text, and replace inline accordion with a full-screen modal on question click | 2026-07-23 | f1fc2e3, bd266d9 | [260723-vk1-fix-pyqsidebar-render-markdown-in-questi](./quick/260723-vk1-fix-pyqsidebar-render-markdown-in-questi/) |
| 260724-daz | Redesign sign-in page so Google sign-in CTA is visible above the fold on desktop (premium two-column layout) | 2026-07-24 | 1aad1d0 | [260724-daz-redesign-sign-in-page-so-google-sign-in-](./quick/260724-daz-redesign-sign-in-page-so-google-sign-in-/) |
| 260724-typ | Replace Inter/Libre/IBM Plex with Source legal stack; centralize type + theme tokens in app/system.css | 2026-07-24 | (pending) | [260724-typ-legal-font-system-source-of-truth](./quick/260724-typ-legal-font-system-source-of-truth/) |
| 260724-dpf | Polish sign-in page: shrink header footprint, add breathing room to sign-in card spacing | 2026-07-24 | (pending) | [260724-dpf-polish-sign-in-page-shrink-header-footpr](./quick/260724-dpf-polish-sign-in-page-shrink-header-footpr/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-22
Stopped at: ROADMAP.md and STATE.md created; REQUIREMENTS.md traceability confirmed
Resume file: None

Last activity: 2026-07-24 - Completed quick task 260724-dpf: Polish sign-in page — shrunk header footprint and widened sign-in card spacing per "congested" UI feedback
