-- Rafal app data snapshot (2026-11-15). Run once on a fresh database after the migrations.
-- Product sections
insert into public.categories (id, name) values
  ('ba96162a-43a1-4d06-a3e8-ef4c61277365', 'الألواح'),
  ('7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'البطاريات'),
  ('2e389eca-9017-4c08-82a9-8808424548b8', 'المحولات'),
  ('872ff909-1831-420e-84a8-93683dfd80af', 'الغطاسات')
on conflict (id) do nothing;

-- Admin account: create user mohammedqumash3@gmail.com in auth first (password is NOT stored here),
-- then grant the admin role:
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role from auth.users where email = 'mohammedqumash3@gmail.com'
on conflict (user_id, role) do nothing;

-- Catalogs: none uploaded yet (catalogs, catalog_chunks, catalog_profiles are empty).
