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
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        onClick={onMobileClose}
      />

      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={[
          // Always viewport-height; never stretches with article content
          "flex h-dvh max-h-dvh shrink-0 flex-col overflow-hidden border-r border-border-app",
          "bg-[color-mix(in_srgb,var(--bg)_94%,#fff)] dark:bg-[color-mix(in_srgb,var(--bg)_98%,#000)]",
          "transition-[width,transform] duration-200 ease-out",
          // mobile: fixed drawer
          "fixed inset-y-0 left-0 z-50 w-[16.5rem] shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // desktop: in-flow, fixed height, no page scroll on the rail
          "lg:static lg:z-0 lg:translate-x-0 lg:shadow-none",
          collapsed ? "lg:w-[4.25rem]" : "lg:w-[16.5rem]",
        ].join(" ")}
        aria-label="Main navigation"
      >
        {/* Header: brand + collapse toggle (Gavelogy-style) */}
        <div
          className={`flex h-14 shrink-0 items-center border-b border-border-app ${
            collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
          }`}
        >
          {!collapsed && (
            <Link
              href="/"
              onClick={onMobileClose}
              className="link-press flex min-w-0 items-center gap-2"
            >
              <Logo />
              <span className="min-w-0">
                <span className="block truncate font-ui text-[14px] font-bold tracking-tight text-ink">
                  Gavel News
                </span>
                <span className="mt-0.5 block font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-ink-3">
                  CLAT brief
                </span>
              </span>
            </Link>
          )}

          {collapsed && (
            <Link
              href="/"
              onClick={onMobileClose}
              className="link-press"
              title="Gavel News"
            >
              <Logo />
            </Link>
          )}

          {/* Desktop collapse — panel-left icon (toggle also lives in top bar) */}
          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapsed}
              className="icon-btn hidden size-8 items-center justify-center rounded-lg border border-border-app text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand lg:inline-flex"
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <PanelLeftIcon />
            </button>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={onMobileClose}
            className="icon-btn inline-flex size-8 items-center justify-center rounded-lg border border-border-app text-ink-2 lg:hidden"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Edition chip — full only */}
        {!collapsed && (editionDate || typeof editionIndex === "number") && (
          <div className="shrink-0 border-b border-border-app px-3 py-2.5">
            <div className="rounded-xl border border-border-app bg-elevated-muted/70 px-3 py-2">
              <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                Live edition
              </p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                {typeof editionIndex === "number" && editionIndex > 0 && (
                  <span className="text-brand">Day {editionIndex}</span>
                )}
                {editionDate && (
                  <span className="text-ink-2">
                    {typeof editionIndex === "number" ? " · " : ""}
                    {formatDate(editionDate)}
                  </span>
                )}
              </p>
              {typeof storyCount === "number" && (
                <p className="mt-0.5 text-xs text-ink-3">
                  {storyCount} {storyCount === 1 ? "story" : "stories"}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Nav — no auth benefits here */}
        <nav
          className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-3 ${
            collapsed ? "px-1.5" : "px-2.5"
          }`}
        >
          {sections.map((section) => {
            const items = NAV_ITEMS.filter((i) => i.section === section);
            return (
              <div key={section} className={collapsed ? "mb-2" : "mb-4"}>
                {!collapsed && (
                  <p className="mb-1 px-2 font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {SECTION_LABELS[section]}
                    {section === "account" && !signedIn && (
                      <span className="ml-1 font-normal normal-case tracking-normal opacity-70">
                        · sign in
                      </span>
                    )}
                  </p>
                )}
                {collapsed && section !== "read" && (
                  <div className="mx-2 my-2 h-px bg-border-app" aria-hidden />
                )}
                <ul className="space-y-0.5">
                  {items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      item={item}
                      active={item.match(pathname)}
                      signedIn={signedIn}
                      collapsed={collapsed}
                      onNavigate={onMobileClose}
                    />
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer — theme + account only */}
        <div
          className={`mt-auto shrink-0 space-y-2 border-t border-border-app ${
            collapsed ? "p-2" : "p-3"
          }`}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle />
              {signedIn ? (
                <form action={signOut} title="Sign out">
                  <input type="hidden" name="next" value="/" />
                  <button
                    type="submit"
                    className="icon-btn flex size-9 items-center justify-center rounded-full bg-brand text-xs font-bold text-[var(--on-accent)]"
                    aria-label="Sign out"
                  >
                    {(email?.[0] ?? "U").toUpperCase()}
                  </button>
                </form>
              ) : (
                <Link
                  href={signInHref(pathname)}
                  onClick={onMobileClose}
                  className="icon-btn flex size-9 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
                  title="Sign in"
                  aria-label="Sign in"
                >
                  <UserIcon />
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 px-1">
                <span className="text-xs font-medium text-ink-3">Theme</span>
                <ThemeToggle />
              </div>

              {signedIn ? (
                <div className="rounded-xl border border-border-app bg-elevated/80 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-[var(--on-accent)]">
                      {(email?.[0] ?? "U").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {email?.split("@")[0] ?? "Account"}
                      </p>
                      <p className="truncate text-[11px] text-ink-3">{email}</p>
                    </div>
                  </div>
                  <form action={signOut}>
                    <input type="hidden" name="next" value="/" />
                    <button
                      type="submit"
                      className="btn-press w-full rounded-lg border border-border-app bg-elevated px-3 py-2 text-xs font-semibold text-ink-2 hover:border-brand-border hover:text-brand"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href={signInHref(pathname)}
                  onClick={onMobileClose}
                  className="btn-press flex w-full items-center justify-center rounded-lg bg-brand px-3 py-2.5 text-xs font-semibold text-[var(--on-accent)] hover:bg-brand-hover"
                >
                  Sign in free
                </Link>
              )}
            </>
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
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  signedIn: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const locked = Boolean(item.requiresAuth) && !signedIn;
  // Auth-required + guest → go to sign-in with benefits page (next=)
  const href = locked ? signInHref(item.href) : item.href;

  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        title={
          collapsed
            ? locked
              ? `${item.label} (sign in)`
              : item.label
            : locked
              ? `${item.label} — requires sign in`
              : item.description
        }
        className={`group flex items-center rounded-xl transition-colors ${
          collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-2"
        } ${
          active && !locked
            ? "bg-brand text-[var(--on-accent,#fff)] shadow-sm"
            : "text-ink-2 hover:bg-elevated-muted hover:text-ink"
        }`}
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
            active && !locked
              ? "bg-white/15"
              : "bg-elevated-muted text-ink-3 group-hover:text-brand"
          }`}
        >
          <NavIcon name={item.label} />
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="block text-[13px] font-semibold leading-tight">
                {item.label}
              </span>
              {locked && <LockIcon className="text-ink-3" />}
            </span>
            <span
              className={`mt-0.5 block truncate text-[11px] leading-tight ${
                active && !locked ? "text-white/75" : "text-ink-3"
              }`}
            >
              {locked ? "Sign in required" : item.description}
            </span>
          </span>
        )}
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

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };
  switch (name) {
    case "Today":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M3 10h18M8 3v4M16 3v4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Archive":
      return (
        <svg {...common}>
          <path
            d="M4 7h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7zM2 5h20v2H2z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="m20 20-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    case "Favorites":
      return (
        <svg {...common}>
          <path
            d="M12 21s-7-4.5-9.5-9.5C.8 7.5 3.2 4 6.5 4c1.9 0 3.5 1 4.5 2.5 1-1.5 2.6-2.5 4.5-2.5 3.3 0 5.7 3.5 4 7.5C19 16.5 12 21 12 21z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M12 11v5M12 8h.01"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );
  }
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
