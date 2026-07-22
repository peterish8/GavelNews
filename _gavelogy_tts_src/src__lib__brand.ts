/**
 * Brand tokens for TypeScript — reference CSS variables only.
 * Retheme: edit `src/app/brand-system.css` + `:root` in `globals.css`.
 */

export const brandVar = {
  brand: "--brand",
  brandHover: "--brand-hover",
  brandSoft: "--brand-soft",
  brandBorder: "--brand-border",
  brandBlend: "--brand-blend",
  ink: "--ink",
  ink2: "--ink-2",
  ink3: "--ink-3",
  appSurface: "--app-surface",
  appElevated: "--app-elevated",
  appBorder: "--app-border",
  appBorderStrong: "--app-border-strong",
} as const;

/** Stable class names from brand-system.css — prefer these over hardcoded colors */
export const brandClass = {
  page: "gav-page",
  pageStack: "gav-page-stack",
  pageInner: "gav-page-inner",
  pageInnerWide: "gav-page-inner gav-page-inner--wide",
  stickyBar: "gav-sticky-bar",
  surfaceHeader: "gav-surface-header",
  surfacePanel: "gav-surface-panel",
  iconTile: "gav-icon-tile",
  textMuted: "gav-text-muted",
  textSecondary: "gav-text-secondary",
  linkBack: "gav-link-back",
  badgeBrand: "gav-badge-brand",
  badgeExam: "gav-badge-exam",
  authHero: "gav-auth-hero",
  authSubmit: "gav-auth-submit",
  arenaCta: "gav-arena-cta",
  menuItem: "gav-menu-item",
  menuItemDanger: "gav-menu-item gav-menu-item--danger",
  menuDivider: "gav-menu-divider",
  modalOverlay: "gav-modal-overlay",
  modalPanel: "gav-modal-panel",
  constitutionPage: "gav-const-page",
  constitutionWork: "gav-const-work",
  constitutionListCol: "gav-const-list-col",
  constitutionDetailCol: "gav-const-detail-col",
  constitutionPanel: "gav-const-panel",
  constitutionOverview: "gav-const-page--overview",
  btnGhost: "gav-btn-ghost",
  btnDanger: "gav-btn-danger",
  btnPrimary: "gav-btn-primary",
  flowHeader: "gav-flow-header",
  flowHeaderInner: "gav-flow-header__inner",
  dropdown: "gav-dropdown",
  dropdownPortal: "gav-dropdown gav-dropdown--portal",
  dropdownItem: "gav-dropdown-item",
  dropdownItemActive: "gav-dropdown-item gav-dropdown-item--active",
  dropdownLabel: "gav-dropdown-label",
  dropdownDivider: "gav-dropdown-divider",
  readerBar: "gav-reader-bar",
  statTile: "gav-stat-tile",
  leaderboardRow: "gav-leaderboard-row",
  leaderboardRowTop: "gav-leaderboard-row gav-leaderboard-row--top",
  arenaHud: "arena-hub__hud",
  arenaTitle: "arena-hub__title",
  arenaHero: "arena-hub__hero",
  arenaModePortal: "arena-mode-portal",
} as const;

export const brandCss = Object.fromEntries(
  (Object.entries(brandVar) as [keyof typeof brandVar, string][]).map(([key, varName]) => [
    key,
    `var(${varName})`,
  ])
) as Record<keyof typeof brandVar, string>;