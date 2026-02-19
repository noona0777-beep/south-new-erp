# البنية التقنية والتوزيع (Technical Architecture & Deployment)

## 1. التكنولوجيا المستخدمة (Tech Stack)

### Backend (الخادم)

- **Node.js + Express:** هيكل خفيف وقوي لبناء API.
- **Prisma (ORM):** للتعامل مع قاعدة البيانات بطريقة حديثة وآمنة.
- **JWT (Auth):** للمصادقة وتأمين الجلسات (Stateless).

### Frontend (الواجهة)

- **React.js (Vite):** لبناء Single Page Application (SPA).
- **Tailwind CSS:** لتصميم واجهات عصرية ومتجاوبة.
- **Axios:** للتعامل مع الـ API.
- **Redux Toolkit:** لإدارة حالة النظام (Global State Management) - مهم لنظام كبير مثل SMACC.

### Desktop (سطح المكتب)

- **Electron:** لتغليف تطبيق الويب وجعله برنامجاً مثبتاً (Installable).
- **Offline Setup:** (اختياري) تخزين النسخة المحلية باستخدام IndexedDB ومزامنتها لاحقاً.

### Database (قاعدة البيانات)

- **PostgreSQL:** قاعدة بيانات علاقية قوية وموثوقة (ACID Compliant).

## 2. استراتيجية الاستضافة المجانية (Free Hosting Strategy)

### أ. قاعدة البيانات (Database)

- **المنصة:** Supabase (مجانية بسعة 500MB).
- **الاتصال:** عبر `DATABASE_URL` في إعدادات البيئة (Backend).

### ب. الخادم (API Server)

- **المنصة:** Render (خطة مجانية تتوقف عند عدم الاستخدام "Spin Down").
- **البديل:** Railway (خطة Trial) أو Glitch.
- **Deployment:** ربط مستودع GitHub بـ Render لعمل Deploy تلقائي عند كل `push`.

### ج. الواجهة (Frontend Client)

- **المنصة:** Vercel (الأسرع والأفضل لـ React).
- **Deployment:** ربط مستودع GitHub بـ Vercel.

## 3. التكامل مع ZATCA (E-Invoicing Integration)

- **التوقيع الرقمي:** استخدام مكتبات تشفير (`crypto`, `xml-crypto`) في الخادم.
- **QR Code Generation:** استخدام `qrcode.react` في الواجهة، وتشفير البيانات بصيغة TLV Base64 في الخادم.
- **API Integration:** ربط الخادم بـ API هيئة الزكاة (Sandbox/Production).

## 4. خطة الأمان (Security Plan)

- **HTTPS Only:** مفعل تلقائياً في Vercel/Render.
- **CORS:** تحديد النطاقات المسموح لها بالوصول للـ API.
- **Rate Limiting:** منع الهجمات المتكررة على الخادم.
- **Environment Variables:** تخزين الأسرار (`DATABASE_URL`, `JWT_SECRET`) في إعدادات الاستضافة.

## 5. هيكلية الملفات (Project Structure)

الهدف هو (Monorepo-like) ولكن مجلدات منفصلة لسهولة الفصل في الاستضافة:

/root
  /client (React App -> Deploy to Vercel)
  /server (Express App -> Deploy to Render)
  /electron (Desktop Wrapper -> Build Locally)
  /docs (Documentation)
  README.md
