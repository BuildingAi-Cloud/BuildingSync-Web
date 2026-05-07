import "server-only";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isValidLocale, type LocaleCode } from "@/lib/locale";

// Server-side: read the user's locale from the cookie. Falls back to the
// default. Safe to call from any server component / server action; will
// throw at build time if accidentally imported into a client component
// (via the "server-only" guard above).
export async function getLocale(): Promise<LocaleCode> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return raw && isValidLocale(raw) ? raw : DEFAULT_LOCALE;
}
