"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "./icons";

// Tiny CSS-only sun/moon toggle. Persists to localStorage. Respects system.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("gavel-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("gavel-theme", "light");
    }
  }

  // Render a stable placeholder on SSR; the real button after mount.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="icon-btn inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/80 text-ink-2 hover:border-brand-border hover:text-brand"
      >
        <span className="block size-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="icon-btn inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/80 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}