import type { Category } from "@/lib/types";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/types";
import { CheckIcon } from "./icons";

interface CategoryFilterProps {
  selected: Category[];
  onToggle: (cat: Category) => void;
}

export function CategoryFilter({ selected, onToggle }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0">
      {ALL_CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const active = selected.includes(cat);
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onToggle(cat)}
            className={`btn-press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-[18px] text-xs font-semibold transition-all duration-150 ${
              active
                ? "border-transparent bg-[linear-gradient(135deg,var(--brand),#ef4444)] text-white shadow-[0_5px_14px_rgba(220,38,38,0.15)]"
                : "border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.62)] text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand dark:bg-[rgba(26,24,40,0.55)]"
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
