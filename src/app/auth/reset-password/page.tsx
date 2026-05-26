import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ResetForm } from "./ResetForm";

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This page is only reachable after the recovery code has been exchanged
  // by /auth/callback, which leaves a temporary session.
  if (!user) {
    redirect("/auth/forgot-password");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm" suppressHydrationWarning>
        <h1 className="text-2xl font-semibold mb-1">Set a new password</h1>
        <p className="text-sm text-neutral-500 mb-6">Choose something you'll remember.</p>
        <ResetForm />
      </div>
    </main>
  );
}
