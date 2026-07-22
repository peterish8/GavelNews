// Single source of truth for sidebar navigation.
// `requiresAuth: true` items are always listed; guests are sent to sign-in.

export type NavItem = {
  href: string;
  label: string;
  description: string;
  /** Match active route */
  match: (path: string) => boolean;
  /** If true, unauthenticated clicks go to /auth/signin?next=... */
  requiresAuth?: boolean;
  section: "read" | "account" | "meta";
};

export const NAV_ITEMS: NavItem[] = [
  // ── Read (public) ──────────────────────────────────────────────
  {
    href: "/",
    label: "Today",
    description: "This morning's edition",
    match: (p) => p === "/",
    section: "read",
  },
  {
    href: "/archive",
    label: "Archive",
    description: "Past daily editions",
    match: (p) => p.startsWith("/archive") || p.startsWith("/edition"),
    section: "read",
  },
  {
    href: "/search",
    label: "Search",
    description: "Find stories by topic",
    match: (p) => p.startsWith("/search"),
    section: "read",
  },

  // ── Account (auth required) ────────────────────────────────────
  {
    href: "/favorites",
    label: "Favorites",
    description: "Stories you saved",
    match: (p) => p.startsWith("/favorites"),
    requiresAuth: true,
    section: "account",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Exam, theme, profile",
    match: (p) => p.startsWith("/settings"),
    requiresAuth: true,
    section: "account",
  },

  // ── Meta (public) ──────────────────────────────────────────────
  {
    href: "/about",
    label: "About",
    description: "What Gavel News is",
    match: (p) => p.startsWith("/about"),
    section: "meta",
  },
];

export const SECTION_LABELS: Record<NavItem["section"], string> = {
  read: "Read",
  account: "Your library",
  meta: "About",
};

/** Build sign-in URL that returns the user to `href` after auth. */
export function signInHref(nextPath: string): string {
  const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
  return `/auth/signin?next=${encodeURIComponent(next)}`;
}
