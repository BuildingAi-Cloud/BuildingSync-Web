import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/app/dashboard/account/AccountForms";

export default async function TeamAccountPage() {
  const { authUser, appUser } = await requireUser();

  return (
    <main className="px-6 py-10 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground">{authUser.email} · {appUser.role.replace("_", " ")}</p>
      </div>

      <section className="mt-8 bg-card border border-border rounded-md p-5">
        <h2 className="text-base font-semibold">Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Shown on work orders and announcements you publish.
        </p>
        <div className="mt-4">
          <ProfileForm defaultName={appUser.name} defaultPhone={appUser.phone} />
        </div>
      </section>

      <section className="mt-6 bg-card border border-border rounded-md p-5">
        <h2 className="text-base font-semibold">Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          If you signed in with a temporary password, change it here.
        </p>
        <div className="mt-4">
          <PasswordForm />
        </div>
      </section>
    </main>
  );
}
