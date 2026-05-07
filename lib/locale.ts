// Locale + region preference. R1 ships the *mechanism* — the cookie, the
// supported list, the switcher UI — but does NOT actually translate any
// strings yet. Adding string translation is a follow-up that can use
// next-intl, react-aria-components Intl, or plain ICU MessageFormat.
//
// What this does today:
//   - Persist user's chosen locale via cookie (server-readable)
//   - Surface a switcher in the AccountMenu so the BM/FM/concierge can
//     pick their preferred locale without a code change
//
// What it does NOT do:
//   - Translate UI strings (still all en-CA copy)
//   - Switch currency display, phone format, RTL direction
//   - Route to a region-specific Supabase project (per-region data
//     residency is a separate piece of work)
//
// File split: this module is import-safe from client components (only
// constants + pure helpers). Server-side cookie reading lives in
// lib/locale-server.ts; the cookie-write server action lives in
// lib/locale-actions.ts.

export const LOCALE_COOKIE = "bs-locale";

export const LOCALES = [
  { code: "en-CA", label: "English (Canada)", region: "CA", language: "en", dir: "ltr" as const },
  { code: "en-IN", label: "English (India)",  region: "IN", language: "en", dir: "ltr" as const },
  { code: "en-AE", label: "English (UAE)",    region: "AE", language: "en", dir: "ltr" as const },
  { code: "fr-CA", label: "Français (Canada)", region: "CA", language: "fr", dir: "ltr" as const },
  { code: "hi-IN", label: "हिन्दी (India)",   region: "IN", language: "hi", dir: "ltr" as const },
  { code: "ar-AE", label: "العربية (الإمارات)", region: "AE", language: "ar", dir: "rtl" as const },
] as const;

export type LocaleCode = typeof LOCALES[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en-CA";

export function isValidLocale(code: string): code is LocaleCode {
  return LOCALES.some((l) => l.code === code);
}

export function localeMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}
