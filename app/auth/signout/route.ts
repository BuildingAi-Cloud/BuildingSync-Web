import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient(await cookies());
  await supabase.auth.signOut();
  // Redirect to /signin with a flag so the page can show a "Signed out"
  // toast — better feedback than landing on the public landing silently.
  return NextResponse.redirect(new URL("/signin?signedout=1", request.url), { status: 303 });
}
