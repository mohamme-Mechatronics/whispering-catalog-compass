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

-- Solar panels (الألواح): SDL SKYMAX 685-730W N-TOPCon bifacial (English original, 2 pages).
insert into public.catalogs (id, title, description, keywords, category_id, language, file_path, cover_path, page_count) values
  ('7fd8e57a-9062-4711-b150-f08b713e4da6', 'لوح شمسي SDL سكاي ماكس 730 واط (ثنائي الوجه N-TOPCon)', 'لوح طاقة شمسية SDL من سلسلة SKYMAX بتقنية N-TOPCon ثنائي الوجه (يولّد من الجهتين)، 132 خلية، قدرة من 685 حتى 730 واط، كفاءة حتى 23.5%، جهد نظام 1500V، مقاس 2384×1303×33 ملم ووزن 37.5 كغ، ضمان منتج 15 سنة وضمان قدرة 30 سنة.', 'SDL SUNDARLING SKYMAX RM-685-730W-210M/132TB 730W 730 واط 720W 700W لوح شمسي لوح طاقة شمسية ألواح بانل N-TOPCon TOPCon Bifacial ثنائي الوجه مونو كريستال 132 خلية', 'ba96162a-43a1-4d06-a3e8-ef4c61277365', 'en', 'files/418fe866-a226-4bc3-b456-d3cd9f6c948b.pdf', 'covers/68a1ff4f-465d-4a9b-b92c-00a6b4d378cc.jpg', 2)
on conflict (id) do nothing;
insert into public.catalog_chunks (catalog_id, page, content) select '7fd8e57a-9062-4711-b150-f08b713e4da6'::uuid, v.page, v.content from (values (1, 'SDL SUNDARLING SKYMAX series RM-685-730W-210M/132TB N-TOPCon Bifacial Monocrystalline Module
RM-685-730W-210M/132TB
N-TOPCon


  Suitable for centralised PV generation.
  Warranty Upgrades.
  High eﬃciencyand strong power generation.
  Safer smart manufacturing.
  No-Destructive Cutting.
  Junction Box Laser Welding Technology.




 2384×1303×33
 Dimensions (mm)


 132 CELL                         685-730Wp
 Mono TOPCon                             Power output


 1500V DC                                  23.18%
 Max. system voltage                     Max. eﬃciency




                                                                     IEC61215/IEC61730/IEC61701/IEC62716/WEEE De93315506




         Higher Power Output
         Module power increases by 5-25% generally, bringing                Low-light Performance
         signiﬁcantly lower LCOE and higher IRR.                            Excellent performance in low light.
         0-5w positive tolerance output warranty.


         Multi Busbar Technology                                            Durability Against Extreme Environmental Conditions
         By improving optical utilization rate, power increases by          High salt mist and ammonia resistance certiﬁed by TUV NORD.
         2~3% and eﬃciency increases by 0.4~0.6%.

                                                                            EL Full Inspection
         PID Resistance                                                     Dual-stage 100% EL Inspection.
         Excellent Anti-PID performance guarantee via optimized
         mass-production process and material control.

Linear performance warranty: 15-year product warranty / 30-year linear power warranty, 0.40% annual degradation over 30 years, 87.4% at year 30.'), (2, 'SDL SKYMAX series RM-685-730W-210M/132TB N-TOPCon Monocrystalline Module - datasheet
ELECTRICAL CHARACTERISTICS (STC: Irradiance 1000W/m2, module temperature 25C, AM=1.5)
Rated Power Pmax (Wp): 685 | 690 | 695 | 700 | 705 | 710 | 715 | 720 | 725 | 730
Open Circuit Voltage Voc (V): 47.70 | 47.90 | 48.30 | 48.60 | 48.80 | 49.00 | 49.20 | 49.40 | 49.60 | 49.80
Short Circuit Current Isc (A): 18.21 | 18.25 | 18.28 | 18.32 | 18.36 | 18.40 | 18.44 | 18.48 | 18.52 | 18.56
Max Power Voltage Vmpp (V): 39.90 | 40.10 | 40.30 | 40.50 | 40.70 | 40.90 | 41.10 | 41.30 | 41.50 | 41.70
Max Power Current Impp (A): 17.19 | 17.23 | 17.25 | 17.29 | 17.33 | 17.36 | 17.40 | 17.44 | 17.48 | 17.52
Module Efficiency (%): 22.05 | 22.21 | 22.37 | 22.53 | 22.70 | 22.86 | 23.02 | 23.18 | 23.34 | 23.50
Maximum system voltage: 1500V DC. Fuse Rating: 30A.
Temperature coefficient Pmax: -0.30%/C. Temperature coefficient Isc: 0.046%/C. Temperature coefficient Voc: -0.25%/C.
Bifacial factor: Isc=80%±10%, Voc=100%±3%, Pmax=80%±10%.
BNPI (front 1000W/m2, rear 135W/m2, cell 25C, AM=1.5) - bifacial gain values:
Rated Power Pmax (Wp): 758.9 | 764.7 | 769.3 | 774.8 | 780.6 | 785.7 | 791.6 | 797.1 | 802.6 | 808.6
Voc (V): 47.90 | 48.10 | 48.50 | 48.80 | 49.00 | 49.20 | 49.40 | 49.60 | 49.80 | 50.00
Isc (A): 20.06 | 20.11 | 20.15 | 20.19 | 20.24 | 20.28 | 20.33 | 20.37 | 20.41 | 20.46
Vmpp (V): 40.10 | 40.30 | 40.50 | 40.70 | 40.90 | 41.10 | 41.30 | 41.50 | 41.70 | 41.90
Impp (A): 18.93 | 18.98 | 19.00 | 19.04 | 19.09 | 19.12 | 19.17 | 19.21 | 19.25 | 19.30
Power tolerance: 0~+3%. Operating temperature: -40C ~ +85C.
MECHANICAL: Number of cells 132pcs; Type of cell N-TOPCon Mono; Glass thickness 2.0mm (dual glass); Junction box IP68, 1500V DC, 3 diodes; Frame anodized aluminum alloy; Module size 2384x1303x33 mm; Weight 37.5 kg; Cables 4.0mm2, MC4 compatible; Cable length +350mm/-250mm (customizable).
PACKAGING: Module height 33mm; 33 modules per pallet; pallet box 1326x1140x2515 mm; box gross weight 1280 kg; 594 modules per 40ft HQ container; 18 pallets per 40ft HQ container.
Mounting holes 14x9 and 10x7, grounding hole 6, drain hole 8. Mounting hole spacing 1264 mm (width 1303 mm, length 2384 mm).')) as v(page, content)
where not exists (select 1 from public.catalog_chunks where catalog_id='7fd8e57a-9062-4711-b150-f08b713e4da6');
