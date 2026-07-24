import { requireUser } from "@/lib/auth";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  // Guests → /auth/signin?next=/settings
  await requireUser("/settings");

  return (
    <div className="mx-auto max-w-2xl px-5 py-10 md:py-14">
      <header className="mb-10">
        <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-3">
          Your library
        </p>
        <h1 className="mb-2 font-ui text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Settings
        </h1>
        <p className="text-ink-2">
          Personalize your reading experience. Preferences save on this device;
          they sync across devices once Supabase auth is live.
        </p>
      </header>

      <SettingsForm />
    </div>
  );
}
