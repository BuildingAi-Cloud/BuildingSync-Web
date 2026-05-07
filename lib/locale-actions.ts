"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, isValidLocale } from "@/lib/locale";

// One-year cookie. No HttpOnly because we want client-side reads too if
// we later add a useLocale() hook; SameSite=Lax + secure-when-https is
// the right default for a non-sensitive preference cookie.
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function setLocale(code: string): Promise<{ ok: boolean }> {
  if (!isValidLocale(code)) return { ok: false };
  const store = await cookies();
  store.set(LOCALE_COOKIE, code, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
