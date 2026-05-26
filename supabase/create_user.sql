-- One-time script to create the Raymail user directly in Supabase Auth.
-- Run in Supabase dashboard → SQL Editor.
--
-- WARNING: writes to the internal `auth.users` and `auth.identities` tables.
-- The supported path is dashboard → Authentication → Users → "Add user".
-- After running this, DELETE THIS FILE — it contains a cleartext password.

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_email   text := 'info@raytimedigital.com';
  v_password text := 'Ferrychris95@';
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    crypt(v_password, gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    false,
    '',
    '',
    '',
    ''
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
    'email',
    v_email,
    now(),
    now(),
    now()
  );
end $$;
