"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markRead(id: string) {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("emails")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
}
