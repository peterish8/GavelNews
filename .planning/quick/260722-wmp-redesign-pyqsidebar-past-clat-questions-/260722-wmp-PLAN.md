---
phase: quick-260722-wmp
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [components/PYQSidebar.tsx, "app/story/[slug]/page.tsx"]
autonomous: true
requirements: []
must_haves:
  truths:
    - "PYQSidebar visually reads as bigger/more prominent than before (wider column, more padding, larger icon/heading)"
    - "Each question has clearer visual hierarchy (numbered badge, CLAT year pulled out as its own pill) instead of a flat numbered paragraph"
    - "Box stays visible longer while scrolling the article (sticky positioning) since it currently scrolls out of view quickly next to a long article"
    - "No functional/data changes — same getIllustrativePYQs logic, same props"
---

<objective>
Redesign the "Past CLAT questions" sidebar box (components/PYQSidebar.tsx) per user ask: "make this box even better, big, and proper UI." Currently it's a `surface-hero` card in a fixed 280px sidebar column, with a small icon+heading row, a plain keyword subtitle, and questions rendered as flat numbered paragraphs in muted rounded boxes — functional but visually flat and easy to miss.
Output: A visually richer, more prominent card — wider sidebar column, bigger icon/heading, sticky positioning, per-question numbered badge + separated CLAT-year pill, better spacing/hover states.
</objective>

<context>
@components/PYQSidebar.tsx
@app/story/[slug]/page.tsx (grid layout: `showSidebar ? "grid gap-10 md:grid-cols-[1fr_280px] md:gap-12" : "grid gap-10"`, and the `<aside className="space-y-6">` wrapper around PYQSidebar + RelatedStories)

Questions returned by `getIllustrativePYQs` always end with a trailing `(CLAT YYYY)` tag, e.g. "Under Article 200 ... (CLAT 2019)" — safe to extract via regex `/\(CLAT (\d{4})\)/` and strip it from the displayed body text so it can be shown as a separate badge.
</context>

<tasks>

<task type="auto">
  <name>Task: Widen sidebar column and redesign PYQSidebar card</name>
  <files>components/PYQSidebar.tsx, app/story/[slug]/page.tsx</files>
  <action>
1. In `app/story/[slug]/page.tsx`, widen the sidebar column from `280px` to `320px` in the grid className: `"grid gap-10 md:grid-cols-[1fr_320px] md:gap-12"` (only change the pixel value, nothing else in that conditional).

2. In `components/PYQSidebar.tsx`, redesign the component:
   - Add `sticky top-20` to the outer `surface-hero` div so it stays in view longer while scrolling a long article (alongside existing `p-5` → bump to `p-6`).
   - Header row: icon badge from `size-7` to `size-9`, heading text from `text-xs` to `text-sm`; restructure so the "On &quot;{keyword}&quot;" subtitle sits directly under the heading (in the same flex column as the heading, next to the icon) rather than as a separate paragraph below the header row — tightens the header into one cohesive block.
   - Per-question rendering: extract the trailing `(CLAT YYYY)` from each question string via `/\(CLAT (\d{4})\)/`, strip it from the displayed text, and render it as a separate small pill (e.g. `rounded-full bg-elevated-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-ink-3`, showing `CLAT {year}`) positioned top-right of each question card. Replace the plain inline `{i+1}.` number with a small circular numbered badge (e.g. `flex size-5 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand`) in a row alongside the year pill.
   - Question card styling: increase padding (`p-3` → `p-3.5`), add a subtle hover state (`hover:border-brand-border hover:bg-brand-soft/60` with a `border border-border-app/70` base and `transition-colors`), slightly larger/more readable body text (`text-sm` → `text-[13.5px] leading-relaxed`).
   - Footer disclaimer: add a `border-t border-border-app/60 pt-3` separator above it so it reads as a distinct footnote rather than running directly into the last question.
   - If a question has no `(CLAT YYYY)` match (defensive — current mock data always includes one, but don't crash if it's ever missing), just omit the year pill for that item; still show the numbered badge and full original text.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>components/PYQSidebar.tsx renders a sticky, wider, more visually rich card with numbered badges + separated CLAT-year pills per question, bigger header; app/story/[slug]/page.tsx sidebar column widened to 320px; npx tsc --noEmit passes; no changes to getIllustrativePYQs data logic.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes.
2. Visual check: navigate to a story with a `pyqKeyword` while signed in (mock cookie `gavel_dev_session=1`), confirm the PYQ box is visibly bigger/richer than before and stays in view while scrolling.
</verification>

<output>
Create `.planning/quick/260722-wmp-redesign-pyqsidebar-past-clat-questions-/260722-wmp-SUMMARY.md` when done
</output>
