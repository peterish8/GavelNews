"use client";

import { useEffect, useState } from "react";
import type { Exam, Profile } from "@/lib/types";

const DEFAULTS: Profile = {
  id: "local",
  displayName: "",
  exam: "UG",
  attemptYear: 2026, // Base year, will be updated to current year in component
  theme: "system",
  fontSize: "medium",
  marketingOptIn: false,
};

const KEY = "gavel-profile";

export function SettingsForm() {
  const [profile, setProfile] = useState<Profile>(DEFAULTS);
  const [saved, setSaved] = useState(false);
  
  // Generate attempt years dynamically starting from current year
  const currentYear = new Date().getFullYear();
  const attemptYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        setProfile({ ...DEFAULTS, ...JSON.parse(raw) });
      } else {
        // If no saved profile, initialize with current year
        const currentYear = new Date().getFullYear();
        setProfile({ ...DEFAULTS, attemptYear: currentYear });
      }
    } catch {}
  }, []);

  const update = <K extends keyof Profile>(k: K, v: Profile[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
    setSaved(false);
  };

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(profile));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Exam + Year */}
      <section className="surface-standard p-5 md:p-6">
        <h2 className="mb-1 font-ui text-sm font-semibold uppercase tracking-wider text-ink-3">
          Exam target
        </h2>
        <p className="mb-4 text-sm text-ink-2">
          We use this to surface stories relevant to your preparation.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Exam</label>
            <div className="flex gap-2">
              {(["UG", "PG", "Both"] as const).map((opt) => {
                const active = profile.exam === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("exam", opt as Exam)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-[200ms] ease-out active:scale-[0.97] ${
                      active
                        ? "border-brand bg-brand text-on-accent"
                        : "border-border-app bg-elevated text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Attempt year</label>
            <select
              value={profile.attemptYear}
              onChange={(e) => update("attemptYear", Number(e.target.value))}
              className="w-full rounded-xl border border-border-app bg-elevated px-3.5 py-2.5 text-sm text-ink transition-colors hover:border-brand-border focus:border-brand focus:outline-none"
            >
              {attemptYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="surface-standard p-5 md:p-6">
        <h2 className="mb-1 font-ui text-sm font-semibold uppercase tracking-wider text-ink-3">
          Appearance
        </h2>
        <p className="mb-4 text-sm text-ink-2">
          Reading comfort is reading comprehension.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Theme</label>
            <div className="flex gap-2">
              {(["light", "dark", "system"] as const).map((opt) => {
                const active = profile.theme === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      update("theme", opt);
                      // Apply immediately via the same gavel-theme key ThemeToggle/layout use
                      try {
                        if (opt === "dark") {
                          document.documentElement.classList.add("dark");
                          localStorage.setItem("gavel-theme", "dark");
                        } else if (opt === "light") {
                          document.documentElement.classList.remove("dark");
                          localStorage.setItem("gavel-theme", "light");
                        } else {
                          // system
                          localStorage.removeItem("gavel-theme");
                          const prefersDark = window.matchMedia(
                            "(prefers-color-scheme: dark)",
                          ).matches;
                          document.documentElement.classList.toggle(
                            "dark",
                            prefersDark,
                          );
                        }
                      } catch {
                        /* ignore */
                      }
                    }}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-all duration-[200ms] ease-out active:scale-[0.97] ${
                      active
                        ? "border-brand bg-brand text-on-accent"
                        : "border-border-app bg-elevated text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-ink">Font size</label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((opt) => {
                const active = profile.fontSize === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => update("fontSize", opt)}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium capitalize transition-all duration-[200ms] ease-out active:scale-[0.97] ${
                      active
                        ? "border-brand bg-brand text-on-accent"
                        : "border-border-app bg-elevated text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <p
          className={`text-sm text-success transition-opacity duration-200 ${
            saved ? "opacity-100" : "opacity-0"
          }`}
        >
          ✓ Saved
        </p>
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-on-accent transition-all duration-[200ms] ease-out hover:bg-brand-hover active:scale-[0.97]"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}