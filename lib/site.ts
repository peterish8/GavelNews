// Single source of truth for the site's canonical base URL — used to build
// `metadataBase` (app/layout.tsx), canonical/OG URLs (generateMetadata), and
// share links (ShareButton). Do not duplicate the localhost fallback elsewhere.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");
