import type { Category } from "@/lib/types";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/types";

interface CategoryFilterProps {
  selected: Category[];
  onToggle: (cat: Category) => void;
}

export function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            className={`btn-press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
              active
                ? "border-brand bg-brand text-[var(--on-accent,#fff)] shadow-sm"
                : "border-border-app bg-elevated/90 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
            }`}
          >
            {active && <CheckIcon />}
            {meta.shortLabel}
          </button>
        );
      })}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4 4 10-10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}