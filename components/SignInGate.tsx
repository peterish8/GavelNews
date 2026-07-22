import Link from "next/link";

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
    sub: "Favorite stories to revisit, mark them complete to track your daily reading.",
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
}: SignInGateProps) {
  const copy = CONTEXT_COPY[context];

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-app bg-elevated-muted/60 px-4 py-3">
        <p className="text-sm text-ink-2">
          <span className="font-medium text-ink">Sign in free</span>
          <span className="text-ink-3"> — {benefit}</span>
        </p>
        <Link
          href="/auth/signin?next=%2F"
          className="btn-press shrink-0 rounded-full bg-brand px-3.5 py-1.5 text-xs font-semibold text-[var(--on-accent)] hover:bg-brand-hover"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="surface-gate my-8">
      <div className="px-6 py-7 sm:px-8 sm:py-9">
        <div className="mb-4 inline-flex size-9 items-center justify-center rounded-full bg-brand text-[var(--on-accent)]">
          <LockIcon />
        </div>
        <h2 className="mb-2 font-ui text-lg font-semibold tracking-tight text-ink sm:text-xl">
          {copy.title}
        </h2>
        <p className="mb-4 max-w-lg text-sm text-ink-2 sm:text-[15px]">
          {copy.sub}
        </p>
        <p className="mb-5 text-xs font-medium text-brand">{benefit}</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/auth/signin?next=%2F"
            className="btn-press inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-[var(--on-accent)] hover:bg-brand-hover"
          >
            Sign in — see what you unlock
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="4"
        y="11"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14m-6-6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
