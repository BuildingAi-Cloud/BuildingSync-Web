import { prisma } from "@/lib/prisma";
import { logAuditFireAndForget } from "@/lib/audit";

// Scheduled-expiry sweep for ManagerVerification rows. Run daily via
// the Vercel cron at /api/cron/expire-verifications, or manually via
// scripts/expire-verifications.ts.
//
// For each verification row where validUntil < NOW() and status is
// still "approved":
//   1. Mark the row status = "expired"
//   2. Update the user's nextVerificationDue cache (this stays past-
//      due so the banner keeps showing until admin re-verifies)
//
// Doesn't archive the user or revoke /team access — that's a policy
// call for the admin. Banner pressure + audit log entry create the
// follow-up nudge.

export type ExpireResult = {
  scanned: number;
  expired: number;
  byUser: Array<{ userId: string; email: string | null; companyName: string; daysOverdue: number }>;
};

export async function expireDueVerifications(): Promise<ExpireResult> {
  const now = new Date();

  const due = await prisma.managerVerification.findMany({
    where: {
      status: "approved",
      validUntil: { lt: now, not: null },
    },
    select: {
      id: true,
      userId: true,
      validUntil: true,
      companyName: true,
      user: { select: { email: true } },
    },
  });

  if (due.length === 0) return { scanned: 0, expired: 0, byUser: [] };

  const ids = due.map((d) => d.id);
  await prisma.managerVerification.updateMany({
    where: { id: { in: ids } },
    data: { status: "expired" },
  });

  // One audit row per user — quieter than one per row. The audit
  // log entries are evidence-grade for the customer's compliance
  // review (LTB / insurance / SOC 2 etc).
  const seen = new Set<string>();
  const byUser: ExpireResult["byUser"] = [];
  for (const d of due) {
    if (seen.has(d.userId)) continue;
    seen.add(d.userId);
    const daysOverdue = d.validUntil
      ? Math.max(1, Math.floor((now.getTime() - d.validUntil.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
    byUser.push({
      userId: d.userId,
      email: d.user.email,
      companyName: d.companyName,
      daysOverdue,
    });
    logAuditFireAndForget({
      userId: d.userId,
      userEmail: d.user.email ?? "",
      action: "manager_verification.expired",
      resource: "ManagerVerification",
      resourceId: d.id,
      changes: {
        companyName: d.companyName,
        validUntil: d.validUntil?.toISOString() ?? null,
        daysOverdue,
      },
    });
  }

  return { scanned: due.length, expired: due.length, byUser };
}
