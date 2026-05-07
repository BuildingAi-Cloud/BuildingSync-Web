import Link from "next/link";
import { requireTeam } from "@/lib/team";
import { Wordmark } from "@/components/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu, type MobileNavItem } from "@/components/MobileMenu";
import { SignOutButton } from "@/components/SignOutButton";
import { NotificationBell } from "@/components/NotificationBell";
import { getNotifications } from "@/lib/notifications";

export default async function TeamLayout({ children }: { children: React.ReactNode }) {
  const { authUser, appUser } = await requireTeam();
  const notifications = await getNotifications({
    id: appUser.id,
    role: appUser.role,
    buildingId: appUser.buildingId,
  }).catch((err) => {
    // Don't 500 the whole layout if the activity feed query fails.
    console.error("[team/layout] getNotifications failed", err);
    return [];
  });

  // Build the role-gated nav once and feed it to both desktop nav + mobile drawer.
  const items: MobileNavItem[] = [
    { href: "/team/work-orders", label: "Work orders" },
    { href: "/team/residents", label: "Residents" },
  ];
  if (appUser.role === "building_manager" || appUser.role === "facility_manager") {
    items.push({ href: "/team/units", label: "Units" });
  }
  if (appUser.role === "building_manager") {
    items.push({ href: "/team/announcements", label: "Announcements" });
  }
  if (appUser.role === "concierge" || appUser.role === "building_manager") {
    items.push({ href: "/team/packages", label: "Packages" });
  }
  items.push({ href: "/team/documents", label: "Documents" });
  items.push({ href: "/team/account", label: "Account" });

  const mobileFooter = (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">
        <div className="font-medium text-foreground truncate">{authUser.email}</div>
        <div className="mt-0.5 capitalize">{appUser.role.replace("_", " ")}</div>
      </div>
      <SignOutButton fullWidth />
    </div>
  );

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-40">
        <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <Link href="/team" className="flex items-baseline gap-2 shrink-0">
              <Wordmark className="text-base" />
              <span className="hidden sm:inline text-xs text-muted-foreground uppercase tracking-wider">Team</span>
            </Link>
            <nav className="hidden md:flex gap-5 text-sm">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell items={notifications} />
            <ThemeToggle />
            <span className="hidden lg:inline text-sm text-muted-foreground">
              {authUser.email}
            </span>
            <div className="hidden md:block">
              <SignOutButton />
            </div>
            <MobileMenu items={items} rightSlot={mobileFooter} />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
