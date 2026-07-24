---
quick_id: 260724-dpf
status: planned
---

# Quick Task 260724-dpf: Polish sign-in page — shrink header, add card breathing room

**Created:** 2026-07-24

## Context

User feedback from a live screenshot of the just-shipped two-column sign-in page
(quick task 260724-daz): "this is congested not a good ui! make it good reduce
height in top and put google in below but then if loaded it shld show not
scrolling like"

Two concrete complaints:
1. The intro header block (eyebrow + `h1` + subhead) is too tall relative to its
   importance — it reads as a hero section when the sign-in card is the actual
   point of the page.
2. The sign-in card itself feels visually cramped — title, Google button,
   helper text, "LOCAL DEV ONLY" divider, and dev-bypass button are all bunched
   tightly with too little breathing room, reading as a packed list rather than
   a premium card.

Hard constraint carried over from 260724-daz, unchanged: the "Continue with
Google" button must remain fully visible without scrolling at normal desktop
viewport sizes (1440x900, 1280x800) after this change. Shrinking the header
should make this easier, not harder — verify explicitly.

**Scope boundaries:** only `app/auth/signin/page.tsx`'s header block and
sign-in card spacing/sizing are touched. The two-column grid structure, the
JSX ordering (sign-in card before `AuthBenefits`), `AuthBenefits.tsx`,
`lib/auth-actions.ts`, and `lib/auth-benefits.ts` are unchanged — all correct
as-is from the prior task.

## Task

1. Shrink the header block and add breathing room to the sign-in card in
   `app/auth/signin/page.tsx`:

   **Header shrink:**
   - Outer container: `mx-auto max-w-3xl lg:max-w-6xl px-5 py-10 md:py-14` →
     `mx-auto max-w-3xl lg:max-w-6xl px-5 py-6 md:py-8` (roughly halves the
     top/bottom page padding).
   - Header text wrapper: `mb-8 text-center` → `mb-6 text-center`.
   - `h1`: `heading-law text-3xl md:text-4xl` → `heading-law text-2xl md:text-3xl`
     (steps the heading down one size at each breakpoint).
   - Subhead paragraph: `mx-auto mt-2 max-w-lg font-serif text-sm leading-relaxed text-ink-2 md:text-base`
     → `mx-auto mt-1.5 max-w-lg font-serif text-sm leading-relaxed text-ink-2`
     (drop the `md:text-base` step-up so the subhead stays compact at desktop
     too; tighten the top margin slightly).

   **Card breathing room:**
   - Card wrapper: `surface-hero mx-auto max-w-md p-6 sm:p-8 lg:sticky lg:top-16 lg:mx-0 lg:max-w-none lg:p-9`
     → `surface-hero mx-auto max-w-md p-7 sm:p-9 lg:sticky lg:top-16 lg:mx-0 lg:max-w-none lg:p-10`
     (bump padding one step at each breakpoint).
   - Card title: `mb-5 text-center text-[15px] font-semibold text-ink` →
     `mb-6 text-center text-[15px] font-semibold text-ink`.
   - Google form: `<form action={signInWithGoogle} className="mb-3">` →
     `<form action={signInWithGoogle} className="mb-4">`.
   - Dev-bypass divider: `my-4 flex items-center gap-2 ...` →
     `my-6 flex items-center gap-2 ...`.
   - Leave the error-message block (`mb-3`), helper paragraph, and dev-bypass
     button's own internal classes unchanged — only the gaps *around* these
     blocks are widened, not their own padding.

   - Files: `app/auth/signin/page.tsx`
   - Verify: `npx tsc --noEmit` passes with no errors; `grep -n "py-6 md:py-8\|text-2xl md:text-3xl\|lg:p-10" app/auth/signin/page.tsx` confirms all three header/card size changes landed.
   - Done: header block visibly shorter (smaller heading, less padding); sign-in
     card has more internal breathing room between its sections; no changes
     outside the header block and card spacing/sizing.

2. Viewport verification (checkpoint):
   - Start the dev server if not already running (`pnpm dev`, default port
     3000) and open `/auth/signin` (and `/auth/signin?next=/favorites` for the
     "Unlock X" copy variant).
   - At **1440x900** and **1280x800**: confirm the "Continue with Google"
     button is still fully visible with zero scrolling on initial load, for
     both copy variants — this is the one thing that must not regress.
   - Visually confirm the header now reads as a compact intro line rather than
     a hero block, and the card no longer looks cramped (clear, even gaps
     between title / button / helper text / divider / dev-bypass button).
   - Spot-check dark mode and mobile width (~390px) for no regressions.
   - Resume signal: reply "approved" or describe what still looks off.

## Must-haves

- truths:
  - The header block (eyebrow + h1 + subhead) is visibly shorter than before —
    smaller heading text, reduced container/margin padding.
  - The sign-in card has visibly more breathing room between its internal
    sections (title, button, helper text, dev-bypass divider) than before.
  - The "Continue with Google" button remains fully visible without scrolling
    at 1440x900 and 1280x800, for both the default and `?next=` copy variants.
  - No changes to the two-column grid structure, JSX ordering, AuthBenefits.tsx,
    lib/auth-actions.ts, or lib/auth-benefits.ts.
- artifacts:
  - `app/auth/signin/page.tsx` (only file modified)
- key_links:
  - `components/AuthBenefits.tsx` (still called as
    `<AuthBenefits variant="full" nextPath={next} showCta={false} />`, untouched)
- explicitly out of scope: the two-column grid/sticky-card mechanics, JSX
  source order, AuthBenefits.tsx internals, auth-actions.ts, auth-benefits.ts.
