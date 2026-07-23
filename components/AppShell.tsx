"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar, PanelLeftIcon } from "./Sidebar";
import { Footer } from "./Footer";
import { NavSearch } from "./NavSearch";
import { signInHref } from "@/lib/nav";

const COLLAPSE_KEY = "gavel-sidebar-collapsed";

type AppShellProps = {
  children: React.ReactNode;
  signedIn: boolean;
  email: string | null;
  editionDate?: string;
  storyCount?: number;
  editionIndex?: number;
};

export function AppShell({
  children,
  signedIn,
  email,
  editionDate,
  storyCount,
  editionIndex,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    // Let floating UI (TTS bar) know the mobile drawer is open so it can
    // yield stacking / hide itself instead of sitting on top of the nav.
    document.documentElement.dataset.mobileNav = mobileOpen ? "open" : "closed";
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.dataset.mobileNav = "closed";
    };
  }, [mobileOpen]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  // One control: outside only when desktop sidebar is closed
  const showOutsideToggle = collapsed;

  return (
    <div
      className={`flex h-dvh max-h-dvh overflow-hidden ${
        ready ? "" : "opacity-0 lg:opacity-100"
      }`}
    >
      <Sidebar
        signedIn={signedIn}
        email={email}
        editionDate={editionDate}
        storyCount={storyCount}
        editionIndex={editionIndex}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />

      <div
        data-sidebar-collapsed={collapsed ? "true" : "false"}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
      >
        <header className="relative shrink-0 border-b border-border-app bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] backdrop-blur-xl">
          <div
            className="h-[2px] w-full"
            style={{ background: "var(--brand-blend)" }}
            aria-hidden
          />
          <div className="relative flex h-16 items-center gap-2 px-2.5 sm:px-4">
            {/* Mobile: open drawer */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="icon-btn inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-app bg-elevated text-ink lg:hidden"
              aria-label="Open navigation"
              title="Open navigation"
            >
              <PanelLeftIcon />
            </button>

            {/* Desktop: outside only when closed (inside when open) */}
            {showOutsideToggle && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="icon-btn hidden size-7 shrink-0 items-center justify-center rounded-lg border border-border-app bg-elevated text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
                aria-label="Open sidebar"
                title="Open sidebar"
              >
                <PanelLeftIcon />
              </button>
            )}

            {/* Brand — inline on mobile (no absolute collision), centered on lg+ */}
            <Link
              href="/"
              className="link-press flex min-w-0 flex-1 flex-col items-start gap-0 leading-none lg:absolute lg:left-1/2 lg:top-1/2 lg:flex-none lg:-translate-x-1/2 lg:-translate-y-1/2 lg:items-center lg:gap-0.5"
            >
              <span className="truncate font-serif text-base font-bold tracking-tight text-ink sm:text-lg lg:text-xl">
                Gavel News
              </span>
              <span className="hidden font-serif text-[10px] italic text-ink-3 sm:block">
                Daily Legal Brief
              </span>
            </Link>

            {/* ── Mobile: search + sign-in — full nav lives in the drawer ── */}
            <div
              className="flex shrink-0 items-center gap-1.5 md:hidden"
              role="group"
              aria-label="Quick actions"
            >
              <NavSearch
                compact
                open={mobileSearchOpen}
                onOpenChange={setMobileSearchOpen}
              />
              {!signedIn && (
                <Link
                  href={signInHref(pathname)}
                  className="btn-press rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-on-accent"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* ── Desktop / tablet: search + sign-in only — full nav lives in the sidebar ── */}
            <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
              <NavSearch />
              {!signedIn && (
                <Link
                  href={signInHref(pathname)}
                  className="btn-press rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-on-accent sm:text-xs"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {/* No min-h-full — that left a huge empty band between page content and footer */}
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
