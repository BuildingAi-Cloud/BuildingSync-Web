import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Wordmark } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu, type MobileNavItem } from "@/components/MobileMenu";
import { SignOutButton } from "@/components/SignOutButton";
import { EmptyState } from "@/components/EmptyState";
import { NotificationBell } from "@/components/NotificationBell";
import { formatRelative } from "@/lib/format";
import { getNotifications } from "@/lib/notifications";

const STAFF_ROLES = ["building_manager", "facility_manager", "concierge"] as const;

const STATUS_TONE: Record<string, string> = {
  open: "bg-accent/10 text-accent border-accent/30",
  assigned: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-foreground/5 text-foreground border-border",
  closed: "bg-muted/50 text-muted-foreground border-border line-through",
};

export default async function DashboardPage() {
  const { authUser, appUser } = await requireUser();

  // Resident dashboard is for residents/tenants only. Staff land on /team.
  if ((STAFF_ROLES as readonly string[]).includes(appUser.role)) redirect("/team");

  const [building, unit, recentWorkOrders, recentAnnouncements, notifications] = await Promise.all([
    appUser.buildingId
      ? prisma.building.findUnique({ where: { id: appUser.buildingId } })
      : Promise.resolve(null),
    appUser.unitId
      ? prisma.unit.findUnique({ where: { id: appUser.unitId } })
      : Promise.resolve(null),
    prisma.workOrder.findMany({
      where: { openedById: appUser.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, issue: true, status: true, createdAt: true },
    }),
    appUser.buildingId
      ? prisma.announcement.findMany({
          where: { buildingId: appUser.buildingId },
          orderBy: { createdAt: "desc" },
          take: 2,
          select: { id: true, title: true, body: true, createdAt: true },
        })
      : Promise.resolve([]),
    getNotifications({ id: appUser.id, role: appUser.role, buildingId: appUser.buildingId }),
  ]);

  const navItems: MobileNavItem[] = [
    { href: "/dashboard/maintenance", label: "Maintenance" },
    { href: "/dashboard/announcements", label: "Announcements" },
    { href: "/dashboard/account", label: "Account" },
  ];
  const mobileFooter = (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <div className="font-medium text-foreground truncate">{authUser.email}</div>
        <div className="mt-0.5 capitalize">{appUser.role.replace("_", " ")}</div>
      </div>
      <SignOutButton fullWidth />
    </div>
  );

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3 max-w-3xl mx-auto">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <Link href="/dashboard" className="flex items-baseline gap-2 shrink-0">
              <Wordmark className="text-base" />
              <span className="hidden sm:inline text-xs text-muted-foreground uppercase tracking-wider">{appUser.role}</span>
            </Link>
            <nav className="hidden md:flex gap-5 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell items={notifications} />
            <ThemeToggle />
            <span className="hidden lg:inline text-sm text-muted-foreground">{authUser.email}</span>
            <div className="hidden md:block">
              <SignOutButton />
            </div>
            <MobileMenu items={navItems} rightSlot={mobileFooter} />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 py-8 md:py-10 max-w-3xl mx-auto">
        {building ? (
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your building</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{building.name}</h1>
            <p className="text-sm text-muted-foreground">
              {unit ? `Unit ${unit.unitNumber} · ` : ""}{building.address}, {building.city}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome to BuildingSync</h1>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your account isn&apos;t linked to a building yet. Ask your Building Manager to add you — you&apos;ll see your unit, work orders, and announcements here once they do.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Already onboarded but still seeing this? Email{" "}
              <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>.
            </p>
          </div>
        )}

        <nav className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
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

        {recentWorkOrders.length > 0 && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Your recent requests
              </h2>
              <Link href="/dashboard/maintenance" className="text-xs text-accent hover:underline">
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {recentWorkOrders.map((wo) => (
                <li key={wo.id} className="bg-card border border-border rounded-md px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{wo.issue}</div>
                    <div className="text-xs text-muted-foreground/85 mt-0.5">
                      {formatRelative(wo.createdAt)}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border shrink-0 ${STATUS_TONE[wo.status]}`}>
                    {wo.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {recentAnnouncements.length > 0 && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Latest announcements
              </h2>
              <Link href="/dashboard/announcements" className="text-xs text-accent hover:underline">
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {recentAnnouncements.map((a) => (
                <li key={a.id} className="bg-card border border-border rounded-md px-4 py-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                  <div className="text-xs text-muted-foreground/85 mt-2">
                    {formatRelative(a.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
