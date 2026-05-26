import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getResend, fetchReceivedEmail, type EmailReceivedEvent } from "@/lib/resend";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { htmlToText, snippet } from "@/lib/format";

export const runtime = "nodejs";

let cachedOwnerId: string | null = null;

async function resolveOwnerId(supabase: SupabaseClient): Promise<string | null> {
  if (cachedOwnerId) return cachedOwnerId;
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = data?.users.find((u) => u.email?.toLowerCase() === env.allowedEmail());
  if (found) cachedOwnerId = found.id;
  return cachedOwnerId;
}

export async function POST(request: NextRequest) {
  const raw = await request.text();

  const verified = getResend().webhooks.verify({
    payload: raw,
    headers: {
      id: request.headers.get("svix-id") ?? "",
      timestamp: request.headers.get("svix-timestamp") ?? "",
      signature: request.headers.get("svix-signature") ?? "",
    },
    webhookSecret: env.resendWebhookSecret(),
  });

  const event = (verified ?? JSON.parse(raw)) as EmailReceivedEvent;

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true, ignored: event.type });
  }

  const meta = event.data;
  const full = await fetchReceivedEmail(meta.email_id);

  const supabase = createSupabaseServiceClient();
  const ownerId = await resolveOwnerId(supabase);
  if (!ownerId) {
    return NextResponse.json(
      { error: "Allowed user not found in Supabase Auth — sign in once to create the account." },
      { status: 500 },
    );
  }

  const bodyText = full.text ?? (full.html ? htmlToText(full.html) : "");
  const messageId = full.message_id ?? meta.message_id ?? null;
  const threadId = full.in_reply_to ?? (full.references?.[0] ?? messageId ?? null);

  const { data: emailRow, error: insertErr } = await supabase
    .from("emails")
    .insert({
      owner_id: ownerId,
      direction: "inbound",
      resend_email_id: full.email_id,
      message_id: messageId,
      in_reply_to: full.in_reply_to ?? null,
      email_references: full.references ?? null,
      thread_id: threadId,
      from_address: full.from,
      to_addresses: full.to ?? [],
      cc_addresses: full.cc ?? [],
      bcc_addresses: full.bcc ?? [],
      subject: full.subject ?? null,
      html: full.html ?? null,
      text: bodyText || null,
      snippet: snippet(bodyText),
      received_at: meta.created_at ?? event.created_at,
    })
    .select("id")
    .single();

  if (insertErr || !emailRow) {
    if (insertErr?.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    return NextResponse.json({ error: insertErr?.message ?? "insert failed" }, { status: 500 });
  }

  if (full.attachments?.length) {
    const rows = full.attachments.map((a) => ({
      email_id: emailRow.id,
      resend_attachment_id: a.id,
      filename: a.filename ?? null,
      content_type: a.content_type ?? null,
      content_disposition: a.content_disposition ?? null,
      content_id: a.content_id ?? null,
      size_bytes: a.size ?? null,
    }));
    await supabase.from("attachments").insert(rows);
  }

  return NextResponse.json({ ok: true, id: emailRow.id });
}
