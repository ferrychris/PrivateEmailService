import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { ComposeForm } from "./ComposeForm";
import type { EmailRow } from "@/lib/types";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ reply?: string }>;
}) {
  const { reply } = await searchParams;

  let prefill: {
    to: string;
    subject: string;
    quoted: string;
    in_reply_to_id?: string;
  } = { to: "", subject: "", quoted: "" };

  if (reply) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("emails")
      .select("*")
      .eq("id", reply)
      .maybeSingle();
    if (data) {
      const row = data as EmailRow;
      const subj = row.subject ?? "";
      const repliedSubj = subj.toLowerCase().startsWith("re:") ? subj : `Re: ${subj}`;
      const quotedBody = row.text ?? "";
      const replyDate = formatDate(row.received_at ?? row.created_at);
      prefill = {
        to: row.from_address,
        subject: repliedSubj,
        quoted: quotedBody
          ? `\n\nOn ${replyDate}, ${row.from_address} wrote:\n${quotedBody
              .split("\n")
              .map((l) => `> ${l}`)
              .join("\n")}`
          : "",
        in_reply_to_id: row.id,
      };
    }
  }

  return (
    <div suppressHydrationWarning>
      <header className="mb-4">
        <h1 className="text-xl font-semibold">{reply ? "Reply" : "New message"}</h1>
      </header>
      <ComposeForm prefill={prefill} />
    </div>
  );
}
