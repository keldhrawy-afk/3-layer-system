import React from 'react';
import { BrainCircuit, CheckCircle2, ShieldAlert, Target } from 'lucide-react';
import { AuditResult } from '../types';

interface PerformanceAnalyticalProps {
  layer: 1 | 2;
  auditResult: AuditResult;
}

export const PerformanceAnalytical: React.FC<PerformanceAnalyticalProps> = ({ layer, auditResult }) => {
  const l1 = auditResult.layer1_diagnostic;
  const l2 = auditResult.layer2_diagnostic;
  const isLayer1 = layer === 1;
  const status = isLayer1 ? l1?.decision_light : l2?.decision_light;
  const isHealthy = status === 'GREEN_SCALE';
  const title = isLayer1 ? 'تحليل أداء Layer 1: الإعلانات والمحتوى' : 'تحليل أداء Layer 2: الشات والمبيعات';
  const finding = isLayer1
    ? (l1?.diagnosis_details || 'لا توجد بيانات كافية عن الإعلانات للتحليل.')
    : (l2?.summary_diagnosis || 'لا توجد بيانات كافية عن الشات والمبيعات للتحليل.');
  const action = isLayer1
    ? (l1?.action_plan_24h || 'ارفع تقرير الإعلانات لتوليد توصية تنفيذية.')
    : (l2?.action_plan_24h || 'ارفع شيت الـCRM لتوليد توصية تنفيذية.');
  const evidence = isLayer1
    ? `Hook ${l1?.hook_rate ?? 0}% • Hold ${l1?.hold_rate ?? 0}% • CTR ${l1?.outbound_ctr ?? 0}% • Click→Chat ${l1?.click_to_message_rate ?? 0}%`
    : `Qualified ${(l2?.chat_kpis || []).find(k => k.id === 'kpi_qualified_rate')?.value ?? 0}% • Chat CVR ${(l2?.chat_kpis || []).find(k => k.id === 'kpi_chat_cvr')?.value ?? 0}% • ${l2?.time_decay_sla?.avg_frt_minutes ?? 0} دقيقة FRT`;

  return (
    <section className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50 via-white to-indigo-50 p-4 md:p-5 shadow-2xs" dir="rtl">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-violet-100 pb-3">
        <div className="flex items-center gap-2.5"><span className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center"><BrainCircuit className="w-4 h-4" /></span><div><p className="text-[10px] font-bold tracking-wide text-violet-700">PERFORMANCE ANALYTICAL</p><h2 className="text-sm font-black font-headline text-slate-900">{title}</h2></div></div>
        <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${isHealthy ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>{isHealthy ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}{isHealthy ? 'جاهز للتوسيع بحذر' : 'تدخل مطلوب قبل التوسيع'}</span>
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-3 pt-3 text-xs leading-relaxed">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-3"><span className="block mb-1 font-bold text-slate-900">الاستنتاج الخبير</span><p className="text-slate-700">{finding}</p><p className="mt-2 text-[10px] font-mono text-violet-700">{evidence}</p></div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3"><div className="flex items-center gap-1.5 text-violet-900 font-bold mb-1"><Target className="w-3.5 h-3.5" />قرار الـ24 ساعة</div><p className="text-slate-700">{action}</p></div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">التحليل يعمل محلياً من أرقام الـaudit الحالية؛ لا يتظاهر باتصال AI خارجي غير مُشغّل.</p>
    </section>
  );
};
