"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { NavSearch } from "./NavSearch";
import { formatDate } from "@/lib/format";

type NavItem = {
  href: string;
  label: string;
  match: (path: string) => boolean;
  /** If true, only show when signed in */
  signedInOnly?: boolean;
};

const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Today", match: (p) => p === "/" },
  {
    href: "/calendar",
    label: "Calendar",
    match: (p) =>
      p.startsWith("/calendar") ||
      p.startsWith("/archive") ||
      p.startsWith("/edition"),
  },
  {
    href: "/search",
    label: "Search",
    match: (p) => p.startsWith("/search"),
  },
  {
    href: "/about",
    label: "About",
    match: (p) => p.startsWith("/about"),
  },
  {
    href: "/settings",
    label: "Settings",
    match: (p) => p.startsWith("/settings"),
    signedInOnly: true,
  },
];

type TopNavProps = {
  editionDate?: string;
  storyCount?: number;
  editionIndex?: number;
  signedIn?: boolean;
  email?: string | null;
};

export default function TopNav({
  editionDate,
  storyCount,
  editionIndex,
  signedIn = false,
  email = null,
}: TopNavProps) {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const visibleNav = PRIMARY_NAV.filter(
    (item) => !item.signedInOnly || signedIn,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border-app/80 bg-nav-bg backdrop-blur-xl">
      <div
        className="h-[2px] w-full"
        style={{ background: "var(--brand-blend)" }}
        aria-hidden
      />

      {/* ── Primary bar ─────────────────────────────────────────── */}
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-5 md:h-[3.75rem] md:gap-4">
        <Link
          href="/"
          className="link-press group flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <Logo />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="font-serif text-[15px] font-bold tracking-tight text-ink">
              Gavel News
            </span>
            <span className="mt-0.5 hidden font-serif text-[10px] italic text-ink-3 sm:block">
              CLAT brief · free to read
            </span>
          </span>
        </Link>

        {/* Desktop primary links */}
        <nav
          className="ml-2 hidden flex-1 items-center justify-center md:flex"
          aria-label="Primary"
        >
          <div className="flex items-center rounded-full border border-border-app bg-elevated/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] dark:shadow-none">
            {visibleNav.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`pressable rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors lg:px-4 ${
                    active
                      ? "bg-brand text-on-accent shadow-sm"
                      : "text-ink-2 hover:bg-brand-soft hover:text-brand"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Utilities — always available before / after sign-in */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:ml-0">
          <div className="hidden sm:block">
            <NavSearch />
          </div>
          <ThemeToggle />

          {signedIn ? (
            <Link
              href="/settings"
              className="btn-press hidden max-w-[10rem] items-center gap-2 rounded-full border border-border-app bg-elevated/90 px-2.5 py-1.5 text-[12px] font-semibold text-ink hover:border-brand-border hover:bg-brand-soft sm:inline-flex"
              title={email ?? "Account"}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-accent">
                {(email?.[0] ?? "U").toUpperCase()}
              </span>
              <span className="truncate">{email?.split("@")[0] ?? "Account"}</span>
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="btn-press inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-[12px] font-semibold text-on-accent hover:bg-brand-hover sm:px-3.5 sm:text-[13px]"
            >
              Sign in
              <span className="hidden font-normal opacity-80 sm:inline">
                free
              </span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="icon-btn inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/80 text-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* ── Edition strip — public, always on ───────────────────── */}
      {(editionDate || typeof editionIndex === "number") && (
        <div className="border-t border-border-app/60 bg-elevated-muted/50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-1.5 sm:px-5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">
              {typeof editionIndex === "number" && editionIndex > 0 && (
                <span className="font-semibold text-brand">Day {editionIndex}</span>
              )}
              {editionDate && (
                <>
                  <span className="opacity-30" aria-hidden>
                    ·
                  </span>
                  <Link
                    href="/"
                    className="font-medium text-ink-2 transition-colors hover:text-brand"
                  >
                    {formatDate(editionDate)}
                  </Link>
                </>
              )}
              {typeof storyCount === "number" && (
                <>
                  <span className="opacity-30" aria-hidden>
                    ·
                  </span>
                  <span>
                    {storyCount} {storyCount === 1 ? "story" : "stories"} today
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 font-serif text-[11px] text-ink-3">
              <Link href="/calendar" className="hover:text-brand">
                Calendar
              </Link>
              {!signedIn && (
                <>
                  <span className="opacity-40" aria-hidden>
                    ·
                  </span>
                  <span className="hidden italic text-ink-3 xs:inline sm:inline">
                    Teaser free · exam layer with account
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile drawer ───────────────────────────────────────── */}
      {menuOpen && (
        <div
          id={menuId}
          className="border-t border-border-app bg-nav-bg md:hidden"
        >
          <div className="mx-auto max-w-6xl px-4 py-4 sm:px-5">
            {/* Mobile search always first */}
            <div className="mb-4 sm:hidden">
              <MobileSearchRow />
            </div>

            <nav aria-label="Mobile primary">
              <ul className="space-y-1">
                {visibleNav.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-semibold transition-colors ${
                          active
                            ? "bg-brand-soft text-brand"
                            : "text-ink hover:bg-elevated-muted"
                        }`}
                      >
                        {item.label}
                        {active && (
                          <span className="font-mono text-[10px] uppercase tracking-wider text-brand">
                            Here
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-4 border-t border-border-app pt-4">
              {signedIn ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border-app bg-elevated/80 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {email ?? "Signed in"}
                    </p>
                    <p className="text-xs text-ink-3">Account active</p>
                  </div>
                  <Link
                    href="/settings"
                    className="btn-press shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-on-accent"
                  >
                    Settings
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-brand-border bg-brand-soft/60 p-4">
                  <p className="mb-1 text-sm font-semibold text-ink">
                    Reading is free
                  </p>
                  <p className="mb-3 text-xs leading-relaxed text-ink-2">
                    Sign in for key points, why it matters, saved stories, and
                    past CLAT questions.
                  </p>
                  <Link
                    href="/auth/signin"
                    className="btn-press inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-brand-hover"
                  >
                    Sign in — it&apos;s free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MobileSearchRow() {
  const [q, setQ] = useState("");
  return (
    <form
      action="/search"
      method="get"
      className="flex items-center gap-2 rounded-xl border border-border-app bg-elevated px-3 py-2.5"
    >
      <SearchIcon />
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search the archive…"
        className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        aria-label="Search the archive"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-on-accent"
      >
        Go
      </button>
    </form>
  );
}

function Logo() {
  return (
    <span
      className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-border bg-brand-soft text-brand shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]"
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L4 6v6c0 5 3.4 9.4 8 10 4.6-.6 8-5 8-10V6l-8-4z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <path
          d="M9.5 12.5l1.8 1.8 3.5-3.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-ink-3"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
