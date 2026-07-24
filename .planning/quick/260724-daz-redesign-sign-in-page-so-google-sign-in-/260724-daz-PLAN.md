---
quick_id: 260724-daz
status: planned
---

# Quick Task 260724-daz: Redesign sign-in page so Google sign-in CTA is visible above the fold on desktop (premium two-column layout)

**Created:** 2026-07-24

## Context

User complaint, verbatim from a live screenshot: "for google sign in they are scrolling
down! there is a friction! make it premium ui and sign in visible in opening this page
itself not scroll down!"

Root cause: `app/auth/signin/page.tsx` stacks everything in one narrow (`max-w-3xl`)
centered column — header, then `<AuthBenefits variant="full" .../>` (a tall two-column
comparison grid: 3 "Without signing in" items vs 8 "With free account" items, each with
title + detail text, in bordered cards), then the actual sign-in card with the Google
button, then a footer link. On any normal desktop viewport height (~800-1000px), the
benefits grid alone exceeds the fold, so the Google button — the entire point of the
page — requires scrolling to reach.

Fix: restructure the page into a two-column layout at the `lg` (1024px) breakpoint —
left column = headline area + the sign-in card (Google button), right column = the full
`AuthBenefits` comparison (persuasive/supporting content, free to run as tall as it
needs since it isn't required to complete the sign-in action). Below `lg`, the DOM order
changes so the sign-in card renders before the benefits comparison — same fold problem
exists on mobile, arguably worse, and the fix is the same underlying reorder.

Also elevate the visual polish of the sign-in card per "premium ui": make the Google
button the clear focal CTA (larger, stronger shadow/hover treatment), tighten card
spacing/hierarchy. Reuse only existing design tokens/utility classes already used in
this file and `AuthBenefits.tsx` (`surface-hero`, `label-law`, `heading-law`,
`brand`/`brand-soft`/`brand-border`, `ink`/`ink-2`/`ink-3`, `btn-press`) plus plain
Tailwind spacing/shadow utilities — no new colors, no new fonts, no new npm dependency.

**Scope boundaries:**
- Only `app/auth/signin/page.tsx` is edited. `AuthBenefits.tsx`'s "full" variant is read
  for context but does not need code changes — it already lays out its own responsive
  `sm:grid-cols-2` internally, which still renders correctly once placed inside the new
  right column.
- `AuthBenefits.tsx`'s "compact"/"panel" variants, `lib/auth-benefits.ts` data, and
  `lib/auth-actions.ts` (`signInWithGoogle`, `signInDevMode`, the OAuth flow itself) are
  NOT touched.
- No new UI/component library dependency (no headless-ui/radix) — plain Tailwind
  restructuring only.

## Task

1. Restructure `app/auth/signin/page.tsx` into a two-column layout + polish the sign-in
   card:
   - Widen the page container only at `lg`: change
     `mx-auto max-w-3xl px-5 py-10 md:py-14` to
     `mx-auto max-w-3xl lg:max-w-6xl px-5 py-10 md:py-14`. Header block above stays as
     today (centered, full container width) — no change needed there.
   - Wrap the sign-in card + `<AuthBenefits>` in a new grid container placed where
     `<AuthBenefits>` currently starts:
     `<div className="lg:grid lg:grid-cols-[26rem_1fr] lg:items-start lg:gap-12">`.
   - **Reorder the JSX so the sign-in card is the first child of that wrapper, before
     `<AuthBenefits>`** — an actual source-order swap, not a CSS `order-*` utility. This
     is the cleanest fix here because `AuthBenefits` is a separate component (already
     takes a `showCta` prop) with no ordering concerns of its own — moving the two
     sibling blocks in the parent's JSX satisfies both the mobile stacking order (card
     reads before the long benefits list) and the desktop left-column placement with a
     single change, and needs zero CSS trickery or extra wrapper `order` classes.
   - Sign-in card block: drop the current `mx-auto mt-8 max-w-md` and use
     `surface-hero mx-auto max-w-md p-6 sm:p-8 lg:sticky lg:top-16 lg:mx-0 lg:max-w-none lg:p-9`
     (no `mt-8` — spacing before it now comes from the header's existing `mb-8`; the
     `lg:sticky lg:top-16` keeps the CTA in view while the visitor scrolls the benefits
     column, reinforcing "always visible" beyond just the first paint).
   - Wrap `<AuthBenefits variant="full" nextPath={next} showCta={false} />` (props
     unchanged) in `<div className="mt-8 lg:mt-0">` so it keeps its own top gap on
     mobile/tablet but sits flush at the top of the right column on `lg`+.
   - Google button polish — replace the button's className
     (`btn-press inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border-app bg-elevated px-4 py-3 text-sm font-semibold text-ink hover:border-brand-border hover:bg-brand-soft`)
     with
     `btn-press inline-flex w-full items-center justify-center gap-3 rounded-md border border-border-app bg-elevated px-5 py-3.5 text-[15px] font-semibold text-ink shadow-sm transition-transform hover:-translate-y-0.5 hover:border-brand-border hover:bg-brand-soft hover:shadow-md`.
     `btn-press` already transitions `box-shadow`/`transform`, so the hover lift +
     shadow bump animate smoothly with no extra CSS. Do NOT switch the button to a
     solid `bg-brand` fill — that would clash with the multicolor Google "G" icon;
     the "focal CTA" upgrade comes from size, elevation, and motion, not fill color.
   - Bump `<GoogleIcon />`'s `width`/`height` from `18` to `20` to match the larger
     button.
   - Card internal spacing: bump the "Ready? Sign in takes a second" /
     "Sign in to open X" label from `mb-4 text-sm` to `mb-5 text-[15px]`.
   - Leave the error message block, the helper paragraph under the button, the
     dev-mode-only bypass block, and the "Keep reading without signing in" footer link
     structurally unchanged (they inherit the new card padding automatically).
   - Files: `app/auth/signin/page.tsx`
   - Verify: `pnpm exec tsc --noEmit` passes; `grep -n "surface-hero\|AuthBenefits" app/auth/signin/page.tsx` shows the `surface-hero` (sign-in card) line number is LOWER than the `<AuthBenefits` line number, confirming the JSX reorder landed.
   - Done: sign-in card is the first child inside the new `lg:grid` wrapper, both in
     source and in the compiled output; Google button uses the enlarged/shadowed
     classes; no `AuthBenefits.tsx`, `lib/auth-benefits.ts`, or `lib/auth-actions.ts`
     lines changed.

2. Viewport + visual verification:
   - Start the dev server (`pnpm dev`) and use the `/browse` skill to open
     `/auth/signin` (with a `next` param too, e.g. `/auth/signin?next=/favorites`, to
     check the "Unlock X" header variant as well as the default copy).
   - At **1440x900** and **1280x800** desktop viewports: confirm the "Continue with
     Google" button is fully visible with zero scrolling on initial page load, for both
     the default copy and the `?next=` "Unlock X" copy.
   - At a mobile width (~390px): confirm the sign-in card (with the Google button)
     renders and is visually reached before the "What you get with an account"
     comparison grid — i.e., a user scrolls past the header straight into the sign-in
     card, not through the full benefits comparison first.
   - Spot-check dark mode (theme toggle) at one desktop size — `surface-hero` and the
     token classes used are already theme-aware, confirm nothing looks broken.
   - Confirm no console errors and that the Google button, dev-bypass button (non-prod
     only), and "Keep reading without signing in" link are all still clickable.
   - Verify: visual confirmation per the steps above; report any viewport where the
     Google button still requires scrolling.
   - Done: Google button visible without scrolling at both desktop sizes checked;
     mobile reading order has the sign-in card before the benefits comparison; no
     regressions to dev-bypass/footer link/dark mode.

## Must-haves

- truths: On desktop (1440x900 and 1280x800), the "Continue with Google" button is
  visible without scrolling on page load, for both the default and `?next=` copy
  variants; on mobile, the sign-in card appears before the benefits comparison in
  scroll order; the Google button reads as the clear focal CTA (larger, elevated,
  animated on hover); dark mode still renders correctly.
- artifacts: `app/auth/signin/page.tsx` (only file modified)
- key_links: `components/AuthBenefits.tsx` (still called as
  `<AuthBenefits variant="full" nextPath={next} showCta={false} />`, props and internal
  rendering unchanged — its own `sm:grid-cols-2` layout still applies inside the new
  right column), `lib/auth-actions.ts` (`signInWithGoogle`/`signInDevMode` form actions
  unchanged), `lib/auth-benefits.ts` (`AUTH_BENEFITS`/`FREE_BENEFITS` data unchanged).
