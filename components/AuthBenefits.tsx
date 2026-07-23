import Link from "next/link";
import { AUTH_BENEFITS, FREE_BENEFITS } from "@/lib/auth-benefits";
import { signInHref } from "@/lib/nav";

type AuthBenefitsProps = {
  /** full = two columns free vs unlock; compact = auth list only; panel = card for sidebar */
  variant?: "full" | "compact" | "panel";
  /** Where sign-in should return after auth */
  nextPath?: string;
  /** Show CTA button */
  showCta?: boolean;
  className?: string;
};

export function AuthBenefits({
  variant = "full",
  nextPath = "/",
  showCta = true,
  className = "",
}: AuthBenefitsProps) {
  if (variant === "panel") {
    return (
      <div
        className={`rounded-lg border border-brand-border bg-brand-soft/50 p-3.5 ${className}`}
      >
        <p className="label-law mb-0.5 text-brand">Free account unlocks</p>
        <p className="mb-2.5 font-serif text-[12px] leading-snug text-ink-2">
          Reading stays free. Sign in for the exam layer:
        </p>
        <ul className="mb-3 space-y-1.5">
          {AUTH_BENEFITS.slice(0, 5).map((b) => (
            <li
              key={b.id}
              className="flex items-start gap-1.5 text-[12px] leading-snug text-ink"
            >
              <Check className="mt-0.5 text-brand" />
              <span>
                <span className="font-semibold">{b.title}</span>
                <span className="text-ink-3"> — {b.detail}</span>
              </span>
            </li>
          ))}
          <li className="pl-4 font-serif text-[11px] italic text-ink-3">
            + {AUTH_BENEFITS.length - 5} more (settings, related, complete…)
          </li>
        </ul>
        {showCta && (
          <Link
            href={signInHref(nextPath)}
            className="btn-press flex w-full items-center justify-center rounded-md bg-brand px-3 py-2 text-xs font-semibold text-on-accent hover:bg-brand-hover"
          >
            See full list &amp; sign in
          </Link>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={className}>
        <p className="label-law mb-3">What you get when you sign in</p>
        <ul className="space-y-2.5">
          {AUTH_BENEFITS.map((b) => (
            <li key={b.id} className="flex gap-2.5 text-sm text-ink-2">
              <Check className="mt-0.5 shrink-0 text-brand" />
              <span>
                <span className="font-semibold text-ink">{b.title}</span>
                <span className="block font-serif text-[13px] text-ink-3">
                  {b.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // full comparison
  return (
    <div className={className}>
      <div className="mb-6 text-center sm:text-left">
        <p className="label-law mb-1.5">Free vs signed-in</p>
        <h2 className="heading-law text-xl md:text-2xl">
          What you get with an account
        </h2>
        <p className="mt-2 font-serif text-sm leading-relaxed text-ink-2">
          Everyone can read the brief. A free account unlocks the exam layer.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BenefitColumn
          label="Without signing in"
          badge="Always free"
          badgeTone="muted"
          items={FREE_BENEFITS}
        />
        <BenefitColumn
          label="With free account"
          badge="Unlocks on sign-in"
          badgeTone="brand"
          items={AUTH_BENEFITS}
          highlight
        />
      </div>

      {showCta && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href={signInHref(nextPath)}
            className="btn-press inline-flex rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-brand-hover"
          >
            Sign in free — unlock all of this
          </Link>
          <Link
            href="/"
            className="btn-press inline-flex rounded-md border border-border-app bg-elevated px-4 py-2.5 text-sm font-medium text-ink-2 hover:border-brand-border hover:text-brand"
          >
            Keep reading free
          </Link>
        </div>
      )}
    </div>
  );
}

function BenefitColumn({
  label,
  badge,
  badgeTone,
  items,
  highlight,
}: {
  label: string;
  badge: string;
  badgeTone: "muted" | "brand";
  items: { id: string; title: string; detail: string }[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        highlight
          ? "border-brand-border bg-brand-soft/35 shadow-sm"
          : "border-border-app bg-elevated/70"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h3 className="font-serif text-sm font-bold text-ink">{label}</h3>
        <span
          className={`rounded px-2 py-0.5 font-serif text-[10px] font-semibold tracking-wide ${
            badgeTone === "brand"
              ? "bg-brand text-on-accent"
              : "bg-elevated-muted text-ink-3"
          }`}
        >
          {badge}
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((b) => (
          <li key={b.id} className="flex gap-2.5">
            <Check
              className={
                highlight ? "mt-0.5 shrink-0 text-brand" : "mt-0.5 shrink-0 text-ink-3"
              }
            />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {b.title}
              </span>
              <span className="block font-serif text-[13px] leading-snug text-ink-3">
                {b.detail}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Check({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex size-4 items-center justify-center rounded-full bg-current/10 ${className}`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 12.5l4 4 10-10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

/** For signed-in users: short confirmation of unlocked perks */
export function AuthUnlockedNote({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border-app bg-elevated/85 p-3 ${className}`}
    >
      <p className="mb-1.5 font-serif text-[12px] font-semibold text-ink">
        Account active — unlocked
      </p>
      <ul className="space-y-1">
        {AUTH_BENEFITS.slice(0, 4).map((b) => (
          <li
            key={b.id}
            className="flex items-center gap-1.5 text-[11px] text-ink-2"
          >
            <Check className="text-brand" />
            {b.title}
          </li>
        ))}
        <li className="pl-4 font-serif text-[10px] italic text-ink-3">
          + saves, settings, related stories…
        </li>
      </ul>
    </div>
  );
}
