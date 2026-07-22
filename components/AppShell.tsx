"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar, PanelLeftIcon } from "./Sidebar";
import { Footer } from "./Footer";
import { NavSearch } from "./NavSearch";
import { NAV_ITEMS, signInHref } from "@/lib/nav";

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
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
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
        <header className="relative flex shrink-0 items-center gap-2 border-b border-border-app bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-3 py-1.5 backdrop-blur-xl sm:px-4">
          {/* Mobile: open when drawer closed */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="icon-btn inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border-app bg-elevated text-ink lg:hidden"
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

          {/* Nameplate — absolutely centered against the full header width so
              NavSearch expanding/collapsing on the right never shifts it */}
          <Link
            href="/"
            className="link-press absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
          >
            <span className="font-serif text-lg font-bold tracking-tight text-ink sm:text-xl">
              Gavel News
            </span>
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-ink-3">
              Daily Legal Brief
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Primary links in the top bar (Calendar → /archive) */}
            <nav
              className="flex items-center rounded-full border border-border-app bg-elevated/80 p-0.5"
              aria-label="Primary"
            >
              {NAV_ITEMS.filter((item) => item.section === "read").map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`pressable rounded-full px-2 py-1 text-[11px] font-semibold transition-colors sm:px-3 sm:text-[12px] ${
                      active
                        ? "bg-brand text-[var(--on-accent,#fff)] shadow-sm"
                        : "text-ink-2 hover:bg-brand-soft hover:text-brand"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <NavSearch />
            {!signedIn && (
              <Link
                href={signInHref(pathname)}
                className="btn-press rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-[var(--on-accent)] sm:text-xs"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <main className="min-h-full">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
