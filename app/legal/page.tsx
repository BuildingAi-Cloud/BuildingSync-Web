import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { getRegion, PLANNED_REGIONS } from "@/lib/regions";
import type { Law, NoticeTemplate, Region } from "@/lib/regions/types";
import { getOrCreateAppUser } from "@/lib/auth";

// Region-aware legal & compliance summary. Single page that surfaces
// every law that applies in the current jurisdiction, BuildingSync's
// posture for each, plus the statutory notices we can generate.
//
// Region resolution order:
//   1. ?region= query string (explicit override — for sharing links)
//   2. signed-in user's User.region (set at signup)
//   3. DEFAULT_REGION_CODE ("CA-ON")
//
// Anonymous visitors who haven't picked a region get Ontario.

export const metadata: Metadata = {
  title: "Legal & Compliance — BuildingSync",
  description:
    "How BuildingSync handles privacy, tenancy, communications, and accessibility law in your jurisdiction.",
};

export default async function LegalPage({
  searchParams,
}: {
  searchParams?: Promise<{ region?: string }>;
}) {
  const params = (await searchParams) || {};
  // Try the signed-in user's region first (silent — anonymous visitors
  // don't trigger a redirect). Query string wins over user record so a
  // BM can share a /legal?region=CA-QC link with a Québec colleague
  // and get Québec content, regardless of which region the recipient
  // signed up under.
  let resolvedCode = params.region;
  if (!resolvedCode) {
    const session = await getOrCreateAppUser().catch(() => null);
    if (session?.appUser.region) resolvedCode = session.appUser.region;
  }
  const region = getRegion(resolvedCode);

  return (
    <AuthShell back={{ href: "/", label: "Home" }} width="wide">
      <div className="py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
          {region.label}
        </p>
        <h1
          className="mt-3 tracking-tight"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          LEGAL &amp; COMPLIANCE
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
          BuildingSync adapts to the jurisdiction your buildings operate in.
          This page summarises the laws that apply, what we do to meet them,
          and the statutory notices we can generate.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/30">
            ✓ {region.label}
          </span>
          {PLANNED_REGIONS.map((r) => (
            <span
              key={r.code}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted/40 text-muted-foreground border border-border"
              title={r.eta ? `Coming in ${r.eta}` : "Coming soon"}
            >
              {r.label}
              {r.eta && <span className="ml-1.5 text-[10px] font-mono uppercase tracking-widest">· {r.eta}</span>}
            </span>
          ))}
        </div>

        <div className="mt-14 space-y-14 text-sm leading-relaxed text-foreground/90">
          <LawSection eyebrow="01 · Privacy" title="Personal information &amp; privacy" laws={region.privacy} />
          <LawSection eyebrow="02 · Tenancy" title="Residential tenancy law" laws={region.tenancy} />
          <LawSection eyebrow="03 · Communications" title="Email, SMS, and push notifications" laws={region.communications} />
          <LawSection eyebrow="04 · Accessibility" title="Accessibility standards" laws={region.accessibility} />

          <NoticesSection notices={region.notices} />

          <RentSection region={region} />

          <ResidencySection region={region} />

          {region.contactNote && (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Procurement &amp; vendor questionnaires
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{region.contactNote}</p>
            </div>
          )}

          <DisclaimerSection />
        </div>
      </div>
    </AuthShell>
  );
}

function LawSection({
  eyebrow,
  title,
  laws,
}: {
  eyebrow: string;
  title: string;
  laws: Law[];
}) {
  if (laws.length === 0) return null;
  return (
    <section className="scroll-mt-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-6 space-y-4">
        {laws.map((law) => (
          <article key={law.name} className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-base text-foreground">{law.name}</h3>
              <a
                href={law.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-accent hover:underline"
              >
                Official reference →
              </a>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{law.summary}</p>
            {law.ourPosture && (
              <div className="mt-3 pt-3 border-t border-border/60">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
                  Our posture
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed">{law.ourPosture}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function NoticesSection({ notices }: { notices: NoticeTemplate[] }) {
  if (notices.length === 0) return null;
  return (
    <section className="scroll-mt-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">05 · Statutory notices</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        Notice templates we generate
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Building Managers can issue the following notices from the staff portal. Each is prefilled with
        the relevant tenant + lease details, audit-logged, and printable for service.
      </p>
      <div className="mt-6 space-y-3">
        {notices.map((n) => (
          <article key={n.code} className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-semibold text-foreground">
                <span className="font-mono text-accent mr-2">{n.code}</span>
                {n.name}
              </h3>
              <a
                href={n.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-accent hover:underline"
              >
                Official form →
              </a>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{n.triggerSummary}</p>
            {n.deadlineDays !== undefined && (
              <p className="mt-2 text-xs text-muted-foreground">
                Statutory window: <span className="font-medium text-foreground">{n.deadlineDays} days</span>
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function RentSection({ region }: { region: Region }) {
  return (
    <section className="scroll-mt-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">06 · Rent payment</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        How rent flows through BuildingSync
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {region.rentPayment.summary}
      </p>
      <ul className="mt-5 space-y-2">
        {region.rentPayment.rules.map((r, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span aria-hidden="true" className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
            <span className="text-foreground/90 leading-relaxed">{r}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResidencySection({ region }: { region: Region }) {
  return (
    <section className="scroll-mt-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">07 · Data residency</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
        Where your data lives
      </h2>
      <p className="mt-3 text-sm text-foreground/90 leading-relaxed max-w-2xl">{region.dataResidency}</p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-2xl">
        Customers who need stricter residency — government, healthcare, or contractual
        obligations — can deploy the on-premise SKU which runs entirely inside the
        customer&apos;s network with no internet egress. See{" "}
        <Link href="/enterprise" className="text-accent hover:underline">
          Enterprise &amp; Government
        </Link>
        .
      </p>
    </section>
  );
}

function DisclaimerSection() {
  return (
    <section className="rounded-lg border border-border bg-muted/20 p-5">
      <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
        Not legal advice
      </p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        This page is a plain-language summary of how BuildingSync operates in
        the listed jurisdictions. It is not legal advice. Property managers,
        landlords, and tenants should consult their own counsel for matters
        specific to their situation. Statutes change; BuildingSync updates this
        page periodically — see the last-modified note at the top of each
        official-form link for the canonical version.
      </p>
    </section>
  );
}
