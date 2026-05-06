import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

const ADMIN_HOST = process.env.ADMIN_HOST || "admin.buildingsync.app";

export default async function Home() {
  const h = await headers();
  const host = h.get("host") || "";
  const isAdminHost = host === ADMIN_HOST || host.startsWith("admin.");

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  // Authed visitors → route to the surface that matches their role on the
  // right host. Platform admins are bounced to admin.* if they came via www.
  if (user) {
    const appUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (appUser) {
      switch (appUser.role) {
        case "platform_admin":
          redirect(
            isAdminHost || process.env.NODE_ENV !== "production"
              ? "/platform"
              : `https://${ADMIN_HOST}/platform`,
          );
        case "building_manager":
        case "facility_manager":
        case "concierge":
          redirect("/team");
        default:
          redirect("/dashboard");
      }
    }
  }

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">BuildingSync</h1>
        <p className="text-lg opacity-70">
          Property management for residents, tenants, and staff.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signin"
            className="px-5 py-2.5 rounded-md font-medium"
            style={{ background: "var(--foreground)", color: "var(--background)" }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-md border"
            style={{ borderColor: "currentColor" }}
          >
            Sign up
          </Link>
        </div>
        <p className="text-xs opacity-50">R1 · {process.env.NODE_ENV}</p>
      </div>
    </main>
  );
}
