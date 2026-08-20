import React, { useState } from 'react';
import { AuditPayload, AuditResult } from '../types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  PauseCircle, 
  CheckCircle, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Sliders, 
  Zap, 
  Lock, 
  Unlock, 
  Flame, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface GuardrailsTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export type ActiveLight = 'RED' | 'YELLOW' | 'GREEN' | 'AUTO';

export const GuardrailsTab: React.FC<GuardrailsTabProps> = ({ payload, auditResult }) => {
  const { ad_platforms } = payload;
  let minAge = 999;
  let maxJump = 0;

  ad_platforms?.forEach((p) => {
    if (p.campaign_age_hours !== undefined) minAge = Math.min(minAge, p.campaign_age_hours);
    if (p.budget_scaled_24h_pct !== undefined) maxJump = Math.max(maxJump, p.budget_scaled_24h_pct);
  });

  if (minAge === 999) minAge = 72;

  // Real-time checks
  const confirmedOrders = payload.backend_sheet?.confirmed_orders || 0;
  const isFirst48Hours = minAge < 48;
  const isBigBudgetJump = maxJump > 30;
  const isHolidayOrAbnormalDay = payload.layer3_external?.is_holiday_or_crisis || false;
  const isLowSampleSize = confirmedOrders < 10;
  const roasDiscrepancy = Math.abs((ad_platforms?.[0]?.roas || 3.0) - (auditResult?.financial_economics?.true_roas || 2.99)) > 0.8;
  const isLosingMoney = (auditResult?.financial_economics?.contribution_margin ?? 0) < 0;

  // Auto-calculated light based on numbers
  let calculatedLight: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
  let primaryReason = 'الـ Leak محدد والداتا كافية ومستقرة، ومؤشرات الربحية إيجابية. يمكنك اتخاذ قرارات التكبير أو التعديل بأمان.';

  if (isFirst48Hours || isBigBudgetJump || isHolidayOrAbnormalDay || isLosingMoney) {
    calculatedLight = 'RED';
    if (isFirst48Hours) {
      primaryReason = `الحملة في أول ${minAge} ساعة من الإطلاق (Launch Learning Phase) - ممنوع التعديل تماماً لحماية خوارزمية التعلم.`;
    } else if (isBigBudgetJump) {
      primaryReason = `تم رفع الميزانية بنسبة كبيرة (+${maxJump}%) خلال آخر 24 ساعة - ممنوع أي تعديل إضافي لتثبيت المزاد 48-72 ساعة.`;
    } else if (isLosingMoney) {
      primaryReason = `هامش المساهمة بالسالب (${auditResult?.financial_economics?.contribution_margin ?? 0} ج.م) - تفعيل قاطع التجميد الفوري لحماية رأس المال.`;
    } else {
      primaryReason = 'يوم عطلة رسمية أو مناسبة استثنائية (Holiday Distortion) - ممنوع الحكم على أداء اليوم أو تعديل الحملات.';
    }
  } else if (isLowSampleSize || roasDiscrepancy) {
    calculatedLight = 'YELLOW';
    if (isLowSampleSize) {
      primaryReason = `حجم العينة صغير جداً (${confirmedOrders} طلبات مؤكدة < 10) - يُنصح بالانتظار وتجميع داتا قبل أي قرار.`;
    } else {
      primaryReason = 'يوجد تضارب واضح بين ROAS المنصة الإعلانية و ROAS شيت الـ CRM الفعلي - يجب تجميع داتا إضافية لتطابق الإسناد.';
    }
  }

  // Interactive User Light Override
  const [selectedLight, setSelectedLight] = useState<ActiveLight>('AUTO');
  const activeLight = selectedLight === 'AUTO' ? calculatedLight : selectedLight;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header & Main Stop Light Terminal - Balanced Slate Theme */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                صفحة 32 من الدليل الإرشادي
              </span>
              <span className="text-xs text-slate-400 font-mono">• Stop Lights Guardrails System</span>
            </div>
            
            <h1 className="text-lg md:text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600" />
              <span>نظام حواجز الأمان وإشارات المرور (Stop Lights Guardrails)</span>
            </h1>

            <p className="text-xs text-slate-600 font-sans max-w-3xl leading-relaxed">
              صمام الأمان لحماية الحساب من القرارات العشوائية والتسرع. يتحول النظام تلقائياً بناءً على الأرقام الحقيقية ليحدد هل الحساب مؤهل لأي قرار تعديل أو تكبير (Scale)، أم يجب التجميد أو الانتظار.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 shrink-0">
            <div className="text-[11px] font-bold font-headline text-slate-500 px-1">
              الوضع:
            </div>
            
            <button
              type="button"
              onClick={() => setSelectedLight('AUTO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                selectedLight === 'AUTO'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${selectedLight === 'AUTO' ? 'animate-spin' : ''}`} />
              <span>تلقائي بالأرقام (Live)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedLight('RED')}
              className={`px-2.5 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                activeLight === 'RED' && selectedLight !== 'AUTO'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              أحمر
            </button>

            <button
              type="button"
              onClick={() => setSelectedLight('YELLOW')}
              className={`px-2.5 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                activeLight === 'YELLOW' && selectedLight !== 'AUTO'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              أصفر
            </button>

            <button
              type="button"
              onClick={() => setSelectedLight('GREEN')}
              className={`px-2.5 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                activeLight === 'GREEN' && selectedLight !== 'AUTO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              أخضر
            </button>
          </div>
        </div>

        {/* Current Active Signal Banner */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          activeLight === 'RED'
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : activeLight === 'YELLOW'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-start md:items-center gap-3">
            {activeLight === 'RED' && (
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertOctagon className="w-5 h-5" />
              </div>
            )}
            {activeLight === 'YELLOW' && (
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
            {activeLight === 'GREEN' && (
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold font-headline">
                  {activeLight === 'RED' && 'إشارة حمراء (RED) — ممنوع التعديل تماماً (Freeze Mode)'}
                  {activeLight === 'YELLOW' && 'إشارة صفراء (YELLOW) — انتظار وتجميع داتا (Hold & Gather)'}
                  {activeLight === 'GREEN' && 'إشارة خضراء (GREEN) — اتحرك بثقة (Execute & Scale)'}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  activeLight === 'RED'
                    ? 'bg-rose-100/80 border-rose-300 text-rose-800'
                    : activeLight === 'YELLOW'
                    ? 'bg-amber-100/80 border-amber-300 text-amber-800'
                    : 'bg-emerald-100/80 border-emerald-300 text-emerald-800'
                }`}>
                  {selectedLight === 'AUTO' ? 'تشخيص تلقائي لحظي بالأرقام' : 'معاينة يدوية'}
                </span>
              </div>
              <p className={`text-xs mt-1 font-sans leading-relaxed ${
                activeLight === 'RED' ? 'text-rose-800' : activeLight === 'YELLOW' ? 'text-amber-800' : 'text-emerald-800'
              }`}>
                {primaryReason}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <span className={`text-xs font-bold font-mono px-3 py-1.5 rounded-lg border shadow-2xs ${
              activeLight === 'RED'
                ? 'bg-white border-rose-300 text-rose-700'
                : activeLight === 'YELLOW'
                ? 'bg-white border-amber-300 text-amber-800'
                : 'bg-white border-emerald-300 text-emerald-700'
            }`}>
              {activeLight === 'RED' && 'تجميد فوري 🛑'}
              {activeLight === 'YELLOW' && 'ممنوع رفع الميزانية ⏳'}
              {activeLight === 'GREEN' && 'جاهز للتكبير والتنفيذ 🚀'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Main Pillars of Stop Lights (صفحة 32) - Clean Cohesive Card Palette */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: RED LIGHT */}
        <div className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
          activeLight === 'RED' 
            ? 'border-rose-300 ring-2 ring-rose-100 shadow-sm' 
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs">
                🔴
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-headline">أحمر (RED)</h3>
                <span className="text-[10px] text-rose-600 font-bold font-mono">ممنوع التعديل تماماً</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
              activeLight === 'RED' 
                ? 'bg-rose-50 border-rose-200 text-rose-700' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {activeLight === 'RED' ? 'الحالة الحالية' : 'غير نشط'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            يُمنع اتخاذ أي قرار أو تعديل على الحملات إطلاقاً في الحالات التالية:
          </p>

          <ul className="space-y-2 text-xs font-sans">
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">1. أول 48 ساعة من Launch جديد</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  الحملة في مرحلة التعلم (Learning Phase). أي تعديل يعيد تصفير الخوارزمية وتشتيتها.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Calendar className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">2. أيام أعياد ومناسبات استثنائية</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  سلوك المستهلك مشوه ومؤقت. القرارات المتخذة أثناء الأعياد تكون مضللة.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">3. بعد تعديل ميزانية كبير (&gt;30%)</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  الحساب يحتاج 48-72 ساعة ليستقر المزاد الإعلاني بعد أي رفع ميزانية مفاجئ.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Card 2: YELLOW LIGHT */}
        <div className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
          activeLight === 'YELLOW' 
            ? 'border-amber-300 ring-2 ring-amber-100 shadow-sm' 
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold text-xs">
                🟡
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-headline">أصفر (YELLOW)</h3>
                <span className="text-[10px] text-amber-700 font-bold font-mono">انتظار وتجميع داتا</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
              activeLight === 'YELLOW' 
                ? 'bg-amber-50 border-amber-200 text-amber-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {activeLight === 'YELLOW' ? 'الحالة الحالية' : 'غير نشط'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            الحساب ليس في خطر داهم، لكن البيانات غير كافية إحصائياً للبت في قرار مصيري:
          </p>

          <ul className="space-y-2 text-xs font-sans">
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">1. حجم العينة أقل من 10 Purchases</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  لا يجوز إيقاف إعلان أو مضاعفة ميزانية بناءً على 2 أو 3 طلبات فقط. العينة غير ممثلة.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">2. تضارب الـ ROAS بين المنصات و CRM</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  لو المنصة مسجلة ROAS 4x لكن شيت الطلبات مسجل 1.8x، انتظر حتى تتطابق سجلات التأكيد والتسليم.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Search className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">3. التذبذب اليومي اللحظي</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  مراقبة الأداء لمدة 24-48 ساعة إضافية لحين اكتمال الـ Attribution Window للطلبات.
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Card 3: GREEN LIGHT */}
        <div className={`bg-white border rounded-2xl p-5 shadow-2xs space-y-4 transition-all ${
          activeLight === 'GREEN' 
            ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-sm' 
            : 'border-slate-200'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold text-xs">
                🟢
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 font-headline">أخضر (GREEN)</h3>
                <span className="text-[10px] text-emerald-700 font-bold font-mono">اتحرك بثقة</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
              activeLight === 'GREEN' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              {activeLight === 'GREEN' ? 'الحالة الحالية' : 'غير نشط'}
            </span>
          </div>

          <p className="text-xs text-slate-600 font-sans leading-relaxed">
            الشروط مستوفاة بالكامل، والداتا واضحة وجاهزة للتنفيذ الفوري:
          </p>

          <ul className="space-y-2 text-xs font-sans">
            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">1. الـ Funnel Leak محدد بدقة</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  تم معرفة مكان التسريب (إعلانات، أو شات، أو تأكيد، أو شحن) وتحديد خطة التدخل.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">2. الداتا كافية ومكتملة إحصائياً</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  أكثر من 10 تأكيدات فعلية وعمر الحملة تجاوز 48 ساعة دون أي تعديلات مفاجئة.
                </span>
              </div>
            </li>

            <li className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">3. الضوء الأخضر للتكبير (Scaling Ready)</strong>
                <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                  هامش المساهمة (Contribution Margin) إيجابي والـ True CPA تحت الحد الأقصى المسموح.
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Live Technical Audit of Account Rules - Matched Matrix Palette */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold font-headline text-slate-900">
              جدول التحقق اللحظي لحواجز الأمان (Live Guardrails Check Matrix)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            فحص أوتوماتيكي لقيم الـ Payload الحالية
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Rule 1: Launch Age */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${minAge >= 48 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold font-headline text-slate-900">
                  حماية فترة تعلم الخوارزمية (48 ساعة Launch Freeze)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                أقل عمر للحملات المسجلة حالياً: <strong className="font-mono text-slate-800">{minAge} ساعة</strong>. {minAge >= 48 ? 'تجاوزت فترة التعلم بنجاح.' : 'ما زالت في فترة التعلم المحظورة.'}
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
              minAge >= 48 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {minAge >= 48 ? 'آمن (Passed)' : 'تجميد (Red Light)'}
            </span>
          </div>

          {/* Rule 2: Budget Jump Jump */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${maxJump <= 30 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold font-headline text-slate-900">
                  حاجز قفزة الميزانية اليومية (&le; 30% Max Jump)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                أعلى نسبة رفع ميزانية في 24 ساعة: <strong className="font-mono text-slate-800">+{maxJump}%</strong>. {maxJump <= 30 ? 'ضمن النطاق الآمن لثبات المزاد.' : 'قفزة مفرطة قد تسبب حرق الميزانية.'}
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
              maxJump <= 30 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {maxJump <= 30 ? 'آمن (Passed)' : 'تجاوز (Red Light)'}
            </span>
          </div>

          {/* Rule 3: Sample Size */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${confirmedOrders >= 10 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold font-headline text-slate-900">
                  حجم عينة الطلبات المؤكدة (&ge; 10 Purchases)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                عدد الطلبات المؤكدة في الشيت: <strong className="font-mono text-slate-800">{confirmedOrders} طلب</strong>. {confirmedOrders >= 10 ? 'عينة إحصائية كافية لاتخاذ القرارات.' : 'عينة صغيرة تتطلب الانتظار وتجميع داتا.'}
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
              confirmedOrders >= 10 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {confirmedOrders >= 10 ? 'كافي (Green)' : 'انتظار (Yellow)'}
            </span>
          </div>

          {/* Rule 4: Contribution Margin */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${(auditResult?.financial_economics?.contribution_margin ?? 0) >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold font-headline text-slate-900">
                  قاطع الأمان المالي لهامش الربح (Contribution Margin &gt; 0)
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-sans">
                هامش الربح الصافي للقطعة: <strong className="font-mono text-slate-800">{auditResult?.financial_economics?.contribution_margin ?? 0} ج.م</strong>. {(auditResult?.financial_economics?.contribution_margin ?? 0) >= 0 ? 'الحملات تحقق فائض ربحي حقيقي.' : 'خسارة مالية مباشرة - تفعيل قاطع الطوارئ.'}
              </p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
              (auditResult?.financial_economics?.contribution_margin ?? 0) >= 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {(auditResult?.financial_economics?.contribution_margin ?? 0) >= 0 ? 'رابح (Green)' : 'خسارة (Red Light)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
