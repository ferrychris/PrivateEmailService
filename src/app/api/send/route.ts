import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { env } from "@/lib/env";
import { htmlToText, snippet } from "@/lib/format";

export const runtime = "nodejs";

type SendBody = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  in_reply_to_id?: string;
};

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== env.allowedEmail()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as SendBody;

  if (!body.to?.length || !body.subject) {
    return NextResponse.json({ error: "Missing to/subject" }, { status: 400 });
  }

  let replyHeaders: Record<string, string> | undefined;
  let threadId: string | null = null;
  let inReplyToMsgId: string | null = null;
  let referencesMsgIds: string[] | null = null;

  if (body.in_reply_to_id) {
    const { data: parent } = await supabase
      .from("emails")
      .select("message_id, email_references, thread_id, subject")
      .eq("id", body.in_reply_to_id)
      .maybeSingle();
    if (parent?.message_id) {
      const refs = [...(parent.email_references ?? []), parent.message_id];
      replyHeaders = {
        "In-Reply-To": parent.message_id,
        References: refs.join(" "),
      };
      threadId = parent.thread_id ?? parent.message_id;
      inReplyToMsgId = parent.message_id;
      referencesMsgIds = refs;
    }
  }

  const resend = getResend();
  const { data: sent, error: sendErr } = await resend.emails.send({
    from: env.fromEmail(),
    to: body.to,
    cc: body.cc,
    bcc: body.bcc,
    subject: body.subject,
    html: body.html,
    text: body.text,
    headers: replyHeaders,
  });

  if (sendErr || !sent) {
    return NextResponse.json({ error: sendErr?.message ?? "Send failed" }, { status: 500 });
  }

  const bodyText = body.text ?? (body.html ? htmlToText(body.html) : "");

  const { data: row, error: insertErr } = await supabase
    .from("emails")
    .insert({
      owner_id: user.id,
      direction: "outbound",
      resend_email_id: sent.id,
      from_address: env.fromEmail(),
      to_addresses: body.to,
      cc_addresses: body.cc ?? [],
      bcc_addresses: body.bcc ?? [],
      subject: body.subject,
      html: body.html ?? null,
      text: bodyText || null,
      snippet: snippet(bodyText),
      in_reply_to: inReplyToMsgId,
      email_references: referencesMsgIds,
      thread_id: threadId,
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertErr || !row) {
    return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ id: row.id, resend_email_id: sent.id });
}
