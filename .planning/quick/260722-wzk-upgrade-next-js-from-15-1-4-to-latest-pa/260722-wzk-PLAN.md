---
phase: quick-260722-wzk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, pnpm-lock.yaml]
autonomous: true
requirements: [SECURITY-PATCH]
must_haves:
  truths:
    - "pnpm audit no longer lists any of the previously-flagged next advisories (CVE-2025-29927 and all higher/lower-severity DoS/XSS/cache-poisoning advisories listed in the task brief)"
    - "The app builds and typechecks successfully on the new Next.js version with zero code changes beyond dependency bumps"
    - "The opengraph-image.tsx route still renders as a dynamic/edge function in the build output, not statically optimized away"
    - "Existing test suite still passes unchanged"
  artifacts:
    - path: "package.json"
      provides: "next and eslint-config-next pinned to the same patched 15.x version"
      contains: "\"next\": \"15.5.21\""
    - path: "pnpm-lock.yaml"
      provides: "Regenerated lockfile matching the new next/eslint-config-next resolution"
  key_links:
    - from: "package.json"
      to: "pnpm-lock.yaml"
      via: "pnpm install"
      pattern: "next@15\\.5\\.21"
---

<objective>
Bump next and eslint-config-next from 15.1.4 to 15.5.21 (the latest patched release on the Next.js 15.x line) to close every vulnerability flagged by pnpm audit and Vercel's build warning, without migrating to Next 16 and without touching any application code unless the build/typecheck/test gate forces a fix.

Purpose: Vercel is refusing to build cleanly ("Vulnerable version of Next.js detected") and pnpm audit lists one critical (CVE-2025-29927, middleware auth bypass), one critical RCE (React flight protocol), and multiple high-severity DoS/SSRF/smuggling advisories -- all patched by 15.5.21 while staying on the pinned 15.x major (per CLAUDE.md, Next 16 migration -- including the middleware.ts to proxy.ts rename -- is explicitly out of scope).

Output: Updated package.json (next + eslint-config-next at 15.5.21), regenerated pnpm-lock.yaml, a clean tsc --noEmit / pnpm run build / pnpm test run, and an explicit note confirming the two flagged risk areas (middleware, opengraph-image edge route) were checked.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@package.json
@next.config.ts
@app/story/[slug]/opengraph-image.tsx

<verified_facts>
- No middleware.ts exists anywhere in this repo (confirmed via filesystem check during planning) -- the CVE-2025-29927 x-middleware-subrequest header-validation fix has no application code to interact with here. This must still be stated explicitly in the SUMMARY as a checked-and-cleared risk item, not silently skipped.
- npm view next versions --json shows 15.5.21 as the newest stable (non-canary, non-rc) release on the 15.x line as of 2026-07-22. Do NOT install 15.6.0-canary.*, 16.x, or any -rc/-beta tag.
- npm view next@15.5.21 peerDependencies shows react: "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0", react-dom identical. Currently pinned react@19.0.0 / react-dom@19.0.0 satisfy ^19.0.0 -- do NOT bump React or its types packages.
- eslint-config-next@15.5.21 exists on npm and matches the next version exactly -- keep both pinned to the identical version string per existing repo convention (both were 15.1.4 before this change).
- next.config.ts has no experimental flags or edge-runtime config that changed between 15.1 and 15.5 -- no config-file changes anticipated.
- app/story/[slug]/opengraph-image.tsx uses export const runtime = "edge" and next/og's ImageResponse with the standard Next.js Metadata Files convention (Image default export, alt/size/contentType exports) -- this API surface is unchanged across 15.1 to 15.5. Expected build-output line to confirm post-bump: a route entry for /story/[slug]/opengraph-image marked with the dynamic-function symbol (f), not the static/prerendered symbol.
</verified_facts>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Bump next + eslint-config-next to 15.5.21 and regenerate lockfile</name>
  <files>package.json, pnpm-lock.yaml</files>
  <action>
    In package.json, change the next dependency version from 15.1.4 to 15.5.21, and the eslint-config-next devDependency version from 15.1.4 to 15.5.21. Do not touch react, react-dom, @types/react, @types/react-dom, or any other dependency -- their versions already satisfy 15.5.21's peer requirements (verified: react/react-dom 19.0.0 satisfy peer range ^19.0.0). Run pnpm install to regenerate pnpm-lock.yaml against the new resolution. Do not manually edit pnpm-lock.yaml -- let pnpm regenerate it.
  </action>
  <verify>
    <automated>cd "c:\Users\nithy\Desktop\.website-production\gavel-news-web" && node -e "const p=require('./package.json'); if(p.dependencies.next!=='15.5.21'||p.devDependencies['eslint-config-next']!=='15.5.21'){process.exit(1)}; console.log('versions OK')"</automated>
  </verify>
  <done>package.json shows next@15.5.21 and eslint-config-next@15.5.21; pnpm-lock.yaml regenerated with matching resolved versions and no install errors or peer-dependency warnings for next/react/react-dom.</done>
