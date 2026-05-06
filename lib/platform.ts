import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

const ADMIN_HOST = process.env.ADMIN_HOST || "admin.buildingsync.app";

// Platform admin = BuildingSync company staff. Strictly lives at
// admin.buildingsync.app so /platform isn't reachable via the customer
// portal at www.* — see app/page.tsx for the cross-host redirect on
// authed visits.
export async function requirePlatformAdmin() {
  const h = await headers();
  const host = h.get("host") || "";
  const isAdminHost = host === ADMIN_HOST || host.startsWith("admin.");

  // Bounce visitors arriving via www.* (or any non-admin host). Skip in
  // dev where there's only one host (localhost).
  if (!isAdminHost && process.env.NODE_ENV === "production") {
    redirect(`https://${ADMIN_HOST}/platform`);
  }

  const session = await requireUser();
  if (session.appUser.role !== "platform_admin") {
    redirect("/");
  }
  return session;
}
