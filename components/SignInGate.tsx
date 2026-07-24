import Link from "next/link";
import { ArrowIconRight } from "./icons";
import { signInHref } from "@/lib/nav";

interface SignInGateProps {
  /** What the user gets when they sign in. Used as the panel's pitch. */
  benefit: string;
  /** Where the panel is shown — influences the heading copy. */
  context:
    | "key-points"
    | "why-it-matters"
    | "pyq"
    | "actions"
    | "exam-layer";
  /** compact = inline bar (actions); default = full conversion panel */
  variant?: "default" | "compact";
  /** Where sign-in should return after auth */
  nextPath?: string;
}

const CONTEXT_COPY: Record<
  SignInGateProps["context"],
  { title: string; sub: string }
> = {
  "key-points": {
    title: "Sign in to see the key points",
    sub: "We condense every story into 4–8 short, exam-ready points you can revise in 60 seconds.",
  },
  "why-it-matters": {
    title: "Sign in to see why this matters",
    sub: "A plain-English explanation of how today's story connects to your CLAT preparation.",
  },
  pyq: {
    title: "Sign in to see past CLAT questions",
    sub: "We surface past questions on the same topic so you can test yourself against real exam patterns.",
  },
  actions: {
    title: "Sign in to save and track",
    sub: "Save stories to revisit, mark them complete to track your daily reading.",
  },
  "exam-layer": {
    title: "Unlock the exam layer",
    sub: "Why it matters for CLAT, key points you can revise in a minute, and past questions on this topic — free with an account.",
  },
};

export function SignInGate({
  benefit,
  context,
  variant = "default",
  nextPath = "/",
}: SignInGateProps) {
  const copy = CONTEXT_COPY[context];
  const href = signInHref(nextPath);

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border-app bg-elevated-muted/70 px-4 py-3">
        <p className="font-serif text-sm text-ink-2">
          <span className="font-semibold text-ink">Sign in free</span>
          <span className="text-ink-3"> — {benefit}</span>
        </p>
        <Link
          href={href}
          className="btn-press shrink-0 rounded-md bg-brand px-3.5 py-1.5 text-xs font-semibold text-on-accent hover:bg-brand-hover"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-gate my-8">
      <div className="px-6 py-7 sm:px-8 sm:py-9">
        <p className="label-law mb-3 text-brand">Exam layer</p>
        <h2 className="heading-law mb-2 text-lg sm:text-xl">
          {copy.title}
        </h2>
        <p className="mb-4 max-w-lg font-serif text-sm leading-relaxed text-ink-2 sm:text-[15px]">
          {copy.sub}
        </p>
        <p className="mb-5 font-serif text-xs italic text-brand">{benefit}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={href}
            className="btn-press inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-brand-hover"
          >
            Sign in — see what you unlock
            <ArrowIconRight />
          </Link>
        </div>
      </div>
    </div>
  );
}


