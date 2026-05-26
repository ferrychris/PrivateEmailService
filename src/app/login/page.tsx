import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; magic?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && user.email?.toLowerCase() === env.allowedEmail()) {
    redirect(params.next ?? "/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-1">Raymail</h1>
        <p className="text-sm text-neutral-500 mb-6">Sign in to your inbox.</p>
        {params.magic === "1" && (
          <p className="mb-4 rounded bg-emerald-50 text-emerald-700 text-sm px-3 py-2">
            Sign-in link sent. Check your email.
          </p>
        )}
        <LoginForm next={params.next} />
      </div>
    </main>
  );
}
