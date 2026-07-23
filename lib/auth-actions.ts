"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolve public origin for OAuth redirectTo.
 * Prefer configured SITE_URL (must match Supabase redirect allowlist);
 * fall back to request Origin / Host only in local dev.
 */
async function publicOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return SITE_URL;
  }
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`.replace(/\/$/, "");
  return SITE_URL;
}

/**
 * Start Google OAuth (Supabase). Redirects the browser to Google, then
 * back to /auth/callback to exchange the code for a session (PKCE).
 */
export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString());
  const origin = await publicOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        // Force account picker; avoids silent re-use of a wrong Google session
        prompt: "select_account",
      },
    },
  });

  if (error || !data.url) {
    redirect(
      `/auth/signin?next=${encodeURIComponent(next)}&error=oauth_start`,
    );
  }

  redirect(data.url);
}

/** Clear Supabase session cookies, then redirect. */
export async function signOut(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString() ?? "/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(next);
}
