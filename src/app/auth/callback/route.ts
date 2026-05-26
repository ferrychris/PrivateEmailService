import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/error?reason=missing_code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/auth/error?reason=exchange_failed", url.origin));
  }

  if (data.user.email?.toLowerCase() !== env.allowedEmail()) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/auth/error?reason=not_allowed", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
