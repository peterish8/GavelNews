import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-app bg-[color-mix(in_srgb,var(--elevated,#fff)_70%,transparent)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 md:py-12">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-ui text-sm font-bold tracking-tight text-ink">
            Gavel News
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-3">
            Daily legal brief for CLAT UG & PG. Read free — sign in for the exam
            layer.
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Read
          </p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <Link href="/" className="link-press hover:text-brand">
                Today&apos;s edition
              </Link>
            </li>
            <li>
              <Link href="/archive" className="link-press hover:text-brand">
                Calendar
              </Link>
            </li>
            <li>
              <Link href="/search" className="link-press hover:text-brand">
                Search
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Account
          </p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <Link href="/auth/signin" className="link-press hover:text-brand">
                Sign in
              </Link>
            </li>
            <li>
              <Link
                href="/auth/signin?next=%2Ffavorites"
                className="link-press hover:text-brand"
              >
                Favorites
              </Link>
            </li>
            <li>
              <Link
                href="/auth/signin?next=%2Fsettings"
                className="link-press hover:text-brand"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
            Meta
          </p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <Link href="/about" className="link-press hover:text-brand">
                About
              </Link>
            </li>
            <li>
              <a
                href="mailto:hello@gavelnews.in"
                className="link-press hover:text-brand"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border-app/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-4 font-mono text-[11px] text-ink-3 sm:flex-row sm:items-center">
          <p>© 2026 Gavel News</p>
          <p className="uppercase tracking-[0.14em]">
            Public teaser · exam layer with free account
          </p>
        </div>
      </div>
    </footer>
  );
}
