import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const { authUser, appUser } = await requireUser();

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

  // If everything's done already, skip the wizard.
  if (hasProfile && hasBuilding) redirect(portal);

  return (
    <AuthShell back={null} width="wide">
      <OnboardingClient
        email={authUser.email ?? ""}
        defaultName={appUser.name}
        defaultPhone={appUser.phone}
        role={appUser.role}
        hasProfile={hasProfile}
        hasBuilding={hasBuilding}
        portal={portal}
      />
    </AuthShell>
  );
}
