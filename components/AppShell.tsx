"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sidebar, PanelLeftIcon } from "./Sidebar";
import { Footer } from "./Footer";
import { NavSearch } from "./NavSearch";
import { signInHref } from "@/lib/nav";
import { BellIcon, Logo } from "./icons";

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

  const showOutsideToggle = collapsed;

  return (
    <div
      className={`app-shell flex h-dvh max-h-dvh overflow-hidden ${
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
        className={[
          "main-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          // Desktop: offset for fixed floating sidebar (258 + 12 inset + 12 gap)
          "lg:ml-[282px]",
          collapsed ? "lg:!ml-0" : "",
        ].join(" ")}
      >
        {/* Dashboard header (spec §11–12) */}
        <header className="relative z-10 shrink-0 px-4 pb-0 pt-4 sm:px-7 lg:px-7">
          <div className="mx-auto flex w-full max-w-[1240px] items-start justify-between gap-4 sm:gap-6">
            <div className="flex min-w-0 items-start gap-2.5">
              {/* Mobile: open drawer */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="icon-btn mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-[13px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.72)] text-ink shadow-[0_6px_18px_rgba(19,15,42,0.04)] lg:hidden"
                aria-label="Open navigation"
                title="Open navigation"
              >
                <PanelLeftIcon />
              </button>

              {/* Desktop: outside only when closed */}
              {showOutsideToggle && (
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="icon-btn mt-1 hidden size-10 shrink-0 items-center justify-center rounded-[13px] border border-[rgba(205,198,220,0.42)] bg-[rgba(255,255,255,0.72)] text-ink-2 shadow-[0_6px_18px_rgba(19,15,42,0.04)] hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
                  aria-label="Open sidebar"
                  title="Open sidebar"
                >
                  <PanelLeftIcon />
                </button>
              )}

              <Link
                href="/"
                className="link-press flex min-w-0 flex-col items-start leading-none"
              >
                <span className="flex items-center gap-2 lg:hidden">
                  <Logo size={32} />
                  <span className="font-[family-name:var(--font-editorial)] text-[22px] font-medium tracking-tight text-ink">
                    Gavel News
                  </span>
                </span>
                <span className="hidden font-[family-name:var(--font-editorial)] text-[32px] font-medium leading-none tracking-tight text-ink lg:block">
                  Gavel News
                </span>
                <span className="mt-1 hidden text-[13px] text-ink-3 lg:block">
                  Daily Legal Briefing
                </span>
              </Link>
            </div>

            {/* Mobile: search + sign-in */}
            <div
              className="flex shrink-0 items-center gap-2 md:hidden"
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
                  className="btn-press rounded-[10px] bg-brand px-3 py-2 text-[11px] font-semibold text-on-accent"
                >
                  Sign in
                </Link>
              )}
            </div>

            {/* Desktop / tablet: search + notification + sign-in */}
            <div className="ml-auto hidden shrink-0 items-center gap-2.5 md:flex">
              <NavSearch />
              <button
                type="button"
                className="icon-btn glass-input inline-flex size-12 items-center justify-center rounded-[13px] text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                aria-label="Notifications"
                title="Notifications (coming soon)"
              >
                <BellIcon />
              </button>
              {!signedIn && (
                <Link
                  href={signInHref(pathname)}
                  className="btn-press rounded-[11px] bg-brand px-4 py-2.5 text-xs font-semibold text-on-accent hover:bg-brand-hover sm:text-sm"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
