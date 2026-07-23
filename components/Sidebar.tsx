"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { NAV_ITEMS, SECTION_LABELS, signInHref, type NavItem } from "@/lib/nav";
import { formatDate } from "@/lib/format";
import { signOut } from "@/lib/auth-actions";

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
  editionDate,
  storyCount,
  editionIndex,
  mobileOpen,
  onMobileClose,
  collapsed,
  onToggleCollapsed,
}: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const sections: NavItem["section"][] = ["read", "account", "meta"];

  return (
    <>
      {/* Mobile backdrop — above TTS (z-40), below drawer */}
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
          "mobile-nav-drawer flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden border-r border-border-app",
          "bg-nav-bg dark:bg-[color-mix(in_srgb,var(--bg)_98%,#000)]",
          // Mobile: smooth slide-in. Desktop: width collapse only.
          "fixed inset-y-0 left-0 z-[80] w-[min(16.5rem,88vw)] shadow-2xl will-change-transform",
          "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full pointer-events-none lg:pointer-events-auto",
          // desktop: open = full width, closed = 0 (opener moves to top bar)
          "lg:static lg:z-0 lg:translate-x-0 lg:shadow-none lg:will-change-auto",
          "lg:transition-[width] lg:duration-200 lg:ease-out",
          collapsed ? "lg:w-0 lg:border-r-0 lg:pointer-events-none" : "lg:w-[16.5rem]",
        ].join(" ")}
        aria-label="Main navigation"
        aria-hidden={collapsed ? true : undefined}
      >
        {/* Header: brand + edition dateline + INSIDE opener (only while open) */}
        <div className="shrink-0 border-b border-border-app">
          <div
            className="h-[2px] w-full"
            style={{ background: "var(--brand-blend)" }}
            aria-hidden
          />
          <div className="flex h-16 items-center justify-between gap-2 px-3">
            <Link
              href="/"
              onClick={onMobileClose}
              className="link-press flex min-w-0 items-center gap-2"
            >
              <Logo />
              <span className="min-w-0">
                <span className="block truncate font-serif text-[17px] font-bold tracking-tight text-ink">
                  Gavel News
                </span>
                {(editionDate || typeof editionIndex === "number") && (
                  <span className="mt-0.5 block truncate text-[11px] text-ink-3">
                    {typeof editionIndex === "number" && editionIndex > 0 && (
                      <span className="font-medium text-brand">Day {editionIndex}</span>
                    )}
                    {editionDate && (
                      <>
                        {typeof editionIndex === "number" ? " · " : ""}
                        {formatDate(editionDate)}
                      </>
                    )}
                    {typeof storyCount === "number" && (
                      <>
                        {" · "}
                        {storyCount} {storyCount === 1 ? "story" : "stories"}
                      </>
                    )}
                  </span>
                )}
              </span>
            </Link>

            {/* Desktop: close control lives inside while open */}
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="icon-btn hidden size-8 shrink-0 items-center justify-center rounded-lg border border-border-app text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <PanelLeftIcon flipped />
            </button>

            {/* Mobile: close drawer */}
            <button
              type="button"
              onClick={onMobileClose}
              className="icon-btn inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border-app text-ink-2 lg:hidden"
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2.5 py-3">
          {sections.map((section) => {
            const items = NAV_ITEMS.filter((i) => i.section === section);
            return (
              <div key={section} className="mb-4">
                <p className="mb-1.5 border-b border-border-app/50 px-2 pb-1.5 font-serif text-[11px] italic tracking-[0.01em] text-ink">
                  {SECTION_LABELS[section]}
                </p>
                <ul className="divide-y divide-border-app/40">
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

        <div className="mt-auto shrink-0 space-y-2 border-t border-border-app p-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-medium text-ink-3">Theme</span>
            <ThemeToggle />
          </div>

          {signedIn ? (
            <div className="px-1">
              <div className="mb-2 min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {email?.split("@")[0] ?? "Account"}
                </p>
                <p className="truncate text-[11px] text-ink-3">{email}</p>
              </div>
              <form action={signOut}>
                <input type="hidden" name="next" value="/" />
                <button
                  type="submit"
                  className="btn-press w-full rounded-sm border border-border-app bg-transparent px-3 py-2 text-xs font-semibold text-ink-2 hover:border-brand-border hover:text-brand"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href={signInHref(pathname)}
              onClick={onMobileClose}
              className="btn-press flex w-full items-center justify-center rounded-sm bg-brand px-3 py-2.5 text-xs font-semibold text-on-accent hover:bg-brand-hover"
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
  const index = String(NAV_ITEMS.indexOf(item) + 1).padStart(2, "0");

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        title={
          locked
            ? `${item.label} — requires sign in`
            : item.description
        }
        className="group flex items-center gap-2.5 px-2 py-2.5 text-ink transition-colors"
      >
        <span className="flex size-7 shrink-0 items-center justify-center font-mono text-[13px] font-semibold tabular-nums text-ink">
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span
              className={`block text-[13px] leading-tight text-ink ${
                active && !locked ? "font-bold" : "font-semibold"
              }`}
            >
              {item.label}
            </span>
            {locked && <LockIcon className="text-ink" />}
          </span>
          <span className="mt-0.5 block truncate text-[11px] leading-tight text-ink">
            {locked ? "Sign in required" : item.description}
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Panel-left icon — Gavelogy-style sidebar toggle */
function PanelLeftIcon({ flipped = false }: { flipped?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={flipped ? "rotate-180" : undefined}
    >
      {/* Sidebar panel outline */}
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      {/* Left rail */}
      <path d="M9 4v16" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Logo() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-brand-border bg-brand-soft text-brand">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 19c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { PanelLeftIcon };
