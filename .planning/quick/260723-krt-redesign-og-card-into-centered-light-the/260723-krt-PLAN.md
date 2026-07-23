---
phase: quick-260723-krt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["app/story/[slug]/opengraph-image.tsx"]
autonomous: true
requirements: []
must_haves:
  truths:
    - "OG image background is a light hex (#F7F6FB, matching app/tokens.css --bg) instead of the red gradient, with every text color set explicitly per element instead of inherited from a single white `color` on the outer container"
    - "'Gavel News' wordmark renders centered at the top of the card, larger than the story headline below it (52px vs 46px), in bold serif dark ink (#130F2A) — the dominant visual element, mirroring components/AppShell.tsx's centered brand lockup"
    - "'DAILY LEGAL BRIEF' tagline renders centered directly beneath the wordmark in uppercase letter-spaced mono, muted ink (#857FA0)"
    - "A thin (2px) horizontal divider bar, 160px wide and centered, in the border token color (#E8D4D4), sits beneath the wordmark+tagline lockup with visible spacing above and below — echoing the border-b beneath AppShell's real site header"
    - "Category kicker renders centered in the brand red accent (#DC2626) instead of white/translucent, since it no longer sits on a red background"
    - "Story headline renders centered (textAlign: center), wraps across multiple lines within the 1200px canvas without overflowing or being cut off, in dark ink serif, and remains the most prominent text block after the wordmark"
    - "Footer line ('Daily CLAT Current Affairs') renders centered, small, muted mono"
    - "Route continues to return a valid 1200x630 PNG both when the Google Fonts fetch succeeds (real Source Serif 4 / IBM Plex Mono) and when it fails (generic sans-serif fallback) — the existing loadGoogleFont/Promise.all/try-catch logic and serifFamily/monoFamily derivation are completely untouched"
  artifacts:
    - path: "app/story/[slug]/opengraph-image.tsx"
      provides: "Centered, light-theme 'masthead' OG card JSX — wordmark, tagline, divider, kicker, headline, footer all recolored/recentered; loadGoogleFont font-loading logic unchanged"
      contains: "background: \"#F7F6FB\""
  key_links:
    - from: "app/story/[slug]/opengraph-image.tsx JSX tree"
      to: "serifFamily / monoFamily variables"
      via: "unchanged font-loading output consumed by the new centered layout's fontFamily style props"
      pattern: "serifFamily"
    - from: "app/story/[slug]/opengraph-image.tsx divider div"
      to: "app/tokens.css --border token (#E8D4D4)"
      via: "hardcoded hex literal (Satori cannot resolve CSS custom properties, same constraint as the existing gradient comment)"
      pattern: "#E8D4D4"
---

<objective>
Redesign the per-story OG preview card (`app/story/[slug]/opengraph-image.tsx`) from a left-aligned, white-on-red-gradient card into a centered, light-theme "masthead" layout that visually echoes the real site's `components/AppShell.tsx` header: centered "Gavel News" wordmark + "Daily Legal Brief" tagline on a light background, with a divider line beneath — the same visual grammar as AppShell's `border-b` under its header row.

Purpose: the current red-gradient card reads as a generic AI-placeholder aesthetic. Mirroring the real site's actual light-theme masthead makes the shared preview instantly recognizable as "the real site" rather than a disconnected marketing graphic.

Output: `app/story/[slug]/opengraph-image.tsx` with only its returned JSX tree and inline styles changed — background switches to `#F7F6FB`, layout becomes vertically centered (`alignItems: "center"`), every text node gets an explicit color from the confirmed token set, a new divider bar is added, and font sizes are rebalanced so the wordmark is the single largest element with the headline second-largest. The `loadGoogleFont` helper, the `Promise.all`/try-catch font-loading block, and the `serifFamily`/`monoFamily` derivation are not touched.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/story/[slug]/opengraph-image.tsx
@components/AppShell.tsx
@lib/types.ts

Confirmed light-theme token values from `app/tokens.css` (ground truth, do not re-derive):
- `--bg`: `#F7F6FB` — chosen over pure `#FFFFFF` for the card background, because this card is meant to visually echo AppShell's real header, whose actual background is `bg-[color-mix(in_srgb,var(--bg)_94%,transparent)]` (i.e. `--bg`, not white) per `components/AppShell.tsx` line ~102. Using the same near-white `#F7F6FB` rather than pure white makes the OG card read as "the real app's header" rather than a generic white card.
- `--ink`: `#130F2A` (wordmark, headline)
- `--ink-3`: `#857FA0` (tagline, footer — muted)
- `--brand`: `#DC2626` (kicker — brand red accent)
- `--border`: `#E8D4D4` (divider line)

Real site header this must echo (`components/AppShell.tsx` lines ~102, ~127-138): a `border-b border-border-app` header containing a centered `Link` with a stacked `font-serif font-bold ... text-ink` wordmark ("Gavel News") directly above a `font-mono ... uppercase tracking-[0.14em] text-ink-3` tagline ("Daily Legal Brief") — the `border-b` divider is the direct visual precedent for this plan's new divider bar.

