"use client";

import { useState } from "react";

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
}

export function SearchInput({ value, onChange, onSubmit }: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className={`flex items-center gap-2 rounded-2xl border bg-elevated px-4 py-3 transition-all duration-[200ms] ease-out ${
        focused
          ? "border-brand shadow-[var(--shadow-brand-sm)]"
          : "border-border-app shadow-[var(--s1)]"
      }`}
    >
      <SearchIcon focused={focused} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search the archive…"
        className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
        aria-label="Search the archive"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full p-1 text-ink-3 transition-colors hover:bg-elevated-muted hover:text-ink"
          aria-label="Clear search"
        >
          <CloseIcon />
        </button>
      )}
    </form>
  );
}

function SearchIcon({ focused }: { focused: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={focused ? "text-brand transition-colors" : "text-ink-3 transition-colors"}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}