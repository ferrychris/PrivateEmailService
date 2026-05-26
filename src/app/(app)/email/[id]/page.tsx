import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatAddress, formatDate } from "@/lib/format";
import type { EmailRow, AttachmentRow } from "@/lib/types";
import { markRead } from "./actions";

export const dynamic = "force-dynamic";

export default async function EmailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: email } = await supabase
    .from("emails")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!email) notFound();
  const row = email as EmailRow;

  if (row.direction === "inbound" && !row.read_at) {
    await markRead(row.id);
  }

  const { data: atts } = await supabase
    .from("attachments")
    .select("*")
    .eq("email_id", row.id);

  const from = formatAddress(row.from_address);

  return (
    <article className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={row.direction === "outbound" ? "/sent" : "/"} className="text-sm text-neutral-500 hover:text-black">
          ← Back
        </Link>
        {row.direction === "inbound" && (
          <Link
            href={`/compose?reply=${row.id}`}
            className="rounded bg-neutral-900 text-white text-sm px-3 py-1.5 hover:bg-neutral-800"
          >
            Reply
          </Link>
        )}
      </div>

      <header className="border-b border-neutral-200 pb-3">
        <h1 className="text-xl font-semibold">{row.subject || "(no subject)"}</h1>
        <div className="text-sm text-neutral-600 mt-1">
          <span className="font-medium">{from.name}</span>{" "}
          <span className="text-neutral-500">&lt;{from.email}&gt;</span>
        </div>
        <div className="text-xs text-neutral-500 mt-0.5">
          To: {(row.to_addresses ?? []).join(", ")}
          {row.cc_addresses?.length ? ` · Cc: ${row.cc_addresses.join(", ")}` : ""}
        </div>
        <div className="text-xs text-neutral-500 mt-0.5">
          {formatDate(row.received_at ?? row.sent_at ?? row.created_at)}
        </div>
      </header>

      {atts && atts.length > 0 && (
        <section className="text-sm">
          <div className="font-medium mb-1">Attachments</div>
          <ul className="space-y-1">
            {(atts as AttachmentRow[]).map((a) => (
              <li key={a.id} className="text-neutral-700">
                {a.filename ?? "(unnamed)"}{" "}
                <span className="text-neutral-500">
                  {a.content_type ?? ""} {a.size_bytes ? `· ${a.size_bytes} bytes` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        {row.html ? (
          <div
            className="prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: row.html }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm font-sans">{row.text}</pre>
        )}
      </section>
    </article>
  );
}
