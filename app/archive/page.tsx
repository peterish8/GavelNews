import Link from "next/link";
import { getDataSource } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { CATEGORY_META } from "@/lib/types";

export default async function ArchivePage() {
  const data = getDataSource();
  const archive = await data.getArchive();

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="mb-2 font-ui text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Archive
        </h1>
        <p className="text-ink-2">Every edition, going back as far as we&apos;ve published.</p>
      </header>

      <div className="space-y-12">
        {archive.map((m) => (
          <section key={m.month}>
            <h2 className="mb-5 font-ui text-sm font-semibold uppercase tracking-wider text-ink-3">
              {m.label}
            </h2>
            <ul className="space-y-3">
              {m.editions.map((ed) => (
                <li key={ed.date}>
                  <Link
                    href={`/edition/${ed.date}`}
                    className="group flex items-start gap-4 rounded-xl border border-border-app bg-elevated p-4 transition-all duration-[200ms] ease-out hover:-translate-y-0.5 hover:border-brand-border hover:shadow-[var(--shadow-md)] active:translate-y-0"
                  >
                    <div className="shrink-0">
                      <div className="text-2xl font-semibold leading-none text-ink transition-colors group-hover:text-brand">
                        {new Date(`${ed.date}T00:00:00Z`).getUTCDate()}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-3">
                        {new Date(`${ed.date}T00:00:00Z`).toLocaleDateString("en-US", {
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center gap-2 text-xs text-ink-3">
                        <span>{formatDate(ed.date)}</span>
                        <span>·</span>
                        <span>
                          {ed.stories.length} {ed.stories.length === 1 ? "story" : "stories"}
                        </span>
                      </div>
                      <ul className="space-y-0.5">
                        {ed.stories.slice(0, 3).map((s) => (
                          <li
                            key={s.id}
                            className="truncate text-sm text-ink-2 group-hover:text-ink"
                          >
                            · {s.title}
                          </li>
                        ))}
                        {ed.stories.length > 3 && (
                          <li className="text-xs text-ink-3">
                            + {ed.stories.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="hidden shrink-0 sm:flex sm:flex-wrap sm:gap-1">
                      {Array.from(new Set(ed.stories.map((s) => s.category))).map((c) => (
                        <span
                          key={c}
                          className="rounded-full border border-border-app bg-elevated-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-3"
                        >
                          {CATEGORY_META[c].shortLabel}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}