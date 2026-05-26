-- Allow the authenticated owner to insert their own outbound email rows.
-- The inbound webhook uses the service-role key and bypasses RLS entirely,
-- so this policy only needs to cover the web UI (compose/send).

create policy emails_owner_insert on emails
  for insert
  with check (auth.uid() = owner_id);
