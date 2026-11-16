# مكتبة كتالوجات رافال — RAFAL Catalog Library

> هذا الملف هو **دليل المشروع الكامل**. عند استيراد المشروع من GitHub إلى Lovable (أو لأي مطوّر)، اقرأ هذا الملف و`AGENTS.md` أولاً لتكمل من نفس النقطة.
> This file is the full project handbook. On a fresh import, read it together with `AGENTS.md` and continue from where the work stopped.

---

## 1. الفكرة / Purpose
تطبيق ويب (يعمل أيضاً كتطبيق هاتف قابل للتثبيت) يجمع كل كتالوجات منتجات شركة **رافال** للطاقة الشمسية في مكان واحد:
- بحث سريع باسم المنتج أو الموديل أو القدرة، بالعربي أو الإنجليزي وبأي لهجة.
- عارض PDF داخل التطبيق مع تكبير وتصغير، ومشاركة رابط أي كتالوج.
- مساعد ذكي يجيب عن المواصفات من داخل الكتالوجات (كتابة وصوت) ويذكر المصدر.
- الهدف: أن يختار العميل معدات الطاقة الشمسية المناسبة لنظامه.

## 2. هوية الشركة / Brand
- اسم الشركة: **رافال (RAFAL)**. اسم التطبيق: «مكتبة كتالوجات رافال»، الاسم القصير: «كتالوجات رافال».
- الشعار: كلمة RAFAL حمراء مع رمز R (`src/assets/rafal-logo.png.asset.json` و`rafal-mark.png.asset.json`، وأيقونات `public/icon-*.png`).
- الألوان: خلفية بيضاء مع اللون الأحمر للشعار `#AE1C24` (≈ `oklch(0.5 0.19 25)`) كلون أساسي في `src/styles.css`.
- الخط: IBM Plex Sans Arabic، والواجهة من اليمين لليسار (RTL).
- **ممنوع** إظهار أو إعادة ربط أي شيء من الشركة السابقة: لا شعار ولا اسم ولا كتالوجات ولا روابط ولا تطبيق أندرويد قديم.

## 3. الصفحات / Pages
| الرابط | الوظيفة |
|---|---|
| `/` | الصفحة الرئيسية: الشعار، البحث، أزرار الأقسام، شبكة الكتالوجات (عربي/English)، رابط «لوحة الإدارة» أسفل الصفحة |
| `/catalog/$id` | فتح كتالوج مباشرة من رابط مُشارك |
| `/admin` | لوحة الإدارة (بكلمة سر) |
| `/reset-password` | تعيين كلمة سر جديدة من رابط البريد |
| `/api/public/assistant`, `assistant-stream`, `speak`, `transcribe` | المساعد الذكي (نص، بث، تحويل نص لصوت، صوت لنص) |

## 4. أقسام المنتجات / Product sections
أربعة أقسام تظهر كأزرار تحت البحث: **الألواح، البطاريات، المحولات، الغطاسات**.
ملاحظة: الأقسام محفوظة في قاعدة البيانات (جدول `categories`) وليست في الكود. إذا كانت قاعدة البيانات جديدة وفارغة بعد الاستيراد، أضفها من جديد (اطلب من Lovable إضافة هذه الأقسام الأربعة).

## 5. لوحة الإدارة / Admin
- حساب مدير واحد فقط، بريده: `mohammedqumash3@gmail.com` (في `src/lib/admin-email.ts`). التسجيل العام مغلق.
- الدخول بكلمة سر. كلمة السر **لا تُحفظ في GitHub** أبداً.
- من داخل اللوحة: تغيير كلمة السر. عند نسيانها: «نسيت كلمة السر» يرسل رابط تعيين إلى البريد أعلاه ويفتح `/reset-password`.
- الصلاحية: دور `admin` في جدول `user_roles` ويُتحقق منه على الخادم في كل عملية (`src/lib/admin-auth.ts`).
- إضافة كتالوج: رفع PDF + العنوان + الوصف + الكلمات المفتاحية + القسم + اللغة، ثم فهرسته للمساعد تلقائياً. حذف الكتالوجات.
- قاعدة: يُسمح بنسختين (عربية وإنجليزية) لنفس المنتج، والممنوع تكرار نفس المنتج بنفس اللغة.
- **إعدادات الاتصال** (`src/components/ConnectionSettings.tsx`, `src/lib/app-url.ts`): عرض الرابط الحالي، إدخال رابط جديد، «اختبار الاتصال»، «حفظ وتحديث»، «استعادة الرابط الافتراضي». الرابط الافتراضي: `https://whispering-catalog-compass.lovable.app`. يُحفظ على الجهاز نفسه، ويعمل فقط في النسخة المنشورة. التحديث يدوي بالكامل بقرار المدير — لا تحديث تلقائي.

## 6. البيانات / Data (Lovable Cloud)
- الجداول: `categories`, `catalogs`, `catalog_chunks` (مع متجهات embeddings), `catalog_profiles`, `user_roles`. مخطط الجداول في `drizzle/migrations/`.
- ملفات PDF والأغلفة في مخزن خاص اسمه `catalogs`.
- كل القراءة والكتابة عبر دوال الخادم في `src/lib/catalog.functions.ts`؛ الجداول غير مفتوحة للمتصفح مباشرة.
- **مهم:** GitHub يحفظ الكود والتصميم ومخطط الجداول فقط. **محتوى** قاعدة البيانات (الكتالوجات المرفوعة، الأقسام، حساب المدير) **لا ينتقل** مع GitHub؛ يبقى في سحابة المشروع الأصلي. عند الاستيراد لمشروع جديد يجب إعادة رفع الكتالوجات وإنشاء حساب المدير.

