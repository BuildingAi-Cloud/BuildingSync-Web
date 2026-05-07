import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Wordmark } from "@/components/ui";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const { authUser, appUser } = await requireUser();

  // Determine completion state. We use these to drive the wizard's
  // "completed step" indicators — if the user already has name + phone,
  // we skip past the profile step. If they're already in a building,
  // we don't nag them about it.
  const hasProfile = Boolean(appUser.name && appUser.name.trim().length > 0);
  const hasBuilding = Boolean(appUser.buildingId);
  const portal =
    appUser.role === "admin"
      ? "/platform"
      : appUser.role === "building_manager" ||
        appUser.role === "facility_manager" ||
        appUser.role === "concierge"
      ? "/team"
      : "/dashboard";

  // If literally everything's done already, send them to their portal —
  // no point lingering on the wizard.
  if (hasProfile && hasBuilding) redirect(portal);

  return (
    <main className="min-h-dvh px-4 md:px-6 py-10 bg-background">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="block text-center" aria-label="BuildingSync home">
          <Wordmark className="text-2xl" />
        </Link>

        <OnboardingClient
          email={authUser.email ?? ""}
          defaultName={appUser.name}
          defaultPhone={appUser.phone}
          role={appUser.role}
          hasProfile={hasProfile}
          hasBuilding={hasBuilding}
          portal={portal}
        />
      </div>
    </main>
  );
}
