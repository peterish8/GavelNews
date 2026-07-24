"use client";

import { useState } from "react";
import { SearchIcon, CloseIcon } from "./icons";

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
      className={`glass-input flex h-12 items-center gap-2 rounded-[13px] px-4 transition-all duration-[200ms] ease-out ${
        focused
          ? "border-brand shadow-[var(--shadow-brand-sm)]"
          : ""
      }`}
    >
      <SearchIcon focused={focused} className="" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search all stories…"
        className="flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-3 focus:outline-none"
        aria-label="Search all stories"
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

