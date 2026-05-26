import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatAddress, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SentPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("emails")
    .select("id, to_addresses, subject, snippet, sent_at, created_at")
    .eq("direction", "outbound")
    .order("sent_at", { ascending: false, nullsFirst: false })
    .limit(100);

  if (error) return <p className="text-red-600 text-sm">{error.message}</p>;

  const rows = data ?? [];

  return (
    <div suppressHydrationWarning>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-xl font-semibold">Sent</h1>
        <span className="text-xs text-neutral-500">
          {rows.length} message{rows.length === 1 ? "" : "s"}
        </span>
      </header>

      {!rows.length ? (
        <div
          className="text-center py-20 border border-dashed border-neutral-200 rounded"
          suppressHydrationWarning
        >
          <p className="text-neutral-500">No sent emails yet.</p>
          <p className="text-xs text-neutral-400 mt-2">
            <Link href="/compose" className="underline hover:text-black">
              Compose your first message
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-neutral-200 border border-neutral-200 rounded">
          {rows.map((r) => {
            const recipients = (r.to_addresses ?? [])
              .map((addr: string) => {
                const { name, email } = formatAddress(addr);
                return name || email;
              })
              .join(", ");

            return (
              <li key={r.id}>
                <Link
                  href={`/email/${r.id}`}
                  className="flex items-baseline gap-3 px-4 py-3 hover:bg-neutral-50 bg-white"
                >
                  {/* Send arrow indicator */}
                  <span className="w-3 h-3 shrink-0 mt-0.5 text-neutral-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </span>

                  {/* Recipient */}
                  <span
                    className="w-40 shrink-0 truncate text-sm text-neutral-700"
                    title={(r.to_addresses ?? []).join(", ")}
                  >
                    {recipients || "(no recipient)"}
                  </span>

                  {/* Subject + snippet */}
                  <span className="flex-1 truncate text-sm text-neutral-700">
                    {r.subject || "(no subject)"}
                    <span className="text-neutral-500 font-normal"> — {r.snippet}</span>
                  </span>

                  {/* Date */}
                  <span className="text-xs text-neutral-500 shrink-0">
                    {formatDate(r.sent_at ?? r.created_at)}
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
