-- Rafal app data snapshot (2026-11-15). Run once on a fresh database after the migrations.
-- Product sections
insert into public.categories (id, name) values
  ('ba96162a-43a1-4d06-a3e8-ef4c61277365', 'الألواح'),
  ('7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'البطاريات'),
  ('2e389eca-9017-4c08-82a9-8808424548b8', 'المحولات'),
  ('872ff909-1831-420e-84a8-93683dfd80af', 'الغطاسات')
on conflict (id) do nothing;

-- Admin account (same email and same password as the original; password stored as an encrypted hash only)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000000', '1abcd37b-3f9d-4044-ab75-261210f2df3e', 'authenticated', 'authenticated',
  'mohammedqumash3@gmail.com', '$2a$10$tyqk9ad.vRxWlqEmSAdMfeOUPV41id1TdO9BnwYyoZP0tr7UQlWQa', now(), now(), now(),
  '{"provider":"email","providers":["email"]}', '{}')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, provider, identity_data, created_at, updated_at)
values (gen_random_uuid(), '1abcd37b-3f9d-4044-ab75-261210f2df3e', '1abcd37b-3f9d-4044-ab75-261210f2df3e', 'email',
  '{"sub":"1abcd37b-3f9d-4044-ab75-261210f2df3e","email":"mohammedqumash3@gmail.com","email_verified":true}', now(), now())
on conflict do nothing;
insert into public.user_roles (user_id, role)
values ('1abcd37b-3f9d-4044-ab75-261210f2df3e', 'admin'::public.app_role)
on conflict (user_id, role) do nothing;

-- Catalogs: none uploaded yet (catalogs, catalog_chunks, catalog_profiles are empty).
