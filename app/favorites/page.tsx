import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { FavoritesList } from "@/components/FavoritesList";

export default async function FavoritesPage() {
  // Guests → /auth/signin?next=/favorites
  await requireUser("/favorites");

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <header className="mb-8 border-b border-border-app pb-6">
        <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          Your library
        </p>
        <h1 className="mb-2 font-ui text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Saved
        </h1>
        <p className="text-ink-2">
          Stories you saved while reading. Open any story and tap Save to
          add it here.{" "}
          <Link href="/" className="font-medium text-brand hover:underline">
            Browse today
          </Link>
        </p>
      </header>

      <FavoritesList />
    </div>
  );
}
