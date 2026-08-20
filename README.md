# 3 LAYER SYSTEM

لوحة تشخيص وتوجيه حملات إعلانية مبنية بـ React وVite.

## النشر على GitHub Pages

عند رفع المشروع إلى GitHub على الفرع `main`، يقوم GitHub Actions تلقائياً ببناء نسخة static ونشرها إلى GitHub Pages.

بعد أول عملية نشر، فعّل مصدر Pages من:

`Settings` → `Pages` → `Build and deployment` → `Source: GitHub Actions`

وسيكون رابط المشاركة بالشكل التالي:

`https://<GITHUB-USERNAME>.github.io/<REPOSITORY-NAME>/`

## ملاحظة عن Gemini

نسخة GitHub Pages تعمل بالكامل في التحليل المحلي ورفع الملفات، لكنها لا تشغّل `server.ts` أو نقاط `/api` الخاصة بـ Gemini؛ GitHub Pages لا يدعم Node.js ولا الأسرار على الخادم. لتفعيل مساعد Gemini الحي، انشر الـ backend منفصلاً (مثل Render أو Railway أو Cloud Run) واربط التطبيق به عبر متغير بيئة عام لعنوان الـ API.

## التشغيل محلياً

```bash
bun install
bun run dev
```
