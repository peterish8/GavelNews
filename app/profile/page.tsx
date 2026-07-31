import { requireUser } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { SignOutIcon } from "@/components/icons";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const email = user.email ?? "";
  const name = email.split("@")[0] || "Account";
  const initial = (name[0] ?? "G").toUpperCase();

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <header className="mb-9">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          Account
        </p>
        <h1 className="font-ui text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Your profile
        </h1>
      </header>

      <section className="rounded-2xl border border-border-app bg-elevated p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-brand text-lg font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-ink">{name}</h2>
            <p className="truncate text-sm text-ink-3">{email}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border-app bg-elevated p-5">
        <h2 className="text-base font-semibold text-ink">Session</h2>
        <p className="mt-1 text-sm text-ink-3">Sign out of Gavel News on this device.</p>
        <form action={signOut} className="mt-5">
          <input type="hidden" name="next" value="/" />
          <button
            type="submit"
            className="btn-press inline-flex h-10 items-center gap-2 rounded-xl border border-brand-border bg-brand-soft px-4 text-sm font-semibold text-brand hover:bg-brand hover:text-on-accent"
          >
            <SignOutIcon />
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
