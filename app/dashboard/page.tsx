import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wordmark } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";

const STAFF_ROLES = ["building_manager", "facility_manager", "concierge"] as const;

export default async function DashboardPage() {
  const { authUser, appUser } = await requireUser();

  // Resident dashboard is for residents/tenants only. Staff land on /team.
  if ((STAFF_ROLES as readonly string[]).includes(appUser.role)) redirect("/team");

  const building = appUser.buildingId
    ? await prisma.building.findUnique({ where: { id: appUser.buildingId } })
    : null;
  const unit = appUser.unitId
    ? await prisma.unit.findUnique({ where: { id: appUser.unitId } })
    : null;

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-3 flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <Link href="/dashboard" className="flex items-baseline gap-2">
            <Wordmark className="text-base" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{appUser.role}</span>
          </Link>
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

      <main className="px-6 py-10 max-w-3xl mx-auto">
        <div className="space-y-1">
          {building ? (
            <>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Your building</p>
              <h1 className="text-4xl font-semibold tracking-tight">{building.name}</h1>
              <p className="text-sm text-muted-foreground">
                {unit ? `Unit ${unit.unitNumber} · ` : ""}{building.address}, {building.city}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-semibold tracking-tight">Welcome</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your account is not yet linked to a building. Ask your Building Manager to assign you.
              </p>
            </>
          )}
        </div>

        <nav className="mt-10 grid sm:grid-cols-2 gap-3">
          <Link
            href="/dashboard/maintenance"
            className="block bg-card border border-border rounded-md p-5 hover:border-accent transition-colors"
          >
            <div className="font-semibold">Maintenance</div>
            <div className="text-sm text-muted-foreground mt-1">Request a repair, see open tickets</div>
          </Link>
          <Link
            href="/dashboard/announcements"
            className="block bg-card border border-border rounded-md p-5 hover:border-accent transition-colors"
          >
            <div className="font-semibold">Announcements</div>
            <div className="text-sm text-muted-foreground mt-1">Notices from your building team</div>
          </Link>
        </nav>
      </main>
    </div>
  );
}
