// ────────────────────────────────────────────────────────────────────
// Current-user helper — Supabase Auth (Google OAuth + session cookies).
//
// Always uses getUser() (server-validated JWT), never getSession() alone.
// ────────────────────────────────────────────────────────────────────

import { redirect } from "next/navigation";
import { signInHref } from "@/lib/nav";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  signedIn: boolean;
  email: string | null;
}

/**
 * Open-redirect guard: only same-origin relative paths.
 * Rejects protocol-relative (//evil.com) and absolute URLs.
 */
export function safeNext(next?: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  // Block backslash tricks and embedded credentials
  if (next.includes("\\") || next.includes("@")) return "/";
  return next;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { signedIn: false, email: null };
    }

    return {
      signedIn: true,
      email: user.email ?? null,
    };
  } catch {
    // Missing env / network during build or offline preview
    return { signedIn: false, email: null };
  }
}

/**
 * Server-side gate for protected pages.
 * Redirects guests to /auth/signin?next=<path>.
 */
export async function requireUser(returnPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user.signedIn) {
    redirect(signInHref(returnPath));
  }
  return user;
}
