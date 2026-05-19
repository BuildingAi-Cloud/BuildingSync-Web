import type { Region } from "./types";

// Ontario, Canada — primary launch region. Detailed because every
// surface (privacy page, terms page, /legal page, /team/legal notice
// templates) currently assumes this jurisdiction.

export const ontario: Region = {
  code: "CA-ON",
  label: "Ontario, Canada",
  country: "CA",
  subdivision: "Ontario",
  languages: ["en-CA", "fr-CA"],

  privacy: [
    {
      name: "PIPEDA",
      summary:
        "Federal Canadian privacy law. Governs how organisations collect, use, and disclose personal information in the course of commercial activity.",
      url: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/",
      ourPosture:
        "Per-user data export (Art. 4.9), soft-archive deletion (Art. 4.5), append-only audit log over every action, breach-notification process documented internally.",
    },
    {
      name: "MFIPPA",
      summary:
        "Municipal Freedom of Information and Protection of Privacy Act. Applies when a municipal organisation (e.g. social-housing corp) processes resident data.",
      url: "https://www.ontario.ca/laws/statute/90m56",
      ourPosture:
        "Municipal customers get the same per-user export + audit log; access requests routed to the municipal records officer per their procedure.",
    },
  ],

  tenancy: [
    {
      name: "Residential Tenancies Act, 2006 (RTA)",
      summary:
        "Ontario's primary statute governing residential landlord/tenant relationships. Covers leases, rent increases, evictions, maintenance obligations, and Landlord and Tenant Board (LTB) procedures.",
      url: "https://www.ontario.ca/laws/statute/06r17",
      ourPosture:
        "Notice templates (N4 / N5 / N12) prefilled with tenant + lease info. Audit log records service date + method for use at the LTB. Maintenance work-order timeline maps cleanly onto s. 20 obligations.",
    },
    {
      name: "Human Rights Code (Ontario)",
      summary:
        "Tenants are protected from discrimination on grounds including disability, family status, source of income. Affects how listings, screening, and tenancy decisions are framed.",
      url: "https://www.ontario.ca/laws/statute/90h19",
      ourPosture:
        "We don't surface protected-grounds fields in screening flows. The platform is the system of record; landlord decisions remain the landlord's responsibility.",
    },
  ],

  communications: [
    {
      name: "CASL (Canada's Anti-Spam Legislation)",
      summary:
        "Governs commercial electronic messages (CEMs) — sender ID, unsubscribe mechanism, consent. Operational service emails are largely outside CASL, but the footer is included on all transactional mail to stay in the safe lane.",
      url: "https://laws-lois.justice.gc.ca/eng/acts/E-1.6/",
      ourPosture:
        "Every email includes the CASL §6 footer: sender identification ('BuildingSync, a Node2.io service'), unsubscribe / preferences link, and physical-or-electronic contact.",
    },
  ],

  accessibility: [
    {
      name: "AODA — Accessibility for Ontarians with Disabilities Act",
      summary:
        "Ontario's accessibility standard. Provincially-regulated organisations must meet WCAG 2.0 Level AA across customer-facing digital surfaces by Jan 1 2021.",
      url: "https://www.ontario.ca/page/accessibility-laws",
      ourPosture:
        "WCAG 2.1 AA target across the resident + staff surfaces. Three-mode contrast (Paper / Light / Dark), keyboard-navigable everywhere, screen-reader labels on every actionable element, reduced-motion honoured. Universal Access Symbol in the header opens a contrast + text-size panel.",
    },
  ],

  notices: [
    {
      code: "N4",
      name: "Notice to end the tenancy for non-payment of rent",
      url: "https://tribunalsontario.ca/documents/ltb/Notices%20of%20Termination%20&%20Instructions/N4.pdf",
      triggerSummary:
        "Issued when a tenant has rent in arrears. Gives the tenant 14 days to pay or vacate.",
      deadlineDays: 14,
    },
    {
      code: "N5",
      name: "Notice to terminate a tenancy early — substantial interference, damage, overcrowding",
      url: "https://tribunalsontario.ca/documents/ltb/Notices%20of%20Termination%20&%20Instructions/N5.pdf",
      triggerSummary:
        "Substantial interference with reasonable enjoyment, wilful or negligent damage, or overcrowding. 7-day cure window on first notice; 14-day vacate on second within 6 months.",
      deadlineDays: 7,
    },
    {
      code: "N12",
      name: "Notice to terminate a tenancy at the end of term — landlord's own use",
      url: "https://tribunalsontario.ca/documents/ltb/Notices%20of%20Termination%20&%20Instructions/N12.pdf",
      triggerSummary:
        "Landlord, purchaser, or immediate family requires the unit for residential occupation. 60-day notice; one month's compensation owed to tenant.",
      deadlineDays: 60,
    },
  ],

  rentPayment: {
    summary:
      "Ontario RTA s. 134 prohibits landlords from charging tenants any payment-processing fees. BuildingSync's rent-payment flow absorbs processor fees at the property-manager level — never passed through to the tenant.",
    rules: [
      "Stripe processing fees are charged to the property manager's account, not the tenant.",
      "No 'convenience fee', 'service fee', or similar surcharge appears on the tenant's receipt.",
      "Tenants pay the exact amount of rent due on the lease — nothing more.",
      "Failed-payment retry logic doesn't double-charge processor fees to the tenant.",
    ],
  },

  dataResidency:
    "Hosted on Supabase ca-central (Toronto). Database, file storage, and audit logs never leave Canada. Documented in the customer's data-processing agreement on request.",

  contactNote:
    "For Ontario-specific legal questions, our procurement team can return a vendor questionnaire within 5 business days. Email info@buildingsync.app with 'Ontario compliance' in the subject.",
};
