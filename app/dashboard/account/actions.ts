"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

const ProfileBody = z.object({
  name: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(40).nullable(),
});

const PasswordBody = z.object({
  currentPassword: z.string().min(1).max(128),
  password: z.string().min(8).max(128),
});

type Result = { ok: true; message: string } | { ok: false; error: string };

export async function updateProfile(_prev: unknown, formData: FormData): Promise<Result> {
  const session = await requireUser();
  const parsed = ProfileBody.safeParse({
    name: ((formData.get("name") as string) || "").trim() || null,
    phone: ((formData.get("phone") as string) || "").trim() || null,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  await prisma.user.update({
    where: { id: session.appUser.id },
    data: parsed.data,
  });
  revalidatePath("/dashboard/account");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile saved." };
}

export async function updatePassword(_prev: unknown, formData: FormData): Promise<Result> {
  const session = await requireUser();
  const parsed = PasswordBody.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues.find((i) => i.path[0] === "password")
          ? "New password must be at least 8 characters."
          : "Current password is required.",
    };
  }
  if (parsed.data.currentPassword === parsed.data.password) {
    return { ok: false, error: "New password must differ from current password." };
  }
  const supabase = await createClient(await cookies());
  // Re-verify the current password before allowing the change. Supabase's
  // updateUser doesn't check the old password by itself in older policies,
  // and even when it does the error is opaque — verifying here yields a
  // clearer message and matches the project's "Require current password"
  // Auth setting.
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: session.authUser.email!,
    password: parsed.data.currentPassword,
  });
  if (signInError) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Password updated." };
}
