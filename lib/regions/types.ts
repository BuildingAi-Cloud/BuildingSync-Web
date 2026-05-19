// Region-aware legal + compliance surface. Different jurisdictions
// have different privacy laws, tenancy laws, communications laws,
// accessibility requirements, notice formats, and rent-payment rules.
//
// One Region object captures everything the UI needs to render the
// /legal page, the privacy/terms pages, and per-region affordances
// (e.g. Ontario N4/N5/N12 notice templates).
//
// Today: Ontario is the only fully-populated region. Architecture
// leaves room for additional Canadian provinces, US states, EU
// member states, etc.

export type Law = {
  /** Short name customers recognise, e.g. "PIPEDA", "Ontario RTA". */
  name: string;
  /** One-sentence summary in plain language. */
  summary: string;
  /** Official link (statute, regulator, or canonical reference). */
  url: string;
  /** "What we do" — how BuildingSync implements this requirement. */
  ourPosture?: string;
};

export type NoticeTemplate = {
  code: string;          // e.g. "N4"
  name: string;          // e.g. "Notice to end tenancy for non-payment"
  url: string;           // official form link
  triggerSummary: string; // when this notice is used
  deadlineDays?: number;  // statutory remediation window
};

export type Region = {
  /** ISO 3166-2 subdivision code (e.g. "CA-ON") or country code (e.g. "US"). */
  code: string;
  /** Display label, e.g. "Ontario, Canada". */
  label: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  /** Subdivision name (province, state, etc.) if applicable. */
  subdivision?: string;
  /** Primary languages, BCP-47, in order of prevalence. */
  languages: string[];

  privacy: Law[];
  tenancy: Law[];
  communications: Law[];
  accessibility: Law[];

  /** Statutory notices that staff can generate in /team/legal. */
  notices: NoticeTemplate[];

  /** Rent-payment specifics — fee absorption, allowed methods, etc. */
  rentPayment: {
    summary: string;
    rules: string[];
  };

  /** Data-residency posture for this region's customers. */
  dataResidency: string;

  /** Where to point customers for legal questions about this region. */
  contactNote?: string;
};
