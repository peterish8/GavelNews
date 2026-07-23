import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Component Supabase client. Anon key only — this repo never holds
 * the service_role key (writes to published_stories belong to the sibling
 * `gavel-news` engine repo). Read-only usage today: cookie writes are
 * no-ops since we don't yet do auth here (Phase 2).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component without a mutable cookie jar
            // (e.g. a page render, not a Server Action/Route Handler).
            // Safe to ignore until Phase 2 wires real session refresh.
          }
        },
      },
    },
  );
}
