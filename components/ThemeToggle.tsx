"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

// Compact segmented light/dark control (spec §10). Persists to localStorage.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function setTheme(dark: boolean) {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gavel-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gavel-theme", "light");
    }
  }

  if (!mounted) {
    return (
      <div
        className="flex h-10 w-full items-center rounded-[11px] border border-[rgba(205,198,220,0.38)] bg-[rgba(255,255,255,0.46)] p-0.5 dark:border-[rgba(180,170,210,0.16)] dark:bg-[rgba(26,24,40,0.55)]"
        aria-hidden
      >
        <span className="flex h-full flex-1 items-center justify-center gap-1.5 rounded-[9px] text-xs font-semibold text-ink-3">
          <span className="block size-3.5" />
          Light
        </span>
        <span className="flex h-full w-10 items-center justify-center text-ink-3">
          <span className="block size-3.5" />
        </span>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex h-10 w-full items-center rounded-[11px] border border-[rgba(205,198,220,0.38)] bg-[rgba(255,255,255,0.46)] p-0.5 dark:border-[rgba(180,170,210,0.16)] dark:bg-[rgba(26,24,40,0.55)]"
    >
      <button
        type="button"
        onClick={() => setTheme(false)}
        aria-pressed={!isDark}
        className={[
          "flex h-full flex-1 items-center justify-center gap-1.5 rounded-[9px] text-xs font-semibold transition-colors duration-150",
          !isDark
            ? "bg-white text-brand shadow-sm dark:bg-[rgba(255,255,255,0.08)]"
            : "text-ink-3 hover:text-ink-2",
        ].join(" ")}
      >
        <span className="[&>svg]:size-3.5">
          <SunIcon />
        </span>
        Light
      </button>
      <button
        type="button"
        onClick={() => setTheme(true)}
        aria-pressed={isDark}
        aria-label="Switch to dark theme"
        className={[
          "flex h-full w-10 items-center justify-center rounded-[9px] transition-colors duration-150",
          isDark
            ? "bg-white text-brand shadow-sm dark:bg-[rgba(255,255,255,0.08)]"
            : "text-ink-3 hover:text-ink-2",
        ].join(" ")}
      >
        <span className="[&>svg]:size-3.5">
          <MoonIcon />
        </span>
      </button>
    </div>
  );
}
