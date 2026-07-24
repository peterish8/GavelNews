"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

// Sliding light/dark switch. Persists to localStorage. Respects system.
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

  // Track: ~44×24, thumb: 18px, end icons always visible (inactive dimmed)
  const track =
    "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[rgba(205,198,220,0.38)] bg-[rgba(255,255,255,0.72)] p-0.5 transition-colors duration-200 dark:border-[rgba(180,170,210,0.16)] dark:bg-[rgba(26,24,40,0.72)]";

  if (!mounted) {
    return (
      <div className={`${track} justify-center`} aria-hidden>
        <span className="absolute left-1 text-ink-3 opacity-50 [&>svg]:size-3">
          <SunIcon />
        </span>
        <span className="absolute right-1 text-ink-3 opacity-50 [&>svg]:size-3">
          <MoonIcon />
        </span>
        <span className="size-[18px] rounded-full bg-white shadow-sm dark:bg-[rgba(255,255,255,0.12)]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(!isDark)}
      className={[
        track,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
      ].join(" ")}
    >
      {/* Static end icons — inactive side dimmed */}
      <span
        className={[
          "pointer-events-none absolute left-1 z-0 text-ink-3 transition-opacity duration-200 [&>svg]:size-3",
          isDark ? "opacity-35" : "opacity-80 text-brand",
        ].join(" ")}
        aria-hidden
      >
        <SunIcon />
      </span>
      <span
        className={[
          "pointer-events-none absolute right-1 z-0 text-ink-3 transition-opacity duration-200 [&>svg]:size-3",
          isDark ? "opacity-80 text-brand" : "opacity-35",
        ].join(" ")}
        aria-hidden
      >
        <MoonIcon />
      </span>

      {/* Sliding thumb — 44px track − 4px pad − 18px thumb ≈ 22px travel */}
      <span
        className={[
          "pointer-events-none relative z-10 size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-out dark:bg-[rgba(255,255,255,0.14)]",
          isDark
            ? "translate-x-[22px] ring-1 ring-brand/25"
            : "translate-x-0",
        ].join(" ")}
        aria-hidden
      />
    </button>
  );
}
