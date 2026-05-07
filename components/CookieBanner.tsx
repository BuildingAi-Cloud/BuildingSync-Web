"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Cookie / tracking notice. PIPEDA + CASL don't strictly require an
// EU-style consent banner because we only use one ESSENTIAL cookie
// (Supabase Auth session — required to keep you signed in) and zero
// trackers. But surfacing this with a clear acknowledgement is good
// hygiene for QC residents (Loi 25 expects "transparency around
// technology used to collect personal info") and gives institutional
// customers something to point at on review.
const KEY = "bs-cookie-acknowledged-v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(KEY) === "1") return;
    // Tiny delay so it doesn't compete with the beta banner / first paint.
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, []);

  function acknowledge() {
    setShow(false);
    window.localStorage.setItem(KEY, "1");
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto pointer-events-none"
          role="dialog"
          aria-labelledby="cookie-title"
        >
          <div className="pointer-events-auto bg-card border border-border rounded-xl shadow-2xl p-4">
            <p id="cookie-title" className="text-sm font-semibold text-foreground">
              Cookies & data
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              BuildingSync uses one essential cookie — your sign-in session — and no third-party trackers, advertising pixels, or analytics. See the{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>{" "}
              for the full picture.
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Link
                href="/privacy"
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Read policy
              </Link>
              <button
                type="button"
                onClick={acknowledge}
                className="px-3 py-1.5 text-xs font-semibold bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
