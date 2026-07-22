import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

// Phase 1 nav — links work, auth is placeholder.
// Phase 5 swaps the sign-in button for a real auth-aware version.
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-app bg-elevated/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-ui text-[15px] font-semibold tracking-tight text-ink transition-opacity hover:opacity-80"
        >
          <Logo />
          Gavel News
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/">Today</NavLink>
          <NavLink href="/archive">Archive</NavLink>
          <NavLink href="/search">Search</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/signin"
            className="hidden rounded-full border border-border-app bg-elevated px-3.5 py-1.5 text-sm font-medium text-ink transition-all duration-200 ease-out hover:border-brand-border hover:bg-brand-soft hover:text-brand active:scale-[0.97] sm:inline-flex"
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:bg-brand-soft hover:text-brand"
    >
      {children}
    </Link>
  );
}

function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-brand"
      aria-hidden
    >
      <path
        d="M12 2L4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="var(--brand-soft)"
      />
      <path
        d="M9.5 12.5l1.8 1.8 3.5-3.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}