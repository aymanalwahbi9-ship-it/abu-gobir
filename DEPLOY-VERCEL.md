# تجهيز النشر على GitHub وVercel

هذه النسخة جاهزة للرفع إلى GitHub ثم الاستيراد إلى Vercel. **الموقع العام ولوحة الإدارة للعرض فقط يعملان بدون أي Environment Variables** لأنهما ملفات HTML/CSS/JS ثابتة. الرفع والتعديل سيُفعّلان لاحقاً بعد تجهيز التخزين والحماية.

## قبل الرفع إلى GitHub

لا ترفع أي ملف `.env` أو رموز حقيقية. ارفع المشروع كما هو، وتأكد من بقاء `package-lock.json` و`vercel.json` وملف `api/[...path].js`.

## ربط Vercel — الطريقة السهلة بدون إعدادات

1. أنشئ مستودعاً جديداً على GitHub وارفع جميع ملفات هذا المجلد.
2. في Vercel اختر **Add New → Project** ثم استورد المستودع.
3. اترك Framework Preset على **Other**.
4. اترك Build Command وOutput Directory فارغين.
5. اضغط Deploy.

بهذه الخطوات يعمل الموقع العام و`/admin.html` مباشرة، ولا تحتاج إضافة أي متغيرات أو إنشاء Blob.

## لوحة الإدارة — اختيارية لاحقاً

إذا أردت لاحقاً تفعيل تسجيل الدخول وإضافة صور جديدة من لوحة الإدارة، أنشئ Vercel Blob Store ثم أضف Environment Variables في Vercel:
   - `ADMIN_CODE`: رمز إدارة قوي، لا تستخدم رمز المعاينة.
   - `SESSION_SECRET`: قيمة عشوائية طويلة، مختلفة عن رمز الإدارة.
   - `BLOB_READ_WRITE_TOKEN`: الرمز الذي يوفره Vercel Blob.
7. اضغط Deploy.

## بعد النشر

- الموقع العام: `/`
- لوحة الإدارة: `/admin.html`
- فحص API العام: `/api/projects`

سجّل الدخول من لوحة الإدارة باستخدام `ADMIN_CODE`. أضف صورة لا تتجاوز 3MB، لأن Vercel Function ترفض الملفات الأكبر من ذلك. الصور الجديدة تحفظ في Blob، وبيانات المشاريع تحفظ في `data/project-image-manifest.json` داخل Blob.

## ملاحظات أمان

لا تضع `ADMIN_CODE` أو `SESSION_SECRET` أو `BLOB_READ_WRITE_TOKEN` داخل JavaScript المتصفح أو GitHub. إذا ظهر رمز حقيقي في مستودع عام، غيّره فوراً من Vercel. استخدم نطاق HTTPS في الإنتاج؛ الكوكيز الإدارية مضبوطة على `HttpOnly; Secure; SameSite=None` للنشر على Vercel.

## التشغيل المحلي

```bash
npm ci
ADMIN_CODE='local-strong-code' SESSION_SECRET='local-long-secret' PORT=8000 node server.js
```

للمعاينة المحلية افتح `http://localhost:8000`. تشغيل لوحة الإدارة محلياً لا يحتاج Blob؛ حفظ الصور يتم داخل مجلد `assets/projects` وملف `project-image-manifest.json`.
