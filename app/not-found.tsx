import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full border border-border-app bg-elevated">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" className="text-ink-3" />
          <path
            d="M9 9.5l6 5M15 9.5l-6 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-ink-3"
          />
        </svg>
      </div>
      <h1 className="mb-2 font-ui text-2xl font-semibold text-ink">Not found</h1>
      <p className="mb-6 text-sm text-ink-2">
        That page doesn&apos;t exist — or it hasn&apos;t been published yet.
      </p>
      <Link
        href="/"
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-all duration-[200ms] ease-out hover:bg-brand-hover active:scale-[0.97]"
      >
        Back to today&apos;s edition
      </Link>
    </div>
  );
}