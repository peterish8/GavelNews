"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const DEV_USER_EMAIL = "dev@localhost.test";

/** Defense in depth: NODE_ENV alone would already block a production build,
 * but this also blocks a `next dev` server that somehow ended up reachable
 * on a non-loopback host. */
async function isLocalDevRequest(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") return false;
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(":")[0];
  return host === "localhost" || host === "127.0.0.1";
}

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

/**
 * Dev-only sign-in bypass: mints a session for a fixed local dev user
 * without touching Google, entirely server-side.
 *
 * Uses the service-role admin API to generate a magic-link OTP for
 * dev@localhost.test (auto-created on first use), then immediately verifies
 * that OTP against the cookie-bound anon client - no email is sent and no
 * redirect through Supabase's hosted verify endpoint is needed.
 *
 * Hard-blocked outside local dev: refuses unless NODE_ENV !== "production"
 * AND the request host is localhost/127.0.0.1 (see isLocalDevRequest).
 */
export async function signInDevMode(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString());

  if (!(await isLocalDevRequest())) {
    redirect(`/auth/signin?next=${encodeURIComponent(next)}&error=dev_mode_unavailable`);
  }

  const admin = createServiceRoleClient();
  const { data, error: genError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: DEV_USER_EMAIL,
  });

  if (genError || !data.properties?.email_otp) {
    redirect(`/auth/signin?next=${encodeURIComponent(next)}&error=dev_mode_failed`);
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: DEV_USER_EMAIL,
    token: data.properties.email_otp,
    type: "magiclink",
  });

  if (verifyError) {
    redirect(`/auth/signin?next=${encodeURIComponent(next)}&error=dev_mode_failed`);
  }

  redirect(next);
}

/** Clear Supabase session cookies, then redirect. */
export async function signOut(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString() ?? "/");
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(next);
}
