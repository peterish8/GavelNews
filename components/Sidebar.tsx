"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_ITEMS, SECTION_LABELS, signInHref, type NavItem } from "@/lib/nav";
import { signOut } from "@/lib/auth-actions";
import type { ReactNode } from "react";
import {
  PanelLeftIcon,
  LockIcon,
  CloseIcon,
  Logo,
  NewspaperIcon,
  CalendarIcon,
  SearchIcon,
  BookmarkIcon,
  SettingsIcon,
  InfoIcon,
  SignOutIcon,
} from "./icons";

function navIcon(href: string): ReactNode {
  switch (href) {
    case "/":
      return <NewspaperIcon />;
    case "/calendar":
      return <CalendarIcon />;
    case "/search":
      return <SearchIcon className="text-current" />;
    case "/favorites":
      return <BookmarkIcon />;
    case "/settings":
      return <SettingsIcon />;
    case "/about":
      return <InfoIcon />;
    default:
      return null;
  }
}

type SidebarProps = {
  signedIn: boolean;
  email: string | null;
  editionDate?: string;
  storyCount?: number;
  editionIndex?: number;
  /** Mobile overlay open */
  mobileOpen: boolean;
  onMobileClose: () => void;
  /** Desktop collapsed (icon rail) */
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Sidebar({
  signedIn,
  email,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const sections: NavItem["section"][] = ["read", "account", "meta"];
  const displayName = email?.split("@")[0] ?? "Account";
  const initial = (displayName[0] ?? "G").toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={[
          "fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[3px] lg:hidden",
          "transition-[opacity,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileOpen
            ? "visible opacity-100"
            : "pointer-events-none invisible opacity-0",
        ].join(" ")}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />

      <aside
        data-collapsed={collapsed ? "true" : "false"}
        data-mobile-open={mobileOpen ? "true" : "false"}
        className={[
          "mobile-nav-drawer glass-sidebar flex flex-col overflow-hidden",
          // Mobile drawer
          "fixed inset-y-0 left-0 z-[80] w-[min(16.5rem,88vw)] will-change-transform",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none lg:pointer-events-auto",
          // Desktop: fixed floating glass panel (spec §6)
          "lg:fixed lg:inset-y-3 lg:left-3 lg:z-30 lg:h-[calc(100vh-24px)] lg:w-[258px] lg:translate-x-0 lg:rounded-[14px] lg:will-change-auto",
          "lg:transition-[opacity,transform] lg:duration-200 lg:ease-out",
          collapsed
            ? "lg:pointer-events-none lg:opacity-0 lg:-translate-x-2"
            : "lg:opacity-100",
        ].join(" ")}
        aria-label="Main navigation"
        aria-hidden={collapsed && !mobileOpen ? true : undefined}
      >
        {/* Brand block (spec §7) */}
        <div className="shrink-0 px-4 pb-2 pt-5">
          <div className="flex items-start justify-between gap-2">
            <Link
              href="/"
              onClick={onMobileClose}
              className="link-press flex min-w-0 items-center gap-3"
            >
              <Logo size={42} />
              <span className="min-w-0">
                <span className="block truncate font-[family-name:var(--font-editorial)] text-[22px] font-medium leading-none tracking-tight text-ink">
                  GAVEL NEWS
                </span>
                <span className="mt-1 block truncate text-[12px] text-ink-3">
                  Daily Legal Brief
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={onToggleCollapsed}
              className="icon-btn hidden size-8 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(205,198,220,0.42)] text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <PanelLeftIcon flipped />
            </button>

            <button
              type="button"
              onClick={onMobileClose}
              className="icon-btn inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-[rgba(205,198,220,0.42)] text-ink-2 lg:hidden"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Navigation groups (spec §8–9) */}
        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-3 pt-4">
          {sections.map((section, sectionIdx) => {
            const items = NAV_ITEMS.filter((i) => i.section === section);
            return (
              <div
                key={section}
                className={sectionIdx > 0 ? "mt-5" : ""}
              >
                <p className="mb-2 border-b border-[rgba(205,198,220,0.36)] px-1 pb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">
                  {SECTION_LABELS[section]}
                </p>
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      active={item.match(pathname)}
                      signedIn={signedIn}
                      onNavigate={onMobileClose}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Bottom controls (spec §10) */}
        <div className="mt-auto shrink-0 space-y-3 px-4 pb-4 pt-2">
          <ThemeToggle />

          {signedIn ? (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-[rgba(205,198,220,0.38)] bg-[rgba(255,255,255,0.55)] p-3 dark:border-[rgba(180,170,210,0.16)] dark:bg-[rgba(26,24,40,0.55)]">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {initial}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-ink-3">{email}</p>
                </div>
              </div>
              <form action={signOut}>
                <input type="hidden" name="next" value="/" />
                <button
                  type="submit"
                  className="btn-press flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border border-[rgba(205,198,220,0.52)] bg-[rgba(255,255,255,0.46)] text-sm font-semibold text-ink hover:border-brand-border hover:bg-brand-soft hover:text-brand dark:border-[rgba(180,170,210,0.22)] dark:bg-[rgba(26,24,40,0.5)]"
                >
                  <SignOutIcon className="text-brand" />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href={signInHref(pathname)}
              onClick={onMobileClose}
              className="btn-press flex h-[46px] w-full items-center justify-center rounded-[10px] bg-brand text-sm font-semibold text-on-accent hover:bg-brand-hover"
            >
              Sign in free
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarLink({
  item,
  active,
  signedIn,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  signedIn: boolean;
  onNavigate: () => void;
}) {
  const locked = Boolean(item.requiresAuth) && !signedIn;
  const href = locked ? signInHref(item.href) : item.href;
  const isActive = active && !locked;

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        title={
          locked ? `${item.label} — requires sign in` : item.description
        }
        aria-current={isActive ? "page" : undefined}
        className={[
          "group relative grid min-h-[66px] grid-cols-[28px_1fr] items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-[160ms] ease-out",
          isActive
            ? "border border-[rgba(220,38,38,0.16)] bg-[linear-gradient(90deg,rgba(220,38,38,0.10),rgba(220,38,38,0.045))]"
            : "border border-transparent hover:translate-x-px hover:bg-[rgba(19,15,42,0.035)] dark:hover:bg-[rgba(242,240,248,0.05)]",
        ].join(" ")}
      >
        <span
          className={[
            "flex size-[21px] shrink-0 items-center justify-center",
            isActive ? "text-brand" : "text-ink-2 group-hover:text-ink",
          ].join(" ")}
        >
          {navIcon(item.href)}
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span
              className={[
                "block text-[14px] leading-tight",
                isActive
                  ? "font-semibold text-brand"
                  : "font-semibold text-ink",
              ].join(" ")}
              style={{ fontWeight: 650 }}
            >
              {item.label}
            </span>
            {locked && <LockIcon className="text-ink-3" />}
          </span>
          <span className="mt-0.5 block truncate text-[11.5px] leading-tight text-ink-3">
            {locked ? "Sign in required" : item.description}
          </span>
        </span>
        {isActive && (
          <span
            className="absolute bottom-3 right-2 top-3 w-[3px] rounded-full bg-brand"
            aria-hidden
          />
        )}
      </Link>
    </li>
  );
}

export { PanelLeftIcon };
