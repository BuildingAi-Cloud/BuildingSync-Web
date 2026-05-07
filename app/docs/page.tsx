import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = {
  title: "Docs — BuildingSync",
  description: "Getting started, common workflows, and FAQs for BuildingSync property managers and residents.",
};

export default function DocsPage() {
  return (
    <AuthShell back={{ href: "/", label: "Home" }} width="wide">
      <div className="py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">Help</p>
        <h1
          className="mt-3 tracking-tight"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.25rem, 5vw, 3.5rem)" }}
        >
          DOCS
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl">
          Quick guides for getting your building running on BuildingSync. Email{" "}
          <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>{" "}
          if you&apos;re stuck.
        </p>

        <div className="mt-12 space-y-12 text-sm leading-relaxed text-foreground/90">
          <Section title="For property managers (BM/FM)" eyebrow="01 / Onboarding">
            <Step n={1} title="Create your account">
              Sign up at <Link href="/signup" className="text-accent hover:underline">/signup</Link> with your work email. Set a strong password.
            </Step>
            <Step n={2} title="Get linked to your building">
              For R1, the BuildingSync platform admin links your account to your building (drop us a note at info@). Once linked, you&apos;ll land on{" "}
              <Link href="/team" className="text-accent hover:underline">/team</Link> after sign-in.
            </Step>
            <Step n={3} title="Add your units">
              Go to <Link href="/team/units" className="text-accent hover:underline">/team/units</Link> and add each unit by number, floor, and rent.
              You can also import a list later — units are referenced by number when you bulk-onboard residents.
            </Step>
            <Step n={4} title="Onboard your residents">
              Two ways at <Link href="/team/residents" className="text-accent hover:underline">/team/residents</Link>:
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>One at a time</strong> — enter email, role (resident/tenant), unit. We email the resident a welcome link with their temp password.</li>
                <li><strong>Bulk via CSV</strong> — paste or upload a CSV with columns <code className="font-mono text-xs">email, role, unit</code>. Header row optional. Existing accounts are re-linked, not duplicated.</li>
              </ul>
              The success card shows temp passwords with one-tap Copy buttons in case the welcome email bounces.
            </Step>
            <Step n={5} title="Triage incoming maintenance">
              Residents submit requests at <Link href="/dashboard/maintenance" className="text-accent hover:underline">/dashboard/maintenance</Link>; you&apos;ll get an email and the request appears at <Link href="/team/work-orders" className="text-accent hover:underline">/team/work-orders</Link>. Click the action button to advance: Open → Assigned (assigns to you) → In progress → Closed. The resident gets an email on every status change.
            </Step>
            <Step n={6} title="Post announcements">
              <strong>Building Manager only.</strong> At <Link href="/team/announcements" className="text-accent hover:underline">/team/announcements</Link>, post a notice. We email the body to every resident in your building immediately.
            </Step>
          </Section>

          <Section title="For residents and tenants" eyebrow="02 / Daily use">
            <Step n={1} title="First sign-in">
              Use the email + temp password your building team gave you (probably also in a welcome email). Sign in at <Link href="/signin" className="text-accent hover:underline">/signin</Link>. You&apos;ll land on <Link href="/dashboard" className="text-accent hover:underline">/dashboard</Link>.
            </Step>
            <Step n={2} title="Change your password">
              Important — your temp password is shared, treat it as one-time. Go to <Link href="/dashboard/account" className="text-accent hover:underline">/dashboard/account</Link> and set a new one. The strength meter tells you when it&apos;s solid.
            </Step>
            <Step n={3} title="Submit a maintenance request">
              <Link href="/dashboard/maintenance" className="text-accent hover:underline">/dashboard/maintenance</Link>. Title + description (be specific — &quot;leaking under kitchen sink, started last night, water pooling&quot; beats &quot;leak&quot;). Your building team is emailed instantly.
            </Step>
            <Step n={4} title="Read announcements">
              <Link href="/dashboard/announcements" className="text-accent hover:underline">/dashboard/announcements</Link> shows everything your building team has posted, newest first. You&apos;ll also get them in email.
            </Step>
            <Step n={5} title="Install the app">
              On Android Chrome: tap the install banner or the menu &quot;Install&quot; option. On iPhone Safari: tap Share → Add to Home Screen. The app works offline for the basics.
            </Step>
          </Section>

          <Section title="Forgot password?" eyebrow="03 / Account recovery">
            <p>
              On the sign-in page, tap <strong>Forgot?</strong>. We email you a one-time link to{" "}
              <Link href="/auth/reset" className="text-accent hover:underline">/auth/reset</Link> where you set a new password. The link expires in an hour.
            </p>
          </Section>

          <Section title="Common questions" eyebrow="04 / FAQ">
            <FaqItem q="My welcome email never arrived.">
              Check spam first. If still missing, ask your building manager — they can see your temp password and share it directly. Once you&apos;re signed in, change it under Account.
            </FaqItem>
            <FaqItem q="I'm a resident, can I see other residents in my building?">
              No. Privacy by default — residents see only their own data (work orders they opened, announcements posted to the building). Building staff see the resident roster within their building.
            </FaqItem>
            <FaqItem q="Can I bulk-import existing residents from another tool?">
              Yes — Bulk CSV at /team/residents accepts <code className="font-mono text-xs">email, role, unit</code>. Existing accounts on BuildingSync are re-linked to your building rather than duplicated.
            </FaqItem>
            <FaqItem q="How do I delete my account?">
              Email{" "}
              <a href="mailto:info@buildingsync.app" className="text-accent hover:underline">info@buildingsync.app</a>{" "}
              and we delete your account + associated records within 7 days. Building admins can&apos;t unilaterally delete a resident&apos;s account — it&apos;s yours.
            </FaqItem>
          </Section>
        </div>
      </div>
    </AuthShell>
  );
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="shrink-0 w-7 h-7 rounded-full border border-border bg-card flex items-center justify-center font-mono text-xs text-accent font-semibold">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="mt-1 text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group bg-card border border-border rounded-lg overflow-hidden">
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
        <span className="text-sm font-medium text-foreground">{q}</span>
        <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
      </summary>
      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </details>
  );
}