</task>

<task type="auto">
  <name>Task 2: Run full verification gate and confirm risk items cleared</name>
  <files>None expected (verification only -- fix only what tsc/build surfaces as a real breaking-change error, nothing else)</files>
  <action>
    Run three checks in sequence, stopping to fix (minimally, only what's required to pass) if any fails: (1) npx tsc --noEmit -- must complete with zero errors; (2) pnpm run build -- must complete successfully; capture the "Route (app)" output table and confirm the entry for /story/[slug]/opengraph-image still carries the dynamic-function marker, not a static marker; (3) pnpm test (vitest) -- all existing tests must pass unchanged. Additionally confirm that no middleware.ts file exists at the repo root -- this is the explicit CVE-2025-29927 risk check called for in the task brief; since there is no middleware file, there is no custom header-validation logic the fix could break, so this item is cleared by absence, not by a code change. If pnpm audit is available, run it once as a final confirmation that the previously-flagged next advisories no longer appear (informational confirmation only -- the vulnerability list itself was already given as ground truth and is not being re-derived).
  </action>
  <verify>
    <automated>cd "c:\Users\nithy\Desktop\.website-production\gavel-news-web" && npx tsc --noEmit && pnpm run build && pnpm test</automated>
  </verify>
  <done>tsc, build, and test all pass with zero code changes beyond package.json/pnpm-lock.yaml; opengraph-image route confirmed dynamic in build output; middleware.ts absence confirmed and documented as the CVE-2025-29927 risk check outcome; pnpm audit (if run) shows no next-related advisories remaining.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|--------------|
| Vercel build pipeline -> deployed app | Dependency supply chain: the next/eslint-config-next versions installed here become the runtime shipped to production |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|------------------|
| T-quick-01 | Elevation of Privilege | Next.js middleware layer (CVE-2025-29927) | mitigate | Upgrade to next@15.5.21 (patched >=15.2.3); no middleware.ts exists in this repo so there is no custom logic at risk, but the framework-level bypass vector is closed by the version bump regardless. |
| T-quick-02 | Tampering / Information Disclosure | React Flight protocol RCE, Server Components DoS/SSRF/smuggling advisories | mitigate | Upgrade to next@15.5.21, which is >= all patched thresholds listed in the known_vulnerabilities brief (15.1.9 through 15.5.16). |
| T-quick-SC | Tampering | pnpm install of next@15.5.21 / eslint-config-next@15.5.21 | accept | Both are official, high-download-count packages published by the Vercel org under the existing `next` namespace already in use -- not new/unknown packages requiring a legitimacy checkpoint. |
</threat_model>

<verification>
1. `node -e "console.log(require('./package.json').dependencies.next, require('./package.json').devDependencies['eslint-config-next'])"` prints `15.5.21 15.5.21`.
2. `npx tsc --noEmit` exits 0.
3. `pnpm run build` exits 0; build output's Route (app) table shows `/story/[slug]/opengraph-image` marked as a dynamic function, not statically prerendered.
4. `pnpm test` (vitest) exits 0 with the same test count/pass rate as before the bump.
5. Confirm no `middleware.ts` file exists at repo root (already true pre-bump; re-confirm post-bump nothing added it).
</verification>

<success_criteria>
- next and eslint-config-next both pinned to 15.5.21 in package.json, pnpm-lock.yaml regenerated to match.
- react/react-dom/@types packages unchanged.
- tsc, build, and test all pass cleanly with zero non-dependency code changes (or only the minimal fix required if the build/typecheck surfaced a genuine breaking change).
- opengraph-image route confirmed still dynamic/edge post-bump.
- middleware.ts risk item explicitly confirmed absent/cleared in the SUMMARY, not silently omitted.
</success_criteria>

<output>
Create `.planning/quick/260722-wzk-upgrade-next-js-from-15-1-4-to-latest-pa/260722-wzk-SUMMARY.md` when done
</output>
