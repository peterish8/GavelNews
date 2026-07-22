"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "gavel_dev_session";

function safeNext(next?: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/** Dev/mock sign-in — sets session cookie, then redirects. */
export async function signInDemo(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString());
  const store = await cookies();
  store.set(COOKIE, "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  redirect(next);
}

/** Clear mock session. */
export async function signOut(formData: FormData) {
  const next = safeNext(formData.get("next")?.toString() ?? "/");
  const store = await cookies();
  store.delete(COOKIE);
  redirect(next);
}
