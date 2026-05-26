import { Resend } from "resend";
import { env } from "@/lib/env";

let cached: Resend | null = null;

export function getResend(): Resend {
  if (!cached) cached = new Resend(env.resendApiKey());
  return cached;
}

export type ReceivedEmail = {
  email_id: string;
  created_at: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  message_id?: string;
  in_reply_to?: string;
  references?: string[];
  subject?: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    id: string;
    filename?: string;
    content_type?: string;
    content_disposition?: string;
    content_id?: string;
    size?: number;
  }>;
};

export type EmailReceivedEvent = {
  type: "email.received";
  created_at: string;
  data: ReceivedEmail;
};

// Fetch the full received email (body + headers) from Resend by id.
// The webhook payload only contains metadata.
export async function fetchReceivedEmail(emailId: string): Promise<ReceivedEmail> {
  const res = await fetch(`https://api.resend.com/emails/received/${emailId}`, {
    headers: { Authorization: `Bearer ${env.resendApiKey()}` },
  });
  if (!res.ok) throw new Error(`Resend fetch failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { data: ReceivedEmail } | ReceivedEmail;
  return "data" in json ? json.data : json;
}
