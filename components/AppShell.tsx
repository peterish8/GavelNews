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

  return (
    // Fixed viewport shell: sidebar never grows with article length.
    // Only the right-hand main column scrolls.
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top chrome — fixed height, never scrolls away with content */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border-app bg-[color-mix(in_srgb,var(--bg)_94%,transparent)] px-3 backdrop-blur-xl sm:px-4">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="icon-btn inline-flex size-9 items-center justify-center rounded-xl border border-border-app bg-elevated text-ink lg:hidden"
            aria-label="Open navigation"
            title="Open navigation"
          >
            <PanelLeftIcon />
          </button>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="icon-btn hidden size-9 items-center justify-center rounded-xl border border-border-app bg-elevated text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftIcon flipped={collapsed} />
          </button>

          <Link
            href="/"
            className="min-w-0 flex-1 truncate font-ui text-sm font-bold tracking-tight text-ink lg:flex-none"
          >
            Gavel News
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <NavSearch />
            {!signedIn && (
              <Link
                href={signInHref(pathname)}
                className="btn-press rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-[var(--on-accent)] sm:text-xs"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>

        {/* ONLY this region scrolls */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <main className="min-h-full">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
