import { requirePlatformAdmin } from "@/lib/platform";

// Internal 30-minute white-glove pilot setup script. Admin-only.
// Used during a screen-share with a new pilot customer to make the
// "we set you up in 30 min" pitch concrete and repeatable. Living
// doc — refine as conversations teach what trips people up.

const STEPS = [
  {
    block: "Pre-call · 5 min before",
    items: [
      "Open /platform → confirm you're signed in as admin on admin.buildingsync.app",
      "Open /platform/users in a second tab — useful for showing the user catalogue afterwards",
      "Have the customer's building name + unit count + their email ready",
      "Confirm Stripe is still gated (STRIPE_ENABLED=0) — if a tenant asks about rent payment during the demo, the answer is \"pending compliance approval, late R2.\"",
    ],
  },
  {
    block: "Minute 0–3 · Quick context",
    items: [
      "Confirm what they want out of the pilot in one sentence (\"comms paper trail\" / \"replace WhatsApp\" / \"prep for an LTB hearing\" / etc.) — this anchors the rest of the call",
      "Confirm role (BM vs property manager vs owner) so you set up the right account type",
      "Confirm units count for billing later — write it down",
    ],
  },
  {
    block: "Minute 3–8 · Create their building",
    items: [
      "/platform/buildings/new — enter building name + address + city + state + zip + country + timezone (\"America/Toronto\" for Ontario)",
      "Pick BuildingType (residential for almost everyone)",
      "Save — copy the new building id (bld_…), you'll need it for steps below",
      "/platform/buildings/[id] — verify it's there and looks right",
    ],
  },
  {
    block: "Minute 8–14 · Onboard the BM and rotate the invite code",
    items: [
      "Tell them: \"You're going to get a signup link in 30 seconds. Sign up there — that becomes your account.\"",
      "Send them: https://buildingsync.app/signup",
      "While they sign up: in /platform/users, find their new user row (filter by email), set role = building_manager, set buildingId = the building you just created",
      "Have them refresh /signin → they should now land in /onboarding/pending",
      "/platform/verifications → Approve their account (this clears verifiedAt and routes them to /team)",
      "Once they hit /team, walk them through the BM home: stat cards, recent work orders, the team nav across the top",
    ],
  },
  {
    block: "Minute 14–22 · Show the resident-facing flow + invite code",
    items: [
      "BM: open /team/access-requests → \"Self-signup invite code\" panel. Click Generate code. Copy the signup link.",
      "Tell them: \"Share this link in your building newsletter / lobby poster / next AGM email and residents auto-link to your building when they sign up.\"",
      "Have them open the resident PWA flow: /signup with the code embedded, complete signup, hit /dashboard → show the dark hero + section feed (announcements, amenities, deliveries)",
      "Demo a maintenance request from the resident side, then show it appearing live on the BM's /team/work-orders page (refresh) — works because of the audit log + push wiring",
      "On /team/work-orders, point at the AI triage banner if there's data — \"this gets useful when the queue is non-trivial\"",
    ],
  },
  {
    block: "Minute 22–28 · Settings, comms, legal — the trust-builders",
    items: [
      "/team/announcements → click \"Draft with AI\" → demo the violet panel with a one-line prompt (\"reminder about pool deck closure Friday\") → show the polished draft, edit, post",
      "Show the announcement landing in the resident PWA + the email Resend just fired",
      "/team/audit-log → click Download comms log · 90 days → CSV downloads → \"this is what you hand to your lawyer if it ever comes to that\"",
      "/team/legal → /team/legal/notices/new → click N4 → fill in tenant + amount → Create draft → show the printable page",
      "/team/settings → tabs (Profile / Notifications / Billing / Privacy / System) — explain push notifications enable from /team/settings?tab=notifications once they install the PWA",
    ],
  },
  {
    block: "Minute 28–30 · Hand-off + next steps",
    items: [
      "Confirm the pilot terms verbally: 90 days free, no card, $2.50/unit/month or cancel after — \"your call, no auto-renew traps\"",
      "Tell them: \"You can email me directly at info@buildingsync.app any time during the pilot. I'll check in at 48h, 14d, 60d.\"",
      "Calendar: set a reminder for 48h to email \"how's it going, anything blocked?\"",
      "Send them follow-up: link to /for-property-managers (for sharing with their board / owner), /press for logos, and your direct email",
      "End the call. Update CRM / spreadsheet with: building name, units, BM email, pilot start date, what they want out of it.",
    ],
  },
];

const COMMON_TRIPS = [
  {
    trip: "They sign up but the verification queue stays empty",
    fix: "/platform/verifications relies on User.verifiedAt = null AND role = building_manager. If you set the role first in /platform/users they may already be auto-verified. Easier flow: have them sign up, THEN you set their role and buildingId in /platform/users. They'll appear in the queue.",
  },
  {
    trip: "Resident sign-up with code doesn't auto-link",
    fix: "lib/auth.ts → getOrCreateAppUser only redeems codes when the user has no buildingId already. If the resident was previously linked to another building, manually update User.buildingId in /platform/users.",
  },
  {
    trip: "AI triage banner doesn't appear",
    fix: "Confirm ANTHROPIC_API_KEY is set in Vercel env. Banner gracefully no-ops if missing. Also requires at least one open or in_progress work order in the building.",
  },
  {
    trip: "Push notifications don't fire on iOS",
    fix: "iOS requires the PWA to be installed (Safari → Share → Add to Home Screen). Confirm NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY are set. Tell the user to enable from Settings → Notifications → Enable on this device after install.",
  },
  {
    trip: "Customer asks about Stripe / rent payments",
    fix: "Honest answer: \"Stripe is integrated and gated behind a flag — we're waiting on merchant-account compliance review. Tenants will see a 'pending compliance' banner on the Pay rent page until we flip the switch. For now, payments stay outside BuildingSync (cheque / e-transfer / your existing flow).\"",
  },
  {
    trip: "Customer asks about French UI",
    fix: "On the R2 roadmap. The mechanism is wired (locale switcher in System settings) but full string translation lands ahead of QC / federal customer onboarding. If they need French today, suggest waiting one release.",
  },
];

export default async function PilotOnboardingPage() {
  await requirePlatformAdmin();

  return (
    <main className="px-4 md:px-6 py-8 md:py-10 max-w-4xl mx-auto pb-12">
      <div className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Platform admin · Sales tools
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Pilot onboarding · 30-min script
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          The repeatable flow that turns &quot;white-glove setup&quot; from a marketing claim into a script
          you can run on every pilot screen-share. Update this page as you learn what trips people up.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {STEPS.map((s, i) => (
          <section key={s.block} className="bg-card border border-border rounded-md p-5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest px-2 py-1 rounded-md border border-accent/40 text-accent bg-accent/10">
                Step {i + 1}
              </span>
              <h2 className="text-base font-semibold">{s.block}</h2>
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed">
              {s.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-5 text-right">
                    {String(j + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight">Common trip-ups + the fix</h2>
        <div className="mt-4 space-y-3">
          {COMMON_TRIPS.map((t) => (
            <div key={t.trip} className="bg-card border border-border rounded-md p-4">
              <p className="font-semibold text-sm">{t.trip}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{t.fix}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        Edit this page in{" "}
        <code className="font-mono text-xs">app/platform/pilot-onboarding/page.tsx</code> — the script
        gets better every time you run it.
      </p>
    </main>
  );
}
