export type EmailDirection = "inbound" | "outbound";

export type EmailRow = {
  id: string;
  owner_id: string;
  direction: EmailDirection;
  resend_email_id: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  email_references: string[] | null;
  thread_id: string | null;
  from_address: string;
  to_addresses: string[];
  cc_addresses: string[];
  bcc_addresses: string[];
  subject: string | null;
  html: string | null;
  text: string | null;
  snippet: string | null;
  read_at: string | null;
  received_at: string | null;
  sent_at: string | null;
  created_at: string;
};

export type AttachmentRow = {
  id: string;
  email_id: string;
  resend_attachment_id: string | null;
  filename: string | null;
  content_type: string | null;
  content_disposition: string | null;
  content_id: string | null;
  size_bytes: number | null;
  created_at: string;
};
