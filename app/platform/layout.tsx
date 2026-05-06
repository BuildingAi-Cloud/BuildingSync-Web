import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform";
import { Wordmark } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { authUser } = await requirePlatformAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-baseline gap-2">
              <Wordmark className="text-base" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Platform</span>
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/platform" className="text-muted-foreground hover:text-foreground transition-colors">Overview</Link>
              <Link href="/platform/users" className="text-muted-foreground hover:text-foreground transition-colors">Users</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ThemeToggle />
            <span className="text-muted-foreground hidden md:inline">{authUser.email}</span>
            <form action="/auth/signout" method="post">
              <button className="px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors text-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
