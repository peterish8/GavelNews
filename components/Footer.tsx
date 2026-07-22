import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-app bg-elevated">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-5 py-6 text-sm text-ink-3 sm:flex-row sm:items-center">
        <p>© 2026 Gavel News · For CLAT UG & PG aspirants</p>
        <div className="flex items-center gap-4">
          <Link href="/about" className="transition-colors hover:text-ink">
            About
          </Link>
          <Link href="/archive" className="transition-colors hover:text-ink">
            Archive
          </Link>
          <a
            href="mailto:hello@gavelnews.in"
            className="transition-colors hover:text-ink"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}