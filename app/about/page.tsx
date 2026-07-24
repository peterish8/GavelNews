import Link from "next/link";
import { AuthBenefits } from "@/components/AuthBenefits";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <p className="mb-3 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
        About
      </p>
      <h1 className="mb-4 font-ui text-3xl font-bold tracking-tight text-ink md:text-4xl">
        About Gavel News
      </h1>
      <div className="mb-10 space-y-4 text-[15px] leading-relaxed text-ink-2">
        <p>
          Gavel News is a daily CLAT current-affairs reader for UG and PG
          aspirants. Every morning we publish a short edition of the day&apos;s
          most legally important stories — from the Supreme Court, High Courts,
          Parliament, regulators, and statutory amendments.
        </p>
        <p>
          Behind the scenes, an editorial engine reads newspapers and legal
          sites, drafts are reviewed, and only approved stories ship. This site
          is the student-facing reader.
        </p>
      </div>

      <AuthBenefits variant="full" nextPath="/" showCta />

      <p className="mt-12 text-sm text-ink-3">
        Questions?{" "}
        <a
          href="mailto:hello@gavelnews.in"
          className="font-medium text-brand underline underline-offset-2"
        >
          hello@gavelnews.in
        </a>
        {" · "}
        <Link href="/" className="font-medium text-brand hover:underline">
          Today&apos;s edition
        </Link>
      </p>
    </div>
  );
}
