import Link from "next/link";
import { requireTeam } from "@/lib/team";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { formatRelative } from "@/lib/format";

const STATUS_TONE: Record<string, string> = {
  open: "bg-accent/10 text-accent border-accent/30",
  in_progress: "bg-foreground/5 text-foreground border-border",
  scheduled: "bg-muted text-muted-foreground border-border",
  completed: "bg-muted/50 text-muted-foreground border-border",
  closed: "bg-muted/50 text-muted-foreground border-border line-through",
};

const ACTIVE_STATUSES = ["open", "in_progress", "scheduled"] as const;

export default async function TeamHome() {
  const { appUser } = await requireTeam();

  // Each query .catch'd individually — one failure shouldn't 500 the page.
  const [building, openCount, residentCount, announcementCount, recentWorkOrders] = appUser.buildingId
    ? await Promise.all([
        prisma.building.findUnique({ where: { id: appUser.buildingId } }).catch(() => null),
        prisma.workOrder.count({ where: { buildingId: appUser.buildingId, status: { in: [...ACTIVE_STATUSES] } } }).catch(() => 0),
        prisma.user.count({ where: { buildingId: appUser.buildingId, role: { in: ["resident", "tenant"] } } }).catch(() => 0),
        prisma.announcement.count({ where: { buildingId: appUser.buildingId, deletedAt: null } }).catch(() => 0),
        prisma.workOrder.findMany({
          where: { buildingId: appUser.buildingId, status: { in: [...ACTIVE_STATUSES] } },
          orderBy: [{ status: "asc" }, { createdAt: "desc" }],
          take: 4,
          include: { openedBy: { select: { name: true, email: true } } },
        }).catch((err) => {
          console.error("[team] recent workOrders failed", err);
          return [];
        }),
      ])
    : [null, 0, 0, 0, []];

  const isBM = appUser.role === "building_manager";

  return (
    <main className="px-4 md:px-6 py-8 md:py-10 max-w-5xl mx-auto">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{appUser.role.replace("_", " ")}</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{building ? building.name : "Your team"}</h1>
        {building && (
          <p className="text-sm text-muted-foreground">
            {building.address}, {building.city}, {building.state} {building.zipCode}
          </p>
        )}
        {!building && (
          <p className="text-sm text-muted-foreground">
            Your account is not yet linked to a building. Ask your platform admin.
          </p>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatLink href="/team/work-orders" value={openCount} label="Open work orders" />
        <StatLink href="/team/residents" value={residentCount} label="Residents" />
        <StatLink
          href={isBM ? "/team/announcements" : null}
          value={announcementCount}
          label="Announcements"
        />
      </div>

      <section className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Open work orders
          </h2>
          <Link href="/team/work-orders" className="text-xs text-accent hover:underline">
            View all
          </Link>
        </div>
        {recentWorkOrders.length === 0 ? (
          <EmptyState
            icon="tools"
            title="No open work orders"
            description="When residents submit a maintenance request you'll see it here."
          />
        ) : (
          <ul className="space-y-2">
            {recentWorkOrders.map((wo) => (
              <li key={wo.id} className="bg-card border border-border rounded-md px-4 py-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{wo.issue}</span>
                      {wo.unit && (
                        <span className="text-xs text-muted-foreground">Unit {wo.unit}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground/85 mt-1">
                      Opened by {wo.openedBy ? (wo.openedBy.name || wo.openedBy.email) : "—"} · {formatRelative(wo.createdAt)}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border shrink-0 ${STATUS_TONE[wo.status]}`}>
                    {wo.status.replace("_", " ")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function StatLink({ href, value, label }: { href: string | null; value: number; label: string }) {
  const inner = (
    <>
      <div className="text-3xl md:text-4xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </>
  );
  const className = "block p-5 bg-card border border-border rounded-md transition-colors";
  if (href) {
    return (
      <Link href={href} className={`${className} hover:border-accent`}>{inner}</Link>
    );
  }
  return <div className={`${className} opacity-60`}>{inner}</div>;
}
