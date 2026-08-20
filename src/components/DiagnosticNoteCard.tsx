import React, { useState } from 'react';
import { AuditResult, AuditPayload } from '../types';
import { Edit3, Copy, Check, Sparkles, RefreshCw, FileText, CheckCircle2 } from 'lucide-react';

interface DiagnosticNoteCardProps {
  auditResult?: AuditResult;
  payload?: AuditPayload;
}

export const DiagnosticNoteCard: React.FC<DiagnosticNoteCardProps> = ({ auditResult, payload }) => {
  // Pre-fill with user default or auto-generated diagnosis
  const defaultSignal = auditResult?.layer1_diagnostic?.diagnosis_details || 
    'CTR ثابت 1.2% آخر 7 أيام، لكن LP View Rate نزل من 88% لـ 71%';

  const defaultReading = auditResult?.layer1_diagnostic?.leak_reason || 
    'مشكلة بين الكليك والصفحة، غالباً speed أو redirect أو tracking';

  const defaultNext = auditResult?.layer1_diagnostic?.action_plan_24h || 
    'نفتح Post-Click Layer وأول حاجة نشيكها هي Page Speed و Pixel Health';

  const [signalText, setSignalText] = useState<string>(defaultSignal);
  const [readingText, setReadingText] = useState<string>(defaultReading);
  const [nextText, setNextText] = useState<string>(defaultNext);

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Quick Presets
  const applyPreset = (preset: 'default_image' | 'auto_ai' | 'fatigue' | 'bridge_leak' | 'high_cpm') => {
    if (preset === 'default_image') {
      setSignalText('CTR ثابت 1.2% آخر 7 أيام، لكن LP View Rate نزل من 88% لـ 71%');
      setReadingText('مشكلة بين الكليك والصفحة، غالباً speed أو redirect أو tracking');
      setNextText('نفتح Post-Click Layer وأول حاجة نشيكها هي Page Speed و Pixel Health');
    } else if (preset === 'auto_ai' && auditResult) {
      const l1 = auditResult.layer1_diagnostic;
      setSignalText(`Outbound CTR ${l1?.outbound_ctr ?? 1.2}% مع Hook Rate ${l1?.hook_rate ?? 15}% و Hold Rate ${l1?.hold_rate ?? 5}%`);
      setReadingText(l1?.leak_reason || auditResult.diagnosis_summary || 'تسريب أداء ملحوظ يحتاج معايرة فورية.');
      setNextText(l1?.action_plan_24h || 'تحديث الزوايا الإعلانية وإيقاف الإعلانات المجهدة خلال 24 ساعة.');
    } else if (preset === 'fatigue') {
      setSignalText('Frequency ارتفع لـ 3.8 مع هبوط Hook Rate من 24% إلى 11% في آخر 3 أيام');
      setReadingText('إجهاد عالي في الجمهور والتصميم (Creative Fatigue)، المزاد يحرق ميزانية على نفس المستهدفين');
      setNextText('إيقاف الفيديو الحالي وإطلاق 3 فاريانتس Hook جديدة بنفس العرض الرابح');
    } else if (preset === 'bridge_leak') {
      setSignalText('Outbound CTR ممتاز 1.8% لكن Click-to-Message أقل من 22%');
      setReadingText('تسريب في مرحلة الجسر (Bridge Leak): بطء تحميل الواتساب أو عدم تفعيل القالب الفوري Direct Chat');
      setNextText('مراجعة رابط الواتساب وتثبيت Instant Welcome Message لرفع معدل المحادثات');
    } else if (preset === 'high_cpm') {
      setSignalText('CPM ارتفع لـ 185 ج.م واستهداف Lookalike 1% ضيق جداً');
      setReadingText('اختناق المزاد بسبب ضيق الجمهور ورسوم تنافسية عالية في الشريحة');
      setNextText('توسيع الجمهور إلى Broad Cairo & Giza ونقل الاعتماد على الفلترة بالتصميم (Creative Targeting)');
    }
  };

  const handleCopy = () => {
    const fullNote = `Signal: ${signalText}\nReading: ${readingText}\nNext: ${nextText}`;
    navigator.clipboard.writeText(fullNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-50/90 border border-slate-300 rounded-xl p-5 md:p-6 shadow-2xs space-y-4 font-sans dir-rtl text-right">
      {/* Header with Title and Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-extrabold text-slate-900 font-headline tracking-tight">
              نموذج Diagnostic Note - 3 سطور فقط
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            اكتب أو عدّل تشخيص الملاحظة التنفيذية المباشرة (Signal - Reading - Next)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold font-headline transition-all flex items-center gap-1.5 border ${
              isEditing 
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'معاينة النموذج' : 'كتابة وتعديل'}</span>
          </button>

          <button
            onClick={() => applyPreset('auto_ai')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-headline bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-all flex items-center gap-1.5"
            title="توليد تلقائي بناء على نتائج الفحص"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>توليد تلقائي</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-headline bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الملاحظة'}</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex items-center gap-2 flex-wrap text-xs font-headline pt-1">
        <span className="text-[11px] text-slate-500 font-bold">نماذج جاهزة:</span>
        <button
          onClick={() => applyPreset('default_image')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px]"
        >
          نموذج الـ LP View (النموذج القياسي)
        </button>
        <button
          onClick={() => applyPreset('fatigue')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px]"
        >
          Creative Fatigue (إجهاد الإعلان)
        </button>
        <button
          onClick={() => applyPreset('bridge_leak')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px]"
        >
          Bridge Leak (تسريب تحويل الشات)
        </button>
        <button
          onClick={() => applyPreset('high_cpm')}
          className="px-2.5 py-1 rounded bg-white border border-slate-200 hover:border-slate-400 text-slate-700 text-[11px]"
        >
          High CPM (المزاد والجمهور)
        </button>
      </div>

      {/* Main 3-Line Card Presentation matching user image strictly */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-5 shadow-2xs">
        {/* LINE 1: SIGNAL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-red-600 font-headline tracking-wide">
              Signal:
            </span>
            <span className="text-[10px] text-red-500 font-mono bg-red-50 px-2 py-0.5 rounded border border-red-100">
              الإشارة الملاحظة
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={signalText}
              onChange={(e) => setSignalText(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-sm font-medium text-slate-900 bg-red-50/20 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 font-sans outline-none leading-relaxed"
              placeholder="اكتب الإشارة هنا (مثال: CTR ثابت 1.2% آخر 7 أيام، لكن LP View Rate نزل من 88% لـ 71%)"
            />
          ) : (
            <p className="text-sm md:text-base font-medium text-slate-900 leading-relaxed font-sans pr-1">
              {signalText}
            </p>
          )}
        </div>

        <div className="border-b border-slate-100" />

        {/* LINE 2: READING */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-amber-500 font-headline tracking-wide">
              Reading:
            </span>
            <span className="text-[10px] text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              القراءة والتحليل
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={readingText}
              onChange={(e) => setReadingText(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-sm font-medium text-slate-900 bg-amber-50/20 border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-sans outline-none leading-relaxed"
              placeholder="اكتب القراءة هنا (مثال: مشكلة بين الكليك والصفحة، غالباً speed أو redirect أو tracking)"
            />
          ) : (
            <p className="text-sm md:text-base font-medium text-slate-900 leading-relaxed font-sans pr-1">
              {readingText}
            </p>
          )}
        </div>

        <div className="border-b border-slate-100" />

        {/* LINE 3: NEXT */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-emerald-600 font-headline tracking-wide">
              Next:
            </span>
            <span className="text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              الخطوة التنفيذية التالية
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={nextText}
              onChange={(e) => setNextText(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-sm font-medium text-slate-900 bg-emerald-50/20 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-sans outline-none leading-relaxed"
              placeholder="اكتب الخطوة القادمة هنا (مثال: نفتح Post-Click Layer وأول حاجة نشيكها هي Page Speed و Pixel Health)"
            />
          ) : (
            <p className="text-sm md:text-base font-medium text-slate-900 leading-relaxed font-sans pr-1">
              {nextText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
