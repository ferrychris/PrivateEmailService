-- Raymail v1 schema. Single-user model: every row is owned by one auth user.
-- The inbound webhook writes with the service-role key (bypasses RLS).
-- The web UI reads with the anon key under the user's session (enforced by RLS).

create extension if not exists "pgcrypto";

create type email_direction as enum ('inbound', 'outbound');

create table emails (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  direction email_direction not null,
  resend_email_id text unique,
  message_id text,
  in_reply_to text,
  email_references text[],
  thread_id text,
  from_address text not null,
  to_addresses text[] not null default '{}',
  cc_addresses text[] not null default '{}',
  bcc_addresses text[] not null default '{}',
  subject text,
  html text,
  text text,
  snippet text,
  read_at timestamptz,
  received_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index emails_owner_created_idx on emails (owner_id, created_at desc);
create index emails_thread_idx on emails (owner_id, thread_id) where thread_id is not null;
create index emails_direction_idx on emails (owner_id, direction);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null references emails(id) on delete cascade,
  resend_attachment_id text,
  filename text,
  content_type text,
  content_disposition text,
  content_id text,
  size_bytes integer,
  created_at timestamptz not null default now()
);

create index attachments_email_idx on attachments (email_id);

alter table emails enable row level security;
alter table attachments enable row level security;

create policy emails_owner_select on emails
  for select using (auth.uid() = owner_id);

create policy emails_owner_update on emails
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy attachments_owner_select on attachments
  for select using (
    exists (select 1 from emails e where e.id = attachments.email_id and e.owner_id = auth.uid())
  );
