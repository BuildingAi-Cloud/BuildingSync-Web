import Link from "next/link";
import { requireTeam } from "@/lib/team";
import { Wordmark } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const { authUser, appUser } = await requireTeam();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/team" className="flex items-baseline gap-2">
              <Wordmark className="text-base" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Team</span>
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/team/work-orders" className="text-muted-foreground hover:text-foreground transition-colors">Work orders</Link>
              <Link href="/team/residents" className="text-muted-foreground hover:text-foreground transition-colors">Residents</Link>
              {(appUser.role === "building_manager" || appUser.role === "facility_manager") && (
                <Link href="/team/units" className="text-muted-foreground hover:text-foreground transition-colors">Units</Link>
              )}
              {appUser.role === "building_manager" && (
                <Link href="/team/announcements" className="text-muted-foreground hover:text-foreground transition-colors">Announcements</Link>
              )}
              {(appUser.role === "concierge" || appUser.role === "building_manager") && (
                <Link href="/team/packages" className="text-muted-foreground hover:text-foreground transition-colors">Packages</Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <ThemeToggle />
            <span className="text-muted-foreground hidden md:inline">
              {authUser.email} · {appUser.role.replace("_", " ")}
            </span>
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
