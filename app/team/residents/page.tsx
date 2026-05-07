import { requireTeam } from "@/lib/team";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/EmptyState";
import { Avatar } from "@/components/Avatar";
import { AddResidentForm } from "./AddResidentForm";
import { BulkAddForm } from "./BulkAddForm";

const CAN_ADD = ["building_manager", "facility_manager"];

export default async function TeamResidentsPage() {
  const { appUser } = await requireTeam();

  if (!appUser.buildingId) {
    return (
      <main className="px-4 md:px-6 py-8 md:py-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight">Residents</h1>
        <p className="mt-3 text-sm text-muted-foreground">No building assigned to your account.</p>
      </main>
    );
  }

  const [residents, units] = await Promise.all([
    prisma.user.findMany({
      where: {
        buildingId: appUser.buildingId,
        role: { in: ["resident", "tenant"] },
      },
      include: { unitRel: { select: { unitNumber: true } } },
      orderBy: [{ role: "asc" }, { email: "asc" }],
    }),
    CAN_ADD.includes(appUser.role)
      ? prisma.unit.findMany({
          where: { buildingId: appUser.buildingId },
          orderBy: { unitNumber: "asc" },
          select: { id: true, unitNumber: true },
        })
      : Promise.resolve([]),
  ]);

  const canAdd = CAN_ADD.includes(appUser.role);

  return (
    <main className="px-4 md:px-6 py-8 md:py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight">Residents</h1>
      <p className="mt-1 text-sm text-muted-foreground">{residents.length} in this building</p>

      {canAdd && (
        <div className="mt-8 grid lg:grid-cols-2 gap-3">
          <section className="bg-card border border-border rounded-md p-5">
            <h2 className="text-base font-semibold">Add a resident</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Creates an account and links it to this building. They sign in at /signin.
            </p>
            <AddResidentForm units={units} />
          </section>
          <section className="bg-card border border-border rounded-md p-5">
            <h2 className="text-base font-semibold">Bulk onboard via CSV</h2>
            <BulkAddForm />
          </section>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All residents</h2>
        {residents.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon="users"
              title="No residents linked yet"
              description={canAdd
                ? "Add a resident above with their email — they'll get a welcome with sign-in instructions."
                : "Once Building Manager links residents, you'll see them here."}
            />
          </div>
        ) : (
          <div className="mt-3 bg-card border border-border rounded-md overflow-hidden">
            <ul className="divide-y divide-border">
              {residents.map((r) => (
                <li key={r.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={r.name} email={r.email} />
                    <div className="min-w-0">
                      <div className="font-medium truncate">{r.name || r.email}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.email}</div>
                    </div>
                  </div>
                  <div className="text-sm flex items-center gap-3 shrink-0">
                    {(r.unitRel || r.unit) && (
                      <span className="text-muted-foreground">
                        Unit {r.unitRel?.unitNumber || r.unit}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-border bg-muted/30">
                      {r.role}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
