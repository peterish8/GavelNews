"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

// A labelled, familiar switch is clearer in the navigation than an icon-only
// control, especially when the drawer is open on small screens.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function setTheme(dark: boolean) {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("gavel-theme", dark ? "dark" : "light");
  }

  const activeDark = mounted && isDark;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={activeDark}
      aria-label={activeDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(!activeDark)}
      className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-border-app bg-elevated px-2.5 text-left transition-colors hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-panel text-ink-2" aria-hidden>
        {activeDark ? <MoonIcon /> : <SunIcon />}
      </span>
      <span className="min-w-0 flex-1 text-sm font-medium text-ink">
        {activeDark ? "Dark mode" : "Light mode"}
      </span>
      <span
        className={[
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          activeDark ? "bg-brand" : "bg-border-app",
        ].join(" ")}
        aria-hidden
      >
        <span
          className={[
            "size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
            activeDark ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </span>
    </button>
  );
}
