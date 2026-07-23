import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth callback — exchanges the auth code for a session (PKCE).
 * Supabase redirects here after Google consent.
 *
 * Security:
 * - Only relative `next` paths (open-redirect guard via safeNext)
 * - exchangeCodeForSession validates the code server-side
 * - Session cookies set httpOnly by @supabase/ssr
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));
  const errorDescription =
    searchParams.get("error_description") ?? searchParams.get("error");

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/auth/signin?next=${encodeURIComponent(next)}&error=oauth_denied`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/signin?next=${encodeURIComponent(next)}&error=oauth_callback`,
  );
}
