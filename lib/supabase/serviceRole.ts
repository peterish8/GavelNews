import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only, RLS-bypassing Supabase client. Reads full story/PYQ rows
 * (Legal Mentor, Exam Lens, quiz, PYQ) that the anon-role RLS policies no
 * longer expose - see supabase/migrations/20260723185522_gate_full_story_content.sql.
 *
 * `import "server-only"` makes Next.js throw a build error if this module
 * is ever pulled into a client bundle. Never call this from a "use client"
 * component; only from Server Components/Route Handlers, and only after
 * checking user.signedIn - this bypasses RLS entirely, so it is the app's
 * job (not the database's) to decide who gets to see the result.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set - required to read gated story content server-side.",
    );
  }
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set - required to read gated story content server-side.",
    );
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
