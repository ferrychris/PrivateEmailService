"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Prefill = { to: string; subject: string; quoted: string; in_reply_to_id?: string };

export function ComposeForm({ prefill }: { prefill: Prefill }) {
  const router = useRouter();
  const [to, setTo] = useState(prefill.to);
  const [subject, setSubject] = useState(prefill.subject);
  const [text, setText] = useState(prefill.quoted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: to.split(",").map((s) => s.trim()).filter(Boolean),
        subject,
        text,
        in_reply_to_id: prefill.in_reply_to_id,
      }),
    });

    setPending(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({ error: "Send failed" }));
      setError(j.error ?? "Send failed");
      return;
    }

    const { id } = await res.json();
    setSentId(id ?? null);
    setShowModal(true);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="text"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To (comma-separated)"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
        />
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none"
        />
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your message…"
          rows={16}
          className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 outline-none font-mono"
        />
        <div className="flex items-center gap-3" suppressHydrationWarning>
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-neutral-900 text-white text-sm px-4 py-2 hover:bg-neutral-800 disabled:opacity-50"
          >
            {pending ? "Sending…" : "Send"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>

      {/* Success Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ animation: "fadeIn 0.15s ease" }}
          suppressHydrationWarning
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowModal(false); router.push("/sent"); }}
            suppressHydrationWarning
          />

          {/* Card */}
          <div
            className="relative z-10 bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            suppressHydrationWarning
          >
            {/* Checkmark icon */}
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100"
              suppressHydrationWarning
            >
              <svg
                className="h-7 w-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-neutral-900 mb-1">Email sent!</h2>
            <p className="text-sm text-neutral-500 mb-6">
              Your message to <span className="font-medium text-neutral-700">{to}</span> was delivered successfully.
            </p>

            <div className="flex flex-col gap-2" suppressHydrationWarning>
              {sentId && (
                <button
                  onClick={() => router.push(`/email/${sentId}`)}
                  className="w-full rounded-lg bg-neutral-900 text-white text-sm px-4 py-2.5 hover:bg-neutral-800 transition-colors"
                >
                  View sent email
                </button>
              )}
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-lg border border-neutral-200 text-neutral-700 text-sm px-4 py-2.5 hover:bg-neutral-50 transition-colors"
              >
                Back to Inbox
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}

