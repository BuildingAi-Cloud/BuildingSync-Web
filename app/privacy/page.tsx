import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Privacy Policy — BuildingSync",
  description: "How BuildingSync handles your data: row-level isolation by building, no third-party tracking, export and delete on demand.",
};

const LAST_UPDATED = "May 2026";

export default function PrivacyPage() {
  return (
    <AuthShell back={{ href: "/", label: "Home" }} width="wide">
      <div className="py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Trust</p>
        <h1
          className="mt-3 tracking-tight"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          PRIVACY POLICY
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-foreground/90">
          <Section title="1. What we collect">
            <p>To run your building on BuildingSync we store:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Your sign-in email and an opaque user ID issued by Supabase Auth.</li>
              <li>Profile data you choose to add — display name and phone.</li>
              <li>Your role assignment (resident, tenant, concierge, facility manager, building manager, or platform admin) and the building / unit you&apos;re linked to.</li>
              <li>Records you create through the app: maintenance requests, announcements, comments.</li>
              <li>Standard server logs (IP, user-agent, timestamps) used for security and debugging.</li>
            </ul>
            <p className="mt-3">We do not collect device location, contacts, microphone or camera data, biometrics, or any third-party advertising identifiers.</p>
          </Section>

          <Section title="2. What we do with it">
            <p>Your data is used solely to operate the service: render your dashboard, route a maintenance request to the right building&apos;s staff, deliver announcements, send transactional email (e.g. welcome email, work-order status change). We do not use your data to train AI models, sell to third parties, or build cross-customer analytics.</p>
          </Section>

          <Section title="3. Per-building isolation">
            <p>Every record is scoped to a <code className="font-mono text-xs">buildingId</code>. Queries filter by your assigned building before returning rows; data from other buildings is never visible to you. Platform administrators (BuildingSync staff) have access to operational metadata only when needed to support a customer issue.</p>
          </Section>

          <Section title="4. Email">
            <p>Transactional emails (sign-in welcome, work-order updates, announcement broadcasts) are sent through <a href="https://resend.com" rel="noopener" className="text-accent hover:underline">Resend</a>. Resend processes the recipient address and message body to deliver the email; no other personal data is sent. We don&apos;t send marketing email without explicit opt-in.</p>
          </Section>

          <Section title="5. Cookies & tracking">
            <p>BuildingSync uses one essential cookie — your Supabase Auth session token — set on the <code className="font-mono text-xs">.buildingsync.app</code> domain. It&apos;s required to keep you signed in. We don&apos;t run analytics, advertising pixels, session recording, or any third-party trackers.</p>
          </Section>

          <Section title="6. Storage & retention">
            <p>Data is stored in Supabase (Postgres) hosted on AWS. While your subscription is active, records persist as long as you keep your account or until you delete them. After cancellation, your building&apos;s records remain available for 30 days for export, then are permanently deleted.</p>
          </Section>

          <Section title="7. Your rights — export & delete">
            <p>You can:</p>
            <ul className="mt-3 space-y-1.5 list-disc pl-5">
              <li>Update your profile and rotate your password from <Link href="/dashboard/account" className="text-accent hover:underline">/dashboard/account</Link> (or <Link href="/team/account" className="text-accent hover:underline">/team/account</Link> for staff).</li>
              <li>Request a JSON export of your data by emailing <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>.</li>
              <li>Request deletion of your account and associated records — same email, response within 7 days.</li>
            </ul>
            <p className="mt-3">If you&apos;re in the EU/UK, the rights above also satisfy GDPR Article 15 (access), 17 (erasure), and 20 (portability).</p>
          </Section>

          <Section title="8. Payments (when enabled)">
            <p>Card data for rent payments or subscription billing is handled directly by <a href="https://stripe.com" rel="noopener" className="text-accent hover:underline">Stripe</a> — BuildingSync never sees full card numbers. Only Stripe customer/subscription IDs are stored on our side. Stripe processing fees on rent are absorbed by the property manager and never charged to tenants, in compliance with Ontario Residential Tenancies Act s. 134.</p>
          </Section>

          <Section title="9. Changes to this policy">
            <p>If we make material changes (anything that meaningfully expands what we collect or how we use it), we&apos;ll notify all account holders by email at least 14 days before the change takes effect. The current version is always at <Link href="/privacy" className="text-accent hover:underline">/privacy</Link> with the &quot;last updated&quot; date at the top.</p>
          </Section>

          <Section title="10. Contact">
            <p>Questions about privacy or your data? Email <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>.</p>
          </Section>
        </div>
      </div>
    </AuthShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </section>
  );
}
