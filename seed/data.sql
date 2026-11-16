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

-- Catalogs (PDF and cover files are kept in seed/storage/catalogs/; upload them to the 'catalogs' storage bucket at the same paths).
insert into public.catalogs (id, title, description, keywords, category_id, language, file_path, cover_path, page_count, created_at) values
  ('c51d4f3d-0fa9-4eb2-87dc-48dd7dc15939', 'بطارية رافال ليثيوم 51.2 فولت 200 أمبير (10 كيلوواط ساعة)', 'بطارية ليثيوم LiFePO4 من رافال بجهد 51.2V وسعة 200Ah وطاقة 10.24kWh، خلايا EVE A+، عمر 6000 دورة، تدعم البلوتوث والتوصيل على التوازي حتى 15 وحدة، ومتوافقة مع أغلب المحولات.', 'RAFAL 51.2V 200Ah 10kWh LiFePO4 بطارية ليثيوم 48 فولت 10 كيلو بطارية جدارية EVE', '7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'en', 'files/80ed5887-5a25-4d23-919d-1c275b933066.pdf', 'covers/5d26749a-6afe-4db2-81b4-d2c49e33f6aa.jpg', 1, '2026-11-15T16:57:55.388571+00:00'),
  ('0cf3b555-706b-4f43-9269-cda23b58a842', 'بطارية رافال ليثيوم 25.6 فولت 314 أمبير (8 كيلوواط ساعة)', 'بطارية ليثيوم LiFePO4 من رافال بجهد 25.6V وسعة 314Ah وطاقة 8kWh، خلايا EVE A+، عمر 8000 دورة، تدعم البلوتوث والتوصيل على التوازي حتى 15 وحدة، ومتوافقة مع أغلب المحولات.', 'RAFAL 25.6V 314Ah 8kWh LiFePO4 بطارية ليثيوم 24 فولت 8 كيلو EVE', '7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'en', 'files/740f5b89-1a62-4248-a3f9-afc3aa29f094.pdf', 'covers/5813385f-37f3-4296-ace7-c8f7970a54ca.jpg', 1, '2026-11-15T16:57:56.959467+00:00')
on conflict (id) do nothing;
-- Catalog text for search (meaning vectors and product profiles: run scripts/index_catalogs.py chunks, then profiles).
insert into public.catalog_chunks (catalog_id, page, content) values
  ('0cf3b555-706b-4f43-9269-cda23b58a842', 1, 'LIFEPO4 25.6V 314Ah-LiFePO4-battery EVE A+ cells、 LiFePO4 cells/Long cyclelife/ Bluetooth Parameters 8 kWh Performance Battery Type LiFePO4 Nominal Capacity 314Ah Energy 8038Wh Nominal Voltage 2 5 . 6V Operating Voltage Range 2 2 . 4-2 8 . 8V Charging Voltage Range 2 2 . 4-2 8 . 8V Cut-off Charging Voltage 2 8 . 8V Standard Charging Current/Power 150A/3.84kW Maximum Charging Current/Power 150A/3.84kW Standard Discharging Current/Power 150A/3.84kW Maximum Continuous Discharging Current/Power 150A/3.84kW Peak Discharge Current 160A Cut-off Discharge Voltage 2 8 . 8V Recommended Discharge DOD (Depth of Discharge) 0.9 Cycle Life 8000 Designed Lifespan 10 years General Speciﬁcation Communication CAN/RS485/RS232 Efﬁciency 0.96 Maximum Parallel Units Up to 15 Units, Suggest 8 Units Max Discharge Temperature Range -20-60℃ Charge Temperature Range 0-45˚C Storage Temperature Range 10-30˚C DEYE/AFORE/MEGAREVO/SOLIS/GROWATT/LUXPOWER/ Inverter Compatibility VOLTRONICS/GOODWE/SMA/VICTRON/SOROTEC/MUST/etc. Enclosure Material IPCC Ingress Protection Rating IP2 Corrosion Protection Rating C3 Auxiliary Heating Function Optional Dimensions (L*W*H) Net Weight / Gross Weight 72kg Certiﬁcations UN38.3/MSDS'),
  ('c51d4f3d-0fa9-4eb2-87dc-48dd7dc15939', 1, 'LIFEPO4 51.2V 200Ah-LiFePO4-battery EVE A+ cells、 LiFePO4 cells/Long cyclelife/ Bluetooth Parameters 10kWh Performance Battery Type LiFePO4 Nominal Capacity 200Ah Energy 10240Wh Nominal Voltage 51.2V Operating Voltage Range 44.8-57.6V Charging Voltage Range 57.6V Cut-off Charging Voltage 57.6V Standard Charging Current/Power 75A/3.84kW Maximum Charging Current/Power 150A/7.68kW Standard Discharging Current/Power 75A/3.84kW Maximum Continuous Discharging Current/Power 150A/7.68kW Peak Discharge Current 160A Cut-off Discharge Voltage 44.8V Recommended Discharge DOD (Depth of Discharge) 0.9 Cycle Life 6000 Designed Lifespan 10 years General Speciﬁcation Communication CAN/RS485/RS232 Efﬁciency 0.96 Maximum Parallel Units Up to 15 Units, Suggest 8 Units Max Discharge Temperature Range -20-60℃ Charge Temperature Range 0-45˚C Storage Temperature Range 10-30˚C DEYE/AFORE/MEGAREVO/SOLIS/GROWATT/LUXPOWER/ Inverter Compatibility VOLTRONICS/GOODWE/SMA/VICTRON/SOROTEC/MUST/etc. Enclosure Material IPCC Ingress Protection Rating IP21 Corrosion Protection Rating C3 Auxiliary Heating Function Optional Dimensions (L*W*H) 480*850*195mm Net Weight / Gross Weight 98kg Certiﬁcations UN38.3/MSDS');

-- Arabic editions: original artwork and product specifications preserved.
insert into public.catalogs (id, title, description, keywords, category_id, language, file_path, cover_path, page_count, created_at) values
  ('a51a2000-1116-4000-8000-000000000001', 'بطارية رافال ليثيوم 51.2 فولت 200 أمبير (10 كيلوواط ساعة)', 'بطارية ليثيوم LiFePO4 من رافال بجهد 51.2V وسعة 200Ah وطاقة 10.24kWh، خلايا EVE A+، عمر 6000 دورة، تدعم البلوتوث والتوصيل على التوازي حتى 15 وحدة، ومتوافقة مع أغلب المحولات.', 'RAFAL 51.2V 200Ah 10kWh LiFePO4 بطارية ليثيوم 48 فولت 10 كيلو بطارية جدارية EVE', '7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'ar', 'files/rafal-51-200-ar-20261116.pdf', 'covers/5d26749a-6afe-4db2-81b4-d2c49e33f6aa.jpg', 1, '2026-11-16T16:33:00+00:00'),
  ('a2531400-1116-4000-8000-000000000002', 'بطارية رافال ليثيوم 25.6 فولت 314 أمبير (8 كيلوواط ساعة)', 'بطارية ليثيوم LiFePO4 من رافال بجهد 25.6V وسعة 314Ah وطاقة 8kWh، خلايا EVE A+، عمر 8000 دورة، تدعم البلوتوث والتوصيل على التوازي حتى 15 وحدة، ومتوافقة مع أغلب المحولات.', 'RAFAL 25.6V 314Ah 8kWh LiFePO4 بطارية ليثيوم 24 فولت 8 كيلو EVE', '7b3b1882-212e-45f8-a0f2-f91dc4a01d0b', 'ar', 'files/rafal-25-314-ar-20261116.pdf', 'covers/5813385f-37f3-4296-ace7-c8f7970a54ca.jpg', 1, '2026-11-16T16:33:01+00:00')
on conflict (id) do nothing;
insert into public.catalog_chunks (catalog_id,page,content,embedding) select 'a51a2000-1116-4000-8000-000000000001'::uuid,page,content,embedding from public.catalog_chunks where catalog_id='c51d4f3d-0fa9-4eb2-87dc-48dd7dc15939' and not exists (select 1 from public.catalog_chunks where catalog_id='a51a2000-1116-4000-8000-000000000001');
insert into public.catalog_profiles (catalog_id,summary_ar,summary_en,specs,embedding) select 'a51a2000-1116-4000-8000-000000000001'::uuid,summary_ar,summary_en,specs,embedding from public.catalog_profiles where catalog_id='c51d4f3d-0fa9-4eb2-87dc-48dd7dc15939' on conflict(catalog_id) do nothing;
insert into public.catalog_chunks (catalog_id,page,content,embedding) select 'a2531400-1116-4000-8000-000000000002'::uuid,page,content,embedding from public.catalog_chunks where catalog_id='0cf3b555-706b-4f43-9269-cda23b58a842' and not exists (select 1 from public.catalog_chunks where catalog_id='a2531400-1116-4000-8000-000000000002');
insert into public.catalog_profiles (catalog_id,summary_ar,summary_en,specs,embedding) select 'a2531400-1116-4000-8000-000000000002'::uuid,summary_ar,summary_en,specs,embedding from public.catalog_profiles where catalog_id='0cf3b555-706b-4f43-9269-cda23b58a842' on conflict(catalog_id) do nothing;
