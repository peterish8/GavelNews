import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { signInWithGoogle, signInDevMode } from "@/lib/auth-actions";

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
    <div className="mx-auto max-w-3xl lg:max-w-6xl px-5 py-6 md:py-8">
      <div className="mb-6 text-center">
        <p className="label-law mb-2">
          {cameFromProtected ? "Sign in required" : "Free account"}
        </p>
        <h1 className="heading-law text-2xl md:text-3xl">
          {cameFromProtected
            ? `Unlock ${destinationLabel(next)}`
            : "Compare your options"}
        </h1>
        <p className="mx-auto mt-1.5 max-w-lg font-serif text-sm leading-relaxed text-ink-2">
          {cameFromProtected ? (
            <>
              <strong className="font-semibold text-ink">
                {destinationLabel(next)}
              </strong>{" "}
              requires a free account. Compare your options below.
            </>
          ) : (
            <>
              Choose how you want to use Gavel News. Both options are free.
            </>
          )}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Without Sign In Box */}
          <div className="rounded-xl border-2 border-border-app bg-elevated/50 p-6 opacity-90">
            <div className="text-center mb-6">
              <p className="label-law mb-2 text-ink-3">Without Sign In</p>
              <h3 className="heading-law text-xl text-ink">Free Reading</h3>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-ink-3 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span className="text-ink-2">Daily morning brief</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-ink-3 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span className="text-ink-2">Story teaser (what happened, background)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-ink-3 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <span className="text-ink-2">Archive & search</span>
              </li>
            </ul>

            <div className="pt-4 border-t border-border-app">
              <p className="text-center text-sm text-ink-3">
                <span className="line-through opacity-60">Exam layer analysis</span>
                <span className="mx-2">•</span>
                <span className="line-through opacity-60">Key points</span>
                <span className="mx-2">•</span>
                <span className="line-through opacity-60">Past questions</span>
              </p>
            </div>
          </div>

          {/* With Free Account Box */}
          <div className="rounded-xl border-2 border-brand-border bg-brand-soft/30 p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block px-4 py-1 bg-brand text-on-accent text-sm font-semibold rounded-full">
                Most Popular
              </span>
            </div>
            
            <div className="text-center mb-6">
              <p className="label-law mb-2 text-brand">With Free Account</p>
              <h3 className="heading-law text-xl text-ink">Exam Layer Unlocked</h3>
            </div>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-ink font-medium">Everything in free reading</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-ink font-medium">Why it matters for CLAT</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-ink font-medium">Key points (revise in 60 seconds)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-ink font-medium">Past CLAT questions</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-brand mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className="text-ink font-medium">Saved stories & progress tracking</span>
              </li>
            </ul>

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
                className="btn-press group relative inline-flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border-app bg-white px-5 py-4 text-[15px] font-semibold text-ink shadow-md transition-all hover:-translate-y-0.5 hover:border-brand-border hover:shadow-xl hover:shadow-brand/10 active:translate-y-0 active:shadow-sm"
              >
                <GoogleIcon />
                <span className="relative z-10">Continue with Google</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-soft/50 to-brand-2-soft/30 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-ink-3">
              <svg className="w-3 h-3 text-brand" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Free forever • No credit card</span>
            </div>

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
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        <Link
          href="/"
          className="link-press font-medium text-brand hover:underline"
        >
          ← Continue reading without signing in
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
