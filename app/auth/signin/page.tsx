import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { signInWithGoogle, signInDevMode } from "@/lib/auth-actions";
import { AuthBenefits } from "@/components/AuthBenefits";

interface PageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

/** Friendly label for what they tried to open */
function destinationLabel(next: string): string {
  if (next.startsWith("/favorites")) return "Saved";
  if (next.startsWith("/settings")) return "Settings";
  if (next.startsWith("/story")) return "Exam layer on this story";
  return next;
}

function errorMessage(code?: string): string | null {
  switch (code) {
    case "oauth_start":
      return "Could not start Google sign-in. Check that Google is enabled in Supabase Auth and try again.";
    case "oauth_denied":
      return "Google sign-in was cancelled or denied. You can try again.";
    case "oauth_callback":
      return "Sign-in could not be completed. Please try again.";
    case "dev_mode_unavailable":
      return "Dev bypass only works when the app is running locally.";
    case "dev_mode_failed":
      return "Dev bypass sign-in failed. Check the Supabase service-role key in .env.local.";
    default:
      return code ? "Something went wrong during sign-in. Please try again." : null;
  }
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { next: nextRaw, error: errorCode } = await searchParams;
  const next = safeNext(nextRaw);
  const cameFromProtected = next !== "/";
  const err = errorMessage(errorCode);

  const user = await getCurrentUser();
  if (user.signedIn) redirect(next);

  return (
    <div className="mx-auto max-w-3xl lg:max-w-6xl px-5 py-10 md:py-14">
      <div className="mb-8 text-center">
        <p className="label-law mb-2">
          {cameFromProtected ? "Sign in required" : "Free account"}
        </p>
        <h1 className="heading-law text-3xl md:text-4xl">
          {cameFromProtected
            ? `Unlock ${destinationLabel(next)}`
            : "Sign in to unlock the exam layer"}
        </h1>
        <p className="mx-auto mt-2 max-w-lg font-serif text-sm leading-relaxed text-ink-2 md:text-base">
          {cameFromProtected ? (
            <>
              <strong className="font-semibold text-ink">
                {destinationLabel(next)}
              </strong>{" "}
              needs a free account. Here&apos;s everything you get after you
              sign in — then we&apos;ll send you to{" "}
              <code className="rounded bg-elevated-muted px-1.5 py-0.5 text-xs text-ink">
                {next}
              </code>
              .
            </>
          ) : (
            <>
              Reading the daily brief stays free. Create a free account for
              CLAT-focused extras on every story.
            </>
          )}
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[26rem_1fr] lg:items-start lg:gap-12">
        <div className="surface-hero mx-auto max-w-md p-6 sm:p-8 lg:sticky lg:top-16 lg:mx-0 lg:max-w-none lg:p-9">
          <p className="mb-5 text-center text-[15px] font-semibold text-ink">
            {cameFromProtected
              ? `Sign in to open ${destinationLabel(next)}`
              : "Ready? Sign in takes a second"}
          </p>

          {err && (
            <p
              role="alert"
              className="mb-3 rounded-sm border border-border-app bg-elevated-muted px-3 py-2 text-center text-xs leading-relaxed text-ink"
            >
              {err}
            </p>
          )}

          <form action={signInWithGoogle} className="mb-3">
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="btn-press inline-flex w-full items-center justify-center gap-3 rounded-md border border-border-app bg-elevated px-5 py-3.5 text-[15px] font-semibold text-ink shadow-sm transition-transform hover:-translate-y-0.5 hover:border-brand-border hover:bg-brand-soft hover:shadow-md"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="text-center text-xs leading-relaxed text-ink-3">
            Secure sign-in via Google. We only receive your name and email —
            no password stored here. After auth you return to where you were
            headed.
          </p>

          {process.env.NODE_ENV !== "production" && (
            <>
              <div className="my-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-ink-3">
                <span className="h-px flex-1 bg-border-app" />
                Local dev only
                <span className="h-px flex-1 bg-border-app" />
              </div>
              <form action={signInDevMode}>
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-brand-border bg-brand-soft/50 px-4 py-3 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  <DevIcon />
                  Dev bypass — skip Google
                </button>
              </form>
            </>
          )}
        </div>

        {/* Benefits live ONLY here — not in the sidebar */}
        <div className="mt-8 lg:mt-0">
          <AuthBenefits variant="full" nextPath={next} showCta={false} />
        </div>
      </div>

      <div className="mt-8 grid gap-2 text-center text-sm">
        <Link
          href="/"
          className="link-press font-medium text-brand hover:underline"
        >
          ← Keep reading without signing in
        </Link>
      </div>
    </div>
  );
}

function DevIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
