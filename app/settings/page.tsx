import { SettingsForm } from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:py-16">
      <header className="mb-10">
        <h1 className="mb-2 font-ui text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Settings
        </h1>
        <p className="text-ink-2">
          Personalize your reading experience. Preferences are saved to your
          device; sign in to sync across devices.
        </p>
      </header>

      <SettingsForm />
    </div>
  );
}