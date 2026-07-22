import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <h1 className="mb-3 font-ui text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        About Gavel News
      </h1>
      <p className="mb-4 text-ink-2">
        Gavel News is a daily CLAT current-affairs reader, written for UG and PG
        aspirants. Every morning, we publish a short edition of the day&apos;s
        most legally important stories — picked from the Supreme Court, High
        Courts, Parliament, regulators, and statutory amendments.
      </p>
      <p className="mb-4 text-ink-2">
        Behind the scenes, an editorial engine reads newspapers and legal sites,
        Claude writes the drafts, and an editor reviews and approves what goes
        out. This site is the student-facing reader.
      </p>
      <p className="text-ink-2">
        Questions or feedback? <Link href="mailto:hello@gavelnews.in" className="text-brand underline">hello@gavelnews.in</Link>.
      </p>
    </div>
  );
}