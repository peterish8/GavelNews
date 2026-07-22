---
phase: quick-260722-wzk
plan: 01
subsystem: infra
tags: [nextjs, dependency-bump, security-patch, eslint-config-next]

# Dependency graph
requires: []
provides:
  - next and eslint-config-next pinned to 15.5.21, closing CVE-2025-29927 (middleware auth bypass), the React Flight protocol RCE, and all other pnpm-audit/Vercel-flagged Next.js advisories on the 15.x line
affects: [any future phase touching next.config.ts, middleware/proxy, or opengraph-image routes]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: [package.json, pnpm-lock.yaml]

key-decisions:
  - "Stayed on Next.js 15.x line (15.5.21) rather than Next 16, per CLAUDE.md scope constraint — no middleware.ts to proxy.ts migration needed"
  - "Left react/react-dom/@types packages untouched — 19.0.0 already satisfies 15.5.21's ^19.0.0 peer range"

patterns-established: []

requirements-completed: [SECURITY-PATCH]

# Metrics
duration: 12min
completed: 2026-07-23
---

# Phase quick-260722-wzk: Upgrade Next.js from 15.1.4 to 15.5.21 Summary

**Bumped next + eslint-config-next from 15.1.4 to 15.5.21 (patched Next.js 15.x line), closing CVE-2025-29927 and all other pnpm-audit-flagged Next.js advisories with zero application-code changes**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-22T18:21:04Z
- **Completed:** 2026-07-22T18:33:06Z
- **Tasks:** 2 completed
- **Files modified:** 2 (package.json, pnpm-lock.yaml)

## Accomplishments
- `next` and `eslint-config-next` both bumped to 15.5.21, regenerated `pnpm-lock.yaml` via `pnpm install` with zero peer-dependency warnings for next/react/react-dom
- Full verification gate passed: `npx tsc --noEmit` (zero errors), `pnpm run build` (exit 0), confirmed `/story/[slug]/opengraph-image` still marked dynamic (`ƒ`) in the build output route table — not statically optimized away
- Confirmed no `middleware.ts` exists anywhere in the repo — the CVE-2025-29927 x-middleware-subrequest fix has no custom application logic at risk here; risk item cleared by absence
- `pnpm audit` confirms zero remaining Next.js-specific advisories (all previously-flagged next-related CVEs — middleware bypass, React Flight RCE, DoS/SSRF/smuggling — are gone)

## Task Commits

Each task was committed atomically:

1. **Task 1: Bump next + eslint-config-next to 15.5.21 and regenerate lockfile** - `54bdaf0` (fix)
2. **Task 2: Run full verification gate and confirm risk items cleared** - no commit (verification-only task, zero files modified, as specified in the plan)

**Plan metadata:** (handled by orchestrator's docs commit, not included here)

## Files Created/Modified
- `package.json` - `next` dependency and `eslint-config-next` devDependency bumped 15.1.4 -> 15.5.21
- `pnpm-lock.yaml` - Regenerated via `pnpm install` to match new resolution (205 insertions, 197 deletions)

## Decisions Made
- Stayed on the Next.js 15.x line (15.5.21, the latest patched non-canary release) rather than migrating to Next 16, per the existing CLAUDE.md constraint that the `middleware.ts` -> `proxy.ts` rename is out of scope until a dedicated Next 16 migration phase.
- Did not touch react/react-dom/@types/react/@types/react-dom — already-verified compatible per the plan's peer-dependency research (react/react-dom 19.0.0 satisfy 15.5.21's `^19.0.0` peer range).

## Deviations from Plan

None - plan executed exactly as written. Zero application code was changed; only `package.json` and `pnpm-lock.yaml` were modified, and the verification gate passed without surfacing any breaking-change error requiring a code fix.

## Issues Encountered

- **`pnpm test` (vitest) exits with "No test files found" (exit code 1).** Investigated and confirmed this is a pre-existing, dependency-independent condition: a full repo-wide search (excluding `node_modules`/`.git`) found zero `*.test.*` or `*.spec.*` files anywhere in the codebase, and the `test` script (`vitest run`) and vitest config are unchanged from the pre-bump commit (verified via `git show` against `1a37b79`, read-only, no working-tree mutation). This is out of scope per the deviation-rules scope boundary ("pre-existing... failures in unrelated files are out of scope") and per the plan's own framing (dependency-bump task only, no code changes unless the bump itself surfaces a breaking change). The plan's verification criterion ("same test count/pass rate as before the bump") is satisfied vacuously — 0 tests before, 0 tests after, identical outcome, no regression introduced by the Next.js/eslint-config-next version change.
- **Build shows an ESLint plugin conflict warning** ("Plugin \"@next/next\" was conflicted between `.eslintrc.json » eslint-config-next/core-web-vitals`...") and a Next.js "detected multiple lockfiles" warning. Both are artifacts of running the build inside a nested git worktree (`.claude/worktrees/agent-.../`) that sits under the parent checkout, which itself has its own `.eslintrc.json`/`pnpm-lock.yaml` — an environment characteristic of the worktree setup, not a regression introduced by the dependency bump. Build still exits 0 and completes successfully; not fixed, as it's outside this task's scope (worktree tooling, not the next.js dependency itself).
- **Self-correction note:** while investigating the vitest "no test files" result, I initially ran `git stash` to try to inspect the pre-bump state. It printed "No local changes to save" (the working tree was already clean/committed) and was immediately abandoned in favor of the sanctioned read-only `git show <ref>:<path>` alternative — no `stash pop` was run and no state was mutated. Flagging for transparency per the destructive-git-operations prohibition, even though this instance was a no-op.

## User Setup Required

None - no external service configuration required. This is a dependency-only patch; no environment variables, dashboard steps, or manual verification needed beyond what's documented above.

## Next Phase Readiness
- Vercel's "Vulnerable version of Next.js detected" build warning should now be cleared on next deploy.
- `next` and `eslint-config-next` are aligned at 15.5.21, ready for a future dedicated Next 16 migration phase (which will need to handle the `middleware.ts` -> `proxy.ts` rename — not applicable yet since no middleware.ts exists).
- Pre-existing gap: this repo has zero automated tests. Not a blocker for this task, but worth flagging for a future testing-infrastructure phase since `pnpm test` currently only "passes" by having nothing to run.

---
*Phase: quick-260722-wzk*
*Completed: 2026-07-23*

## Self-Check: PASSED

- FOUND: package.json
- FOUND: pnpm-lock.yaml
- FOUND: .planning/quick/260722-wzk-upgrade-next-js-from-15-1-4-to-latest-pa/260722-wzk-SUMMARY.md
- FOUND: commit 54bdaf0
