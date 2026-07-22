"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-ink antialiased">
        <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
          <h1 className="mb-2 font-ui text-2xl font-semibold">Something went wrong</h1>
          <p className="mb-6 text-sm text-ink-2">
            We hit an unexpected error rendering this page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-[var(--on-accent)] transition-all duration-[200ms] ease-out hover:bg-brand-hover active:scale-[0.97]"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}