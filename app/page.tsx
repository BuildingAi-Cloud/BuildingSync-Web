import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { LinkButton, Wordmark } from "@/components/ui";

const ADMIN_HOST = process.env.ADMIN_HOST || "admin.buildingsync.app";

export const metadata: Metadata = {
  title: "BuildingSync — Run your building from one place",
  description:
    "Property management platform for maintenance, residents, vendors, and communications. Built for property teams who want to spend less time on admin. Essential plan from $2.50 / unit / month.",
  openGraph: {
    title: "BuildingSync — Run your building from one place",
    description:
      "Property management platform for maintenance, residents, vendors, and communications. Self-serve onboarding, cancel anytime, privacy-first.",
    type: "website",
    siteName: "BuildingSync",
  },
};

type SP = Promise<{ go?: string }>;

export default async function Home({ searchParams }: { searchParams: SP }) {
  const h = await headers();
  const host = h.get("host") || "";
  const isAdminHost = host === ADMIN_HOST || host.startsWith("admin.");

  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  const params = await searchParams;
  let portalUrl: string | null = null;
  let portalLabel = "Continue";
  if (user) {
    const appUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (appUser) {
      switch (appUser.role) {
        case "platform_admin":
          portalUrl =
            isAdminHost || process.env.NODE_ENV !== "production"
              ? "/platform"
              : `https://${ADMIN_HOST}/platform`;
          portalLabel = "Open admin";
          break;
        case "building_manager":
        case "facility_manager":
        case "concierge":
          portalUrl = "/team";
          portalLabel = "Open team";
          break;
        default:
          portalUrl = "/dashboard";
          portalLabel = "Open dashboard";
      }
      if (params.go === "1") redirect(portalUrl);
    }
  }

  return (
    <main className="min-h-dvh">
      <Hero portalUrl={portalUrl} portalLabel={portalLabel} />
      <Pathways />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Hero({ portalUrl, portalLabel }: { portalUrl: string | null; portalLabel: string }) {
  return (
    <section className="relative max-w-7xl mx-auto px-6 pt-20 md:pt-28 pb-16 md:pb-24">
      <Wordmark className="text-2xl block" />

      <h1
        className="mt-10 md:mt-14 tracking-tight leading-[1.05] text-foreground"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(2.75rem, 6vw, 5rem)",
        }}
      >
        Run your building<br />from one place.
      </h1>

      <p className="mt-5 md:mt-6 text-base md:text-lg text-muted-foreground max-w-160 leading-relaxed">
        Maintenance, residents, vendors, communications, governance. Built for property teams who want to spend less time on admin and more time on residents.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["Self-serve onboarding", "Cancel anytime", "Privacy-first by design"].map((proof) => (
          <span
            key={proof}
            className="inline-flex items-center px-3 py-1.5 rounded-full border border-border bg-card text-xs text-muted-foreground"
          >
            {proof}
          </span>
        ))}
      </div>

      <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3">
        {portalUrl ? (
          <LinkButton href={portalUrl}>{portalLabel}</LinkButton>
        ) : (
          <>
            <LinkButton href="/signup">Get started →</LinkButton>
            <LinkButton href="#pricing" variant="outline">See pricing</LinkButton>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Essential plan from $2.50 / unit / month. No credit card to explore.
      </p>
    </section>
  );
}

const PATHWAYS = [
  {
    title: "Facility Manager",
    subtitle: "Operational uptime and SLA control",
    bullets: ["Work orders", "Asset health", "Vendor performance"],
  },
  {
    title: "Building Manager",
    subtitle: "Resident operations and team execution",
    bullets: ["Comms and amenities", "Concierge workflows", "Policy enforcement"],
  },
  {
    title: "Owner & Leadership",
    subtitle: "Governance, risk, and portfolio outcomes",
    bullets: ["Compliance posture", "Audit readiness", "Program visibility"],
  },
  {
    title: "Resident & Tenant",
    subtitle: "One app for the building",
    bullets: ["Maintenance requests", "Announcements", "Pay rent"],
  },
];

function Pathways() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-border">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">00 / Journey</p>
      <h2
        className="mt-4 tracking-tight"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 5vw, 4rem)" }}
      >
        CHOOSE YOUR PATH
      </h2>
      <p className="mt-3 max-w-3xl font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
        Start from the workflow that matches your role. Move from onboarding to measurable outcomes without guesswork.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PATHWAYS.map((p) => (
          <div
            key={p.title}
            className="border border-border bg-card p-5 rounded-lg hover:border-accent/60 transition-colors"
          >
            <p
              className="text-2xl tracking-tight text-foreground"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {p.title}
            </p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{p.subtitle}</p>
            <ul className="mt-4 space-y-1.5">
              {p.bullets.map((b) => (
                <li key={b} className="font-mono text-[11px] text-foreground/80">• {b}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

const TIERS = [
  {
    name: "Essential",
    price: "$2.50",
    period: "/unit/month",
    description: "Per-unit pricing with role-based onboarding setup",
    features: [
      "Resident portal & mobile PWA",
      "Maintenance request tracking",
      "Community announcements",
      "Package notifications",
      "Email & chat support",
    ],
    cta: "Get started",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Professional",
    price: "$4.50",
    period: "/unit/month",
    description: "For property management companies",
    features: [
      "All Essential features",
      "AI package tracking",
      "Visitor & contractor management",
      "Digital shift logs",
      "SMS & voice broadcasting",
      "Priority support",
    ],
    cta: "Coming soon",
    href: null,
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale portfolios",
    features: [
      "All Professional features",
      "E-voting & governance tools",
      "Custom API integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Tailored onboarding & training",
    ],
    cta: "Contact us",
    href: "mailto:hello@buildingsync.app",
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-border">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 / Plans</p>
      <h2
        className="mt-4 tracking-tight"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 5vw, 4rem)" }}
      >
        PRICING PLANS
      </h2>
      <p className="mt-3 max-w-3xl font-mono text-xs md:text-sm text-muted-foreground leading-relaxed">
        Per-unit pricing. No setup fees. Cancel anytime.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`border rounded-lg p-6 flex flex-col ${
              t.highlight ? "border-accent bg-accent/5" : "border-border bg-card"
            }`}
          >
            <h3
              className="text-3xl tracking-tight"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              {t.name}
            </h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-foreground">{t.price}</span>
              {t.period && <span className="text-sm text-muted-foreground">{t.period}</span>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t.description}</p>
            <ul className="mt-5 space-y-2 flex-1">
              {t.features.map((f) => (
                <li key={f} className="text-sm text-foreground/90 flex gap-2">
                  <span className="text-accent">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              {t.href ? (
                <Link
                  href={t.href}
                  className={`inline-flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    t.highlight
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "border border-border hover:border-accent hover:text-accent"
                  }`}
                >
                  {t.cta}
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-md text-sm font-medium border border-border text-muted-foreground">
                  {t.cta}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        All prices in USD. Stripe processing fees absorbed by the property manager — never charged to residents (Ontario RTA s. 134 compliant).
      </p>
    </section>
  );
}

const FAQS = [
  {
    q: "How long does setup take?",
    a: "Most buildings are live within an hour. Sign up, create your building, import units (CSV supported), invite residents — done. No implementation fee, no contract, no salesperson required.",
  },
  {
    q: "Do you have an iOS or Android app?",
    a: "BuildingSync is an installable PWA (Progressive Web App) — residents and staff install it from Safari or Chrome to their home screen and get a native-feeling experience today. Dedicated iOS and Android apps are on the roadmap.",
  },
  {
    q: "Can I export my data and leave?",
    a: "Yes. Every user can download their own data as JSON from Account → Privacy. Building admins can export the full building's records. Standard formats only — CSV, JSON. No lock-in.",
  },
  {
    q: "Is my building's data shared with other customers?",
    a: "No. Every building's data is row-level isolated by buildingId. We never aggregate or share tenant data across customers. Privacy-first by design.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Month-to-month, no long-term contract. Cancel from Settings and you stop being billed at the end of the current period. Your data stays available for 30 days for export.",
  },
];

function Faq() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-border">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">06 / Questions</p>
      <h2
        className="mt-4 tracking-tight"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 5vw, 4rem)" }}
      >
        QUESTIONS
      </h2>

      <div className="mt-10 max-w-3xl space-y-3">
        {FAQS.map((f, i) => (
          <details
            key={f.q}
            className="group border border-border bg-card rounded-lg overflow-hidden"
            open={i === 0}
          >
            <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
              <span className="text-sm font-medium text-foreground">{f.q}</span>
              <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
            </summary>
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 border-t border-border">
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 md:p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">Final Step</p>
        <h2
          className="mt-3 tracking-tight"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(1.875rem, 4vw, 3rem)" }}
        >
          Ready to modernize your building operations?
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Get started in under an hour. Self-serve onboarding, cancel anytime.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/signup">Get started</LinkButton>
          <LinkButton href="#pricing" variant="outline">View plans</LinkButton>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
        <Wordmark className="text-base" />
        <p className="font-mono">© {new Date().getFullYear()} BuildingSync · R1 · {process.env.NODE_ENV}</p>
      </div>
    </footer>
  );
}
