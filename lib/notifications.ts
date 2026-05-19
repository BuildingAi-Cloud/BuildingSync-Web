import { prisma } from "@/lib/prisma";
import type { NotificationItem } from "@/components/NotificationBell";

// Builds the notification feed for the current user. Reads existing
// tables (no separate Notification model):
//   • work-order updates  — residents see their own; staff see all in
//     their building
//   • new announcements   — filtered by audience
//   • package arrivals    — residents only; staff use /team/packages
//   • amenity bookings    — residents only; upcoming confirmations

const STAFF_ROLES = new Set(["building_manager", "facility_manager", "concierge"]);
const TAKE_PER_KIND = 6;
const TAKE_TOTAL = 12;

interface AppUserLite {
  id: string;
  role: string;
  buildingId: string | null;
}

export async function getNotifications(appUser: AppUserLite): Promise<NotificationItem[]> {
  if (!appUser.buildingId) return [];

  const isStaff = STAFF_ROLES.has(appUser.role);

  const [workOrders, announcements, packages, bookings] = await Promise.all([
    prisma.workOrder.findMany({
      where: isStaff
        ? { buildingId: appUser.buildingId }
        : { openedById: appUser.id },
      orderBy: { updatedAt: "desc" },
      take: TAKE_PER_KIND,
      select: { id: true, issue: true, status: true, unit: true, updatedAt: true },
    }),
    prisma.announcement.findMany({
      where: { buildingId: appUser.buildingId, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: TAKE_PER_KIND,
      select: { id: true, title: true, createdAt: true },
    }),
    // Residents see their own pending packages as notifications.
    // Staff don't — they use /team/packages directly.
    isStaff
      ? Promise.resolve([])
      : prisma.delivery
          .findMany({
            where: { recipientUserId: appUser.id, status: "pending" },
            orderBy: { receivedAt: "desc" },
            take: TAKE_PER_KIND,
            select: { id: true, sender: true, pickupCode: true, receivedAt: true },
          })
          .catch(() => []),
    // Upcoming amenity bookings — confirmation cue for residents.
    isStaff
      ? Promise.resolve([])
      : prisma.amenityBooking
          .findMany({
            where: {
              userId: appUser.id,
              status: { in: ["confirmed", "pending"] },
              startTime: { gte: new Date() },
            },
            orderBy: { startTime: "asc" },
            take: 3,
            select: { id: true, startTime: true, amenity: { select: { name: true } } },
          })
          .catch(() => []),
  ]);

  const woItems: NotificationItem[] = workOrders.map((wo) => ({
    id: `wo-${wo.id}`,
    kind: "work_order",
    title: wo.issue,
    meta: `${wo.status.replace("_", " ")}${wo.unit ? ` · Unit ${wo.unit}` : ""}`,
    href: isStaff ? "/team/work-orders" : "/dashboard/maintenance",
    createdAt: wo.updatedAt.toISOString(),
  }));

  const annItems: NotificationItem[] = announcements.map((a) => ({
    id: `ann-${a.id}`,
    kind: "announcement",
    title: a.title,
    meta: "Announcement",
    href: isStaff ? "/team/announcements" : "/dashboard/announcements",
    createdAt: a.createdAt.toISOString(),
  }));

  const pkgItems: NotificationItem[] = packages.map((p) => ({
    id: `pkg-${p.id}`,
    kind: "package",
    title: `Package from ${p.sender}`,
    meta: `Pickup code ${p.pickupCode}`,
    href: "/dashboard/deliveries",
    createdAt: p.receivedAt.toISOString(),
  }));

  const bookingItems: NotificationItem[] = bookings.map((b) => {
    const fmt = new Intl.DateTimeFormat("en", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
    return {
      id: `bk-${b.id}`,
      kind: "booking",
      title: `${b.amenity.name} booked`,
      meta: fmt.format(b.startTime),
      href: "/dashboard/amenities",
      // Bookings are "upcoming" — surface as recently-relevant so they
      // appear in Today/Yesterday buckets near other current items.
      createdAt: new Date().toISOString(),
    };
  });

  return [...woItems, ...annItems, ...pkgItems, ...bookingItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, TAKE_TOTAL);
}
