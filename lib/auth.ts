// ────────────────────────────────────────────────────────────────────
// Current-user helper.
//
// v1: mock session cookie `gavel_dev_session=1` for local preview.
// v2: swap body for supabase.auth.getUser() (same return shape).
// ────────────────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInHref } from "@/lib/nav";

export interface CurrentUser {
  signedIn: boolean;
  email: string | null;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const store = await cookies();
  const dev = store.get("gavel_dev_session")?.value;
  if (dev === "1") {
    return { signedIn: true, email: "dev@gavel.news" };
  }
  return { signedIn: false, email: null };
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
