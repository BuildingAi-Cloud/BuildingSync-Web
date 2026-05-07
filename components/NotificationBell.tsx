"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export type NotificationItem = {
  id: string;
  kind: "work_order" | "announcement";
  title: string;
  meta: string;
  href: string;
  createdAt: string; // ISO
  read?: boolean;
};

// Lightweight notification dropdown. The "unread count" is computed
// client-side from a localStorage timestamp ("last seen") — the first
// time the user opens the bell we save NOW(), and any item created
// after that is "new" until next open.
const LAST_SEEN_KEY = "bs-notifications-last-seen";

export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const v = window.localStorage.getItem(LAST_SEEN_KEY);
    setLastSeen(v ? Number(v) : 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const now = Date.now();
        window.localStorage.setItem(LAST_SEEN_KEY, String(now));
        setLastSeen(now);
      }
      return next;
    });
  }

  const unreadCount = items.filter((i) => new Date(i.createdAt).getTime() > lastSeen).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} new` : "Notifications"}
        aria-expanded={open}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold leading-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="menu"
            aria-label="Notifications"
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Activity</p>
              {unreadCount > 0 && (
                <span className="text-[10px] uppercase tracking-wider text-accent">{unreadCount} new</span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Nothing new.</p>
                <p className="mt-1 text-xs text-muted-foreground/85">
                  Updates to work orders and new announcements will show up here.
                </p>
              </div>
            ) : (
              <ul className="max-h-96 overflow-y-auto divide-y divide-border">
                {items.map((item) => {
                  const isNew = new Date(item.createdAt).getTime() > lastSeen;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="block px-4 py-3 hover:bg-muted/30 transition-colors focus:outline-none focus:bg-muted/40"
                      >
                        <div className="flex items-start gap-3">
                          <KindIcon kind={item.kind} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm truncate ${isNew ? "font-semibold text-foreground" : "text-foreground/90"}`}>
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground/80 mt-0.5 truncate">{item.meta}</p>
                          </div>
                          {isNew && (
                            <span aria-hidden="true" className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function KindIcon({ kind }: { kind: NotificationItem["kind"] }) {
  return (
    <span className="shrink-0 w-7 h-7 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {kind === "work_order" ? (
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        ) : (
          <>
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </>
        )}
      </svg>
    </span>
  );
}
