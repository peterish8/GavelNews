import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key only). Used for client-side auth helpers
 * if needed; server session is the source of truth via getUser() in
 * lib/auth.ts. Never put SUPABASE_SERVICE_ROLE_KEY here.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
