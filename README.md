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
- **ممنوع** إظهار أو إعادة ربط أي شيء من الشركة السابقة (أكتس / ACTES): لا شعار ولا اسم ولا كتالوجات ولا روابط ولا تطبيق أندرويد قديم.

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

## 8. ما تم إزالته عمداً / Removed on purpose
- ربط تطبيق أندرويد القديم (`assetlinks.json`) — يُضاف فقط لتطبيق جديد يقدمه المالك.
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
`seed/data.sql` holds all current database content (4 product sections + full admin account with its encrypted password + admin role). On a fresh import, run the migrations in `drizzle/migrations`, then run `seed/data.sql` (it recreates the admin account with the same password). Keep this file updated whenever data changes.
ملف `seed/data.sql` يحتوي كل بيانات قاعدة البيانات الحالية لاستعادتها عند الاستيراد.
