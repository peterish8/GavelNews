import Link from "next/link";
import { CalendarBrowser } from "@/components/CalendarBrowser";
import { getDataSource } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { CATEGORY_META } from "@/lib/types";

export default async function ArchivePage() {
  const data = getDataSource();
  const archive = await data.getArchive();

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <header className="mb-10 border-b border-border-app pb-8">
        <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Back catalog
        </p>
        <h1 className="mb-2 font-ui text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Archive
        </h1>
        <p className="max-w-xl text-ink-2">
          Every edition, going back as far as we&apos;ve published.
        </p>
      </header>

      <CalendarBrowser archive={archive} />

      <div className="mb-5 flex items-end gap-3">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Browse as list
        </h2>
        <div className="mb-1 h-px flex-1 bg-border-app/80" aria-hidden />
      </div>

      <div className="space-y-12">
        {archive.map((m) => (
          <section key={m.month}>
            <div className="mb-5 flex items-end gap-3">
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                {m.label}
              </h2>
              <div className="mb-1 h-px flex-1 bg-border-app/80" aria-hidden />
            </div>
            <ul className="grid gap-3 md:grid-cols-2">
              {m.editions.map((ed) => (
                <li key={ed.date}>
                  <Link
                    href={`/edition/${ed.date}`}
                    className="glass-card card-interactive group flex h-full items-start gap-4 p-5"
                  >
                    <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-border-app bg-elevated-muted">
                      <div className="font-ui text-2xl font-bold leading-none text-ink transition-colors group-hover:text-brand">
                        {new Date(`${ed.date}T00:00:00Z`).getUTCDate()}
                      </div>
                      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                        {new Date(`${ed.date}T00:00:00Z`).toLocaleDateString("en-US", {
                          month: "short",
                          timeZone: "UTC",
                        })}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-ink-3">
                        <span>{formatDate(ed.date)}</span>
                        <span className="opacity-40">·</span>
                        <span>
                          {ed.stories.length}{" "}
                          {ed.stories.length === 1 ? "story" : "stories"}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {ed.stories.slice(0, 3).map((s) => (
                          <li
                            key={s.id}
                            className="truncate text-sm font-medium text-ink-2 group-hover:text-ink"
                          >
                            {s.title}
                          </li>
                        ))}
                        {ed.stories.length > 3 && (
                          <li className="text-xs text-ink-3">
                            + {ed.stories.length - 3} more
                          </li>
                        )}
                      </ul>
                      <div className="mt-3 hidden flex-wrap gap-1 sm:flex">
                        {Array.from(new Set(ed.stories.map((s) => s.category))).map((c) => (
                          <span
                            key={c}
                            className="rounded-full border border-border-app bg-elevated-muted px-2 py-0.5 text-[10px] font-medium text-ink-3"
                          >
                            {CATEGORY_META[c].shortLabel}
                          </span>
                        ))}
                      </div>
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