import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatAddress, formatDate } from "@/lib/format";
import type { EmailRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("emails")
    .select("id, from_address, subject, snippet, received_at, created_at, read_at")
    .eq("direction", "inbound")
    .order("received_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) {
    return <p className="text-red-600 text-sm">Failed to load inbox: {error.message}</p>;
  }

  const rows = (data ?? []) as Pick<
    EmailRow,
    "id" | "from_address" | "subject" | "snippet" | "received_at" | "created_at" | "read_at"
  >[];

  return (
    <div>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-xl font-semibold">Inbox</h1>
        <span className="text-xs text-neutral-500">{rows.length} message{rows.length === 1 ? "" : "s"}</span>
      </header>

      {!rows.length ? (
        <div className="text-center py-20 border border-dashed border-neutral-200 rounded">
          <p className="text-neutral-500">Inbox is empty.</p>
          <p className="text-xs text-neutral-400 mt-2">
            Send an email to your receiving domain to get started.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded">
          {rows.map((r) => {
            const { name, email } = formatAddress(r.from_address);
            const unread = !r.read_at;
            return (
              <li key={r.id}>
                <Link
                  href={`/email/${r.id}`}
                  className={`flex items-baseline gap-3 px-4 py-3 hover:bg-neutral-50 ${
                    unread ? "bg-white" : "bg-neutral-50/50"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                      unread ? "bg-blue-500" : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`w-40 shrink-0 truncate text-sm ${unread ? "font-semibold" : "text-neutral-700"}`}
                    title={email}
                  >
                    {name || email}
                  </span>
                  <span className={`flex-1 truncate text-sm ${unread ? "font-semibold" : "text-neutral-700"}`}>
                    {r.subject || "(no subject)"}
                    <span className="text-neutral-500 font-normal"> — {r.snippet}</span>
                  </span>
                  <span className="text-xs text-neutral-500 shrink-0">
                    {formatDate(r.received_at ?? r.created_at)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
