import Link from "next/link";
import { requirePlatformAdmin } from "@/lib/platform";
import { prisma } from "@/lib/prisma";

export default async function PlatformDashboard() {
  const { authUser } = await requirePlatformAdmin();

  const [buildings, totalUsers, totalUnits, totalWorkOrders] = await Promise.all([
    prisma.building.findMany({
      include: { _count: { select: { users: true, units: true, workOrders: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
    prisma.unit.count(),
    prisma.workOrder.count(),
  ]);

  return (
    <main className="px-6 py-10 max-w-6xl mx-auto">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Platform admin</p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">{authUser.email}</p>
      </div>

      <div className="mt-10 grid sm:grid-cols-4 gap-3">
        <Stat label="Buildings" value={buildings.length} />
        <Stat label="Users" value={totalUsers} href="/platform/users" />
        <Stat label="Units" value={totalUnits} />
        <Stat label="Work orders" value={totalWorkOrders} />
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Buildings</h2>
          <Link
            href="/platform/buildings/new"
            className="text-sm px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            + New building
          </Link>
        </div>
        {buildings.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No buildings yet.</p>
        ) : (
          <div className="mt-4 bg-card border border-border rounded-md overflow-hidden">
            <ul className="divide-y divide-border">
              {buildings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/platform/buildings/${b.id}`}
                    className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {b.address}, {b.city}, {b.state} {b.zipCode}
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                      <span>{b._count.users} users</span>
                      <span>{b._count.units} units</span>
                      <span>{b._count.workOrders} WO</span>
                      <span aria-hidden className="text-muted-foreground/60">›</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        Onboarding stats, billing, support tools, and the building → owner mapping land post-launch.
      </p>
    </main>
  );
}

function Stat({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <>
      <div className="text-4xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </>
  );
  const className = "block p-5 bg-card border border-border rounded-md transition-colors";
  if (href) {
    return (
      <Link href={href} className={`${className} hover:border-accent`}>{inner}</Link>
    );
  }
  return <div className={className}>{inner}</div>;
}