## 7. المساعد الذكي / Assistant
- بحث هجين: فهم السؤال بالذكاء الاصطناعي + متجهات (pgvector) + بحث تقريبي (trigram) + مطابقة رقم الموديل، مدموجة بطريقة RRF (`src/lib/rank.ts`, `src/lib/semantic.server.ts`).
- لملء المتجهات الناقصة: `scripts/index_catalogs.py chunks|profiles`.
- النماذج عبر Lovable AI Gateway (لا مفاتيح خارجية).
- الإجابات تعرض Markdown آمنًا: المقارنات في جداول بمواصفة لكل صف ومنتج لكل عمود مع خلاصة، مواصفات المنتج المتعددة في جدول، والشروحات بعناوين ونقاط والخطوات بقوائم مرقمة. الجداول قابلة للتمرير الأفقي على الهاتف، والقيمة غير المتاحة تظهر «غير مذكور» دون اختراعها. الأسئلة البسيطة تبقى مختصرة. العرض في `src/components/AssistantAnswer.tsx` ويعمل أثناء بث الإجابة أيضاً.

## 8. ما تم إزالته عمداً / Removed on purpose
- ربط تطبيق أندرويد القديم للشركة السابقة (أُزيل). يوجد الآن ربط لتطبيق رافال فقط في `public/.well-known/assetlinks.json`.
- رمز الدخول الثابت القديم — استُبدل بحساب مدير وكلمة سر.
- أي أرقام أو روابط أو بيانات محفوظة للشركة السابقة.

## 9. سجل العمل / Work log
راجع `roadmap.md` لقائمة المهام المنجزة والمتبقية.

## 10. التشغيل محلياً / Development
```sh
bun install   # أو npm i
bun run dev   # أو npm run dev
```
الاختبارات: `bunx vitest run`.

---
Built with [Lovable](https://lovable.dev). Published app: https://whispering-catalog-compass.lovable.app


## Data snapshot / نسخة البيانات
`seed/data.sql` holds all current database content (4 product sections, full admin account with its encrypted password + admin role, every catalog row and its text). The catalog PDFs and covers are copied in `seed/storage/catalogs/` with the same paths they have in the `catalogs` storage bucket (files over 10 MB are kept as `.asset.json` pointers; download the file from the pointer's `url` on the published site and upload it under the name without `.asset.json`). On a fresh import: run the migrations in `drizzle/migrations`, run `seed/data.sql`, upload `seed/storage/catalogs/*` to the `catalogs` bucket, then run `scripts/index_catalogs.py chunks` and `profiles` to rebuild the assistant's search vectors. Keep these updated whenever data changes.

Current catalogs (الألواح): SDL SKYMAX RM-685-730W-210M/132TB solar panel (N-TOPCon bifacial, 685–730W), SDL SKYMAX RM-600-630W-182R/132TB shown as 615W (600–630W range) and SDL SKYMAX RM-560-600W-182M/144TB shown as 585W (560–600W range, 144 cells). Each panel has an English original plus an Arabic copy (6 entries); the Arabic copies keep the original pages, photos, tables and values and replace the English labels with Arabic (the small legend inside the warranty chart stays in English). Each Arabic entry reuses its panel's poster cover (real panel photo) and search data. Also GCL-NT12/66GDF 695–710W (bifacial dual glass, N-type, 132 cells) as an English original only; on the owner's request it has no designed cover, so its card shows the plain file icon. Current catalogs (البطاريات): Rafal LiFePO4 51.2V 200Ah 10kWh; Rafal LiFePO4 25.6V 314Ah 8kWh. Both products have English originals and Arabic translated copies (4 catalog entries), paired by identical title and distinguished by the language badge. Arabic PDFs preserve the original product images, page size, table layout and technical values. Each Arabic entry reuses its product's poster cover and source specification search index. Their card covers are designed posters (3:4, Rafal logo, model + kWh, the real product photo cut from the PDF on a red stage), not a screenshot of the PDF page.
ملف `seed/data.sql` يحتوي كل بيانات قاعدة البيانات الحالية لاستعادتها عند الاستيراد.

## Android app / تطبيق أندرويد
Built with PWABuilder (TWA) from the published URL. Package: `app.lovable.whispering_catalog_compass.twa`, minSdk 24. `public/.well-known/assetlinks.json` holds the signing-key fingerprint. Keep the signing keystore (delivered to the owner, not in the repo) — every future update of the APK must be signed with the same key.

## Offline catalogs / الكتالوجات بدون إنترنت
Pages are loaded network-first (cache "rafal-pages") and old pre-rebrand caches are deleted on launch, so phones never show an old saved copy. Home page: only an offline banner (the owner removed the save-all button, the saved counter and the "محفوظ" card badge). Every opened catalog is still kept on the phone automatically. Catalog viewer: "حفظ على الهاتف" toggle (save/remove). PDFs are stored in the device cache (src/lib/pdf-cache.ts); the app shell, PDF reader worker and its font helpers are precached by the service worker (vite.config.ts; server bundle files must stay in globIgnores or the worker fails to install). Works only in the published/installed app, not the editor preview.
