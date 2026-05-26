"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function requestPasswordReset(
  formData: FormData,
): Promise<{ error?: string } | void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) return { error: "Enter your email." };

  // Only the allowed user can get a reset link. Reply with the same generic
  // success state either way to avoid leaking which address is the owner.
  if (email === env.allowedEmail()) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.appUrl()}/auth/callback?next=/auth/reset-password`,
    });
    if (error) return { error: error.message };
  }

  redirect("/auth/forgot-password?sent=1");
}
