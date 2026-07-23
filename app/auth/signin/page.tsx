import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signInDemo } from "@/lib/auth-actions";
import { AuthBenefits } from "@/components/AuthBenefits";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

function safeNext(next?: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

/** Friendly label for what they tried to open */
function destinationLabel(next: string): string {
  if (next.startsWith("/favorites")) return "Saved";
  if (next.startsWith("/settings")) return "Settings";
  if (next.startsWith("/story")) return "Exam layer on this story";
  return next;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { next: nextRaw } = await searchParams;
  const next = safeNext(nextRaw);
  const cameFromProtected = next !== "/";

  const user = await getCurrentUser();
  if (user.signedIn) redirect(next);

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
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

      {/* Benefits live ONLY here — not in the sidebar */}
      <AuthBenefits variant="full" nextPath={next} showCta={false} />

      <div className="surface-hero mx-auto mt-8 max-w-md p-6 sm:p-8">
        <p className="mb-4 text-center text-sm font-semibold text-ink">
          {cameFromProtected
            ? `Sign in to open ${destinationLabel(next)}`
            : "Ready? Sign in takes a second"}
        </p>

        <form action={signInDemo} className="mb-3">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-accent hover:bg-brand-hover"
          >
            Continue with free demo account
          </button>
        </form>

        <button
          type="button"
          disabled
          className="btn-press mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border-app bg-elevated px-4 py-3 text-sm font-medium text-ink-2 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Continue with Google (soon)
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-3">
          Demo sign-in uses a local session cookie. After auth you return to
          where you were headed.
        </p>
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
