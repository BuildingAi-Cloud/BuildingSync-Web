// Manual run: npx tsx scripts/expire-verifications.ts
//
// Same logic as the Vercel cron at /api/cron/expire-verifications,
// invokable from any environment with database credentials. Useful
// for one-off sweeps after a long downtime, for on-prem appliances
// (which don't have Vercel Cron), or to back-fill if the cron is
// disabled.

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { expireDueVerifications } from "@/lib/verification-expiry";
import { prisma } from "@/lib/prisma";

async function main() {
  const result = await expireDueVerifications();
  console.log(`Scanned: ${result.scanned}  Expired: ${result.expired}`);
  if (result.byUser.length > 0) {
    console.log("\nBy user:");
    for (const u of result.byUser) {
      console.log(`  ${u.email ?? u.userId.slice(0, 8)}  ${u.companyName}  ${u.daysOverdue} days overdue`);
    }
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
