"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function NavSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        title="Search (⌘K)"
        className="icon-btn inline-flex size-9 items-center justify-center rounded-full border border-border-app bg-elevated/80 text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
      >
        <SearchIcon />
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="flex h-9 items-center gap-1.5 rounded-full border border-brand-border bg-elevated px-2.5 shadow-[var(--shadow-brand-sm,0_0_0_1px_rgba(37,99,235,0.08))]"
    >
      <SearchIcon className="text-brand" />
      <input
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => {
          // Keep open if user is typing; close when empty on blur
          if (!q.trim()) setTimeout(() => setOpen(false), 120);
        }}
        placeholder="Search archive…"
        className="w-28 bg-transparent text-[13px] text-ink placeholder:text-ink-3 focus:outline-none sm:w-40 md:w-48"
        aria-label="Search the archive"
      />
      <button
        type="button"
        onClick={() => {
          setQ("");
          setOpen(false);
        }}
        className="rounded-full p-1 text-ink-3 hover:bg-elevated-muted hover:text-ink"
        aria-label="Close search"
      >
        <CloseIcon />
      </button>
    </form>
  );
}

function SearchIcon({ className = "text-current" }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
