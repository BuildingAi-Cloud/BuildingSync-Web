import { NextResponse, type NextRequest } from "next/server";
import { expireDueVerifications } from "@/lib/verification-expiry";

// Vercel cron handler — runs daily, sweeps expired ManagerVerification
// rows. Protected by CRON_SECRET so a random outsider can't trigger
// the sweep + flood the audit log.
//
// Vercel cron config (in vercel.json):
//   { "crons": [{ "path": "/api/cron/expire-verifications",
//                 "schedule": "0 3 * * *" }] }
// Schedules a daily run at 03:00 UTC. Adjust to off-hours for your
// primary region as needed.

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured" },
      { status: 500 },
    );
  }
  const provided = request.headers.get("authorization");
  if (provided !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const result = await expireDueVerifications();
  return NextResponse.json({ ok: true, ...result });
}
