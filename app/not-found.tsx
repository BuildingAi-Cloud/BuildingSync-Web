import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";

export default function NotFound() {
  return (
    <AuthShell back={{ href: "/", label: "Home" }}>
      <div className="text-center py-8 sm:py-12">
        <p
          className="tracking-tighter text-accent/40 select-none"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(5rem, 14vw, 9rem)", lineHeight: 0.9 }}
        >
          404
        </p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          The page you&apos;re looking for moved, doesn&apos;t exist, or was never linked from where you came from. Check the URL, or head back home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors"
          >
            Take me home
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-border text-sm font-medium hover:border-accent hover:text-accent transition-colors"
          >
            Read the docs
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
