import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { Sidebar } from "./Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== env.allowedEmail()) {
    redirect("/login");
  }

  const { count: unreadCount } = await supabase
    .from("emails")
    .select("id", { count: "exact", head: true })
    .eq("direction", "inbound")
    .is("read_at", null);

  return (
    <div className="min-h-screen flex" suppressHydrationWarning>
      <Sidebar unreadCount={unreadCount ?? 0} />
      <main className="flex-1 min-w-0 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6" suppressHydrationWarning>{children}</div>
      </main>
    </div>
  );
}
