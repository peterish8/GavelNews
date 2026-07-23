import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-app bg-[color-mix(in_srgb,var(--app-elevated)_82%,#f0e9dc)] dark:border-white/10 dark:bg-[color-mix(in_srgb,var(--app-elevated)_92%,#050506)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-2 lg:grid-cols-4 md:py-9">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-serif text-base font-bold tracking-tight text-ink">
            Gavel News
          </p>
          <p className="mt-2 max-w-sm font-serif text-[13.5px] leading-relaxed text-ink-2 dark:text-ink-3">
            Daily legal brief for CLAT UG &amp; PG. Read free — sign in for the
            exam layer.
          </p>
        </div>

        <div>
          <p className="label-law mb-3">Read</p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li>
              <Link href="/" className="link-press hover:text-brand">
                Today&apos;s edition
              </Link>
            </li>
            <li>
              <Link href="/calendar" className="link-press hover:text-brand">
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
          <p className="label-law mb-3">Account</p>
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
                Saved
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
          <p className="label-law mb-3">Meta</p>
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

      <div className="border-t border-border-app/70 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-5 py-4 sm:flex-row sm:items-center">
          <p className="font-serif text-[12px] text-ink-2 dark:text-ink-3">
            © 2026 Gavel News
          </p>
          <p className="font-serif text-[12px] italic text-ink-3">
            Public teaser · exam layer with free account
          </p>
        </div>
      </div>
    </footer>
  );
}
