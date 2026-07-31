"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { BellIcon } from "./icons";
import { formatDate } from "@/lib/format";

type NotificationItem = {
  id: string;
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  editionDate: string;
};

const GUEST_SEEN_KEY = "gavel-news-notifications-seen-at";

export function NotificationCenter({ signedIn }: { signedIn: boolean }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [seenAt, setSeenAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/notifications", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!alive || !payload) return;
        setItems(payload.items ?? []);
        const localSeen = localStorage.getItem(GUEST_SEEN_KEY);
        setSeenAt(payload.lastSeenAt ?? localSeen);
      })
      .catch(() => {
        if (alive) setSeenAt(localStorage.getItem(GUEST_SEEN_KEY));
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const unreadCount = useMemo(() => {
    if (!seenAt) return items.length;
    return items.filter((item) => item.publishedAt > seenAt).length;
  }, [items, seenAt]);

  function markAllRead() {
    const now = new Date().toISOString();
    setSeenAt(now);
    localStorage.setItem(GUEST_SEEN_KEY, now);
    if (signedIn) {
      fetch("/api/notifications", { method: "POST" }).catch(() => {
        // The local timestamp keeps the panel calm; the server retries next open.
      });
    }
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="icon-btn glass-input relative inline-flex size-12 items-center justify-center rounded-[13px] text-ink-2 hover:border-brand-border hover:bg-brand-soft hover:text-brand"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full border-2 border-[var(--bg)] bg-brand px-1 text-[10px] font-bold leading-5 text-on-accent">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section className="gav-notifications absolute right-0 top-[calc(100%+0.6rem)] z-[60] w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-[14px] border border-border-app bg-elevated shadow-[0_16px_38px_rgba(0,0,0,0.18)]">
          <header className="flex items-center justify-between border-b border-border-app px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink">Latest news</h2>
              <p className="mt-0.5 text-[11px] text-ink-3">Newly published legal briefs</p>
            </div>
            {unreadCount > 0 && <span className="text-[11px] font-semibold text-brand">{unreadCount} new</span>}
          </header>
          <div className="theme-scrollbar max-h-[min(28rem,65vh)] overflow-y-auto overscroll-contain">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-3">No published news yet.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={`/story/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border-app/70 px-4 py-3 last:border-b-0 hover:bg-brand-soft"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand">
                      {item.category.replaceAll("-", " ")}
                    </span>
                    <time className="shrink-0 text-[10px] text-ink-3">{formatDate(item.editionDate)}</time>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{item.title}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
