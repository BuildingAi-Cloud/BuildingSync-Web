"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <AuthShell back={{ href: "/", label: "Home" }}>
      <div className="text-center py-8 sm:py-12">
        <p
          className="tracking-tighter text-accent/40 select-none"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(5rem, 14vw, 9rem)", lineHeight: 0.9 }}
        >
          OOPS
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          We hit an unexpected error. Try again — if it keeps happening, let us know at{" "}
          <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Take me home
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
