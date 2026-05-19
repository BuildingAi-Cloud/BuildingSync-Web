import type { Region } from "./types";
import { ontario } from "./ontario";

// Registry of supported regions. Today Ontario is the only fully
// populated one; placeholder entries documented below are listed in
// PLANNED_REGIONS so the /legal page can show "coming soon" rather
// than pretending we cover everything.

export const REGIONS: Region[] = [
  ontario,
];

/** Regions on the roadmap but not yet populated. Shown as "coming soon". */
export const PLANNED_REGIONS: Array<{ code: string; label: string; eta?: string }> = [
  { code: "CA-QC", label: "Québec, Canada", eta: "R2" },
  { code: "CA-BC", label: "British Columbia, Canada", eta: "R2" },
  { code: "CA-AB", label: "Alberta, Canada", eta: "R3" },
  { code: "US-CA", label: "California, USA", eta: "R3" },
  { code: "US-NY", label: "New York, USA", eta: "R3" },
];

export const DEFAULT_REGION_CODE = "CA-ON";

export function getRegion(code: string = DEFAULT_REGION_CODE): Region {
  return REGIONS.find((r) => r.code === code) ?? REGIONS[0];
}

export type { Region } from "./types";