<interfaces>
Target JSX tree to replace the current `return new ImageResponse((...), {...})` argument with. `serifFamily`, `monoFamily`, `kicker`, and `title` are pre-existing variables from the unchanged code above this return statement — reuse them as-is, do not rename or redefine.

Outer container: `display: "flex"`, `flexDirection: "column"`, `alignItems: "center"` (new — was unset/stretch), `justifyContent: "space-between"` (kept, proven to distribute 3 top-level groups across the fixed 630px height), `width: "1200px"`, `height: "630px"`, `padding: "72px"` (was `64px`), `background: "#F7F6FB"` (was the red gradient — remove the `background: "linear-gradient(...)"` line and its comment entirely), no `color` property (was `color: "#ffffff"` — removed, each child sets its own color), `fontFamily: serifFamily` (kept as base).

Three top-level children of the outer container, matching the outer's `justifyContent: "space-between"`:

1. **Masthead group** (`display: "flex"`, `flexDirection: "column"`, `alignItems: "center"`, `gap: 12`), containing three children in order:
   - Wordmark div: text `Gavel News`, style `display: "flex"`, `fontFamily: serifFamily`, `fontSize: 52`, `fontWeight: 700`, `letterSpacing: -0.5`, `color: "#130F2A"`.
   - Tagline div: text `DAILY LEGAL BRIEF`, style `display: "flex"`, `fontFamily: monoFamily`, `fontSize: 15`, `fontWeight: 500`, `textTransform: "uppercase"`, `letterSpacing: 2.5`, `color: "#857FA0"`.
   - Divider div: no text content (empty div), style `display: "flex"`, `width: "160px"`, `height: "2px"`, `background: "#E8D4D4"`, `marginTop: 28` (the group's `gap: 12` already spaces wordmark from tagline; this explicit `marginTop` gives the divider extra breathing room below the tagline, satisfying "spacing above" — "spacing below" comes from the outer `justifyContent: "space-between"` gap to the next group).

2. **Story group** (`display: "flex"`, `flexDirection: "column"`, `alignItems: "center"`, `gap: 24`), containing two children in order:
   - Kicker div: text `{kicker}`, style `display: "flex"`, `fontFamily: monoFamily`, `fontSize: 22`, `fontWeight: 600`, `textTransform: "uppercase"`, `letterSpacing: 2`, `color: "#DC2626"`.
   - Headline div: text `{title}`, style `display: "flex"`, `fontFamily: serifFamily`, `fontSize: 46`, `fontWeight: 700`, `lineHeight: 1.2`, `color: "#130F2A"`, `textAlign: "center"`, `width: "1040px"` (explicit width is required — with the outer's new `alignItems: "center"`, flex children no longer stretch to the container's cross-axis width by default, so without this the headline div would shrink-wrap to its text's natural width and either fail to wrap or render off-center; `1040px` fits inside the `1200 - 2*72 = 1056px` padded content area with a small margin, giving multi-line titles room to wrap while staying centered).

3. **Footer div** (single node, not a group): text `Daily CLAT Current Affairs`, style `display: "flex"`, `fontFamily: monoFamily`, `fontSize: 18`, `color: "#857FA0"`.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Replace the OG card JSX with the centered light-theme masthead layout</name>
  <files>app/story/[slug]/opengraph-image.tsx</files>
  <action>
Replace only the JSX tree passed as the first argument to `new ImageResponse(...)` (everything from the outer `<div style={{...}}>` down through its closing `</div>`) with the structure specified in the `<interfaces>` block above, verbatim on values. Do not touch anything above that return statement — `loadGoogleFont`, the `Promise.all`/try-catch block, the `kicker`/`title` derivation, the `serifText`/`monoText` subset-string construction, or the `serifFamily`/`monoFamily` variables must be byte-identical to the current file.

Specifically:
1. Outer container: add `alignItems: "center"`, change `padding` from `"64px"` to `"72px"`, replace the `background: "linear-gradient(...)"` line and its preceding comment with `background: "#F7F6FB"`, delete the `color: "#ffffff"` line entirely (no top-level color — every descendant sets its own).
2. First child: the masthead group (wordmark + tagline + divider) exactly as specified in `<interfaces>`, replacing the current wordmark-only lockup div. The tagline div is new — it does not exist in the current file with these values; add it. The divider div is entirely new.
3. Second child: the story group (kicker + headline) exactly as specified in `<interfaces>` — reuse the existing `{kicker}` and `{title}` JSX expressions unchanged, only restyling their wrapping `<div>` elements' inline `style` objects (kicker gains `color: "#DC2626"`; headline gains `color: "#130F2A"`, `textAlign: "center"`, `width: "1040px"`, and its `fontSize` changes from `56` to `46`, `lineHeight` from `1.15` to `1.2`).
4. Third child: the footer div, reusing the existing `Daily CLAT Current Affairs` text, restyled per `<interfaces>` (`fontSize` from `20` to `18`, `color: "#857FA0"` replacing `opacity: 0.85`).

Do not modify the second argument to `ImageResponse` (`{ width: 1200, height: 630, ...(fonts ? { fonts } : {}) }`) — leave it exactly as-is.

After editing, re-read the full file once to confirm no leftover references to the old gradient, `color: "#ffffff"`, `opacity:`-based text dimming, or the old `fontSize: 34` / `fontSize: 56` / `fontSize: 20` values remain anywhere in the returned JSX.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>`app/story/[slug]/opengraph-image.tsx`'s returned JSX has: outer container with `alignItems: "center"`, `background: "#F7F6FB"`, `padding: "72px"`, no top-level `color`; a masthead group with wordmark (52px serif, `#130F2A`), tagline (15px mono uppercase, `#857FA0`), and a 160px x 2px divider (`#E8D4D4`); a story group with kicker (`#DC2626` mono uppercase) and centered headline (46px serif, `#130F2A`, `textAlign: "center"`, `width: "1040px"`); a footer line (18px mono, `#857FA0`); `loadGoogleFont` and the font-loading try/catch are byte-identical to before this task; `npx tsc --noEmit` passes with zero errors.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Edge route -> Google Fonts CDN | Pre-existing from the prior OG-card plan (260723-0vx) — `loadGoogleFont`'s outbound fetches to `fonts.googleapis.com`/`fonts.gstatic.com`. This plan does not modify that code path at all; it is listed here only because the manual verification steps below deliberately exercise its fallback behavior. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick260723krt-01 | Denial of Service | `loadGoogleFont` (unchanged) | accept (carried forward) | Already mitigated by the prior plan's `AbortSignal.timeout(4000)` + try/catch fallback to generic sans-serif; this plan makes zero changes to that logic. Manual verification re-confirms the fallback still produces a valid PNG under the new color scheme, it does not introduce new risk. |
| T-quick260723krt-02 | Tampering | Inline hardcoded hex color values (`#F7F6FB`, `#130F2A`, `#857FA0`, `#DC2626`, `#E8D4D4`) | accept | These are static string literals copied directly from `app/tokens.css`, not derived from any request input — there is no injectable/attacker-controlled path into these values, consistent with the pre-existing hardcoded-gradient pattern this plan replaces. |

No new npm dependency, no new external request path, and no new user-input handling are introduced by this plan — it is a pure JSX/inline-style restyle of an already-network-hardened route.
</threat_model>

<verification>
1. `npx tsc --noEmit` passes with zero errors.
2. Manual/visual check (unavoidable — no snapshot testing in this repo), local:
   - Run `pnpm dev`, then fetch `http://localhost:3000/story/governor-article-200-pocket-veto/opengraph-image` (or any other mock slug, or a nonexistent slug for the "Daily CLAT Current Affairs" fallback title) via `curl -o og-local.png <url>` and open the resulting PNG.
   - Confirm: light `#F7F6FB` background (not red gradient); centered "Gavel News" wordmark larger than the headline below it, in dark serif; centered uppercase "DAILY LEGAL BRIEF" tagline in muted mono directly beneath it; a visible thin centered divider line beneath the tagline; centered red uppercase category kicker; centered, wrapped (if long), dark serif headline; centered small muted footer line.
3. Manual/visual check, font-fallback path (local):
   - Temporarily break the Google Fonts URL in `loadGoogleFont` (e.g. typo `fonts.googleapis.com`), re-fetch the same route, confirm it still returns a valid PNG in the same light/centered/colored layout (generic sans-serif substituting for Source Serif 4 / IBM Plex Mono, not a crash or 500) — then revert the deliberate breakage before committing.
4. Manual/visual check, production, after this change is deployed:
   - Fetch an OG image URL from `https://gavelnews.vercel.app/story/<real-slug>/opengraph-image` and visually confirm the same centered masthead layout and colors render correctly on the live deployment.
</verification>

<success_criteria>
- OG card background is `#F7F6FB` (light), not the red gradient.
- Layout is vertically centered top-to-bottom (`alignItems: "center"`) with wordmark, tagline, divider, kicker, headline, and footer all horizontally centered.
- Wordmark (52px) is the single largest text element; headline (46px) is second-largest and remains centered with sensible multi-line wrapping.
- Every text node has an explicit color from the confirmed token set (`#130F2A`, `#857FA0`, `#DC2626`) — no hardcoded white, no opacity-based dimming.
- A 160px x 2px `#E8D4D4` divider renders centered beneath the wordmark+tagline lockup.
- `loadGoogleFont`, the `Promise.all`/try-catch font-loading block, and the graceful-fallback behavior are completely unchanged and still function (verified locally by deliberately breaking and reverting the font URL).
- `npx tsc --noEmit` passes with zero errors.
- No new npm dependency added.
</success_criteria>

<output>
Create `.planning/quick/260723-krt-redesign-og-card-into-centered-light-the/260723-krt-SUMMARY.md` when done
</output>
