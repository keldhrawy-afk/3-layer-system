import React, { useState } from 'react';
import { BrainCircuit, CheckCircle2, ShieldAlert, Target, Send, MessageCircle } from 'lucide-react';
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
  const dataContextNote = auditResult.data_context_note?.trim();
  const systemMemoryNotes = auditResult.system_memory_notes || [];
  const rememberedContext = systemMemoryNotes.length > 0 ? `\n\nسياق محفوظ يجب أخذه في الاعتبار:\n${systemMemoryNotes.map(note => `• ${note}`).join('\n')}` : '';
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'analyst'; text: string }>>([
    { role: 'analyst', text: `أنا محلل ${isLayer1 ? 'الإعلانات والمحتوى' : 'الشات والمبيعات'}. اسألني عن سبب المشكلة أو القرار التالي، وسأجيب من أرقام هذه الطبقة.` }
  ]);

  const replyToQuestion = (input: string) => {
    const text = input.toLowerCase();
    if (isLayer1 && /هوك|hook|مشاهدة|فيديو/.test(text)) return `الـHook الحالي ${l1?.hook_rate ?? 0}%. ${l1?.hook_rate && l1.hook_rate < 15 ? 'ده أقل من الحد الآمن؛ غيّر أول 2–3 ثوانٍ فقط واختبر نسخة واحدة مقابل الأصل.' : 'الهوك في نطاق مقبول؛ لا تغيّره قبل فحص الـHold والـCTR.'}${rememberedContext}`;
    if (isLayer1 && /عرض|cta|نقرة|ctr|رسالة/.test(text)) return `إشارة العرض والـCTA: Outbound CTR ${l1?.outbound_ctr ?? 0}% وClick→Chat ${l1?.click_to_message_rate ?? 0}%. ${action}${rememberedContext}`;
    if (!isLayer1 && /رد|frt|سرعة/.test(text)) return `متوسط أول رد ${l2?.time_decay_sla?.avg_frt_minutes ?? 0} دقيقة. ${l2?.time_decay_sla && l2.time_decay_sla.avg_frt_minutes > 5 ? 'الأولوية: SLA أقل من 5 دقائق قبل تعديل أي إعلان.' : 'سرعة الرد مقبولة؛ انتقل لفحص السكريبت والتأهيل.'}${rememberedContext}`;
    if (!isLayer1 && /سعر|اعتراض|offer|عرض/.test(text)) return `أكبر اعتراض مسجل: ${l2?.objection_breakdown?.[0]?.label_ar ?? 'لا توجد بيانات اعتراضات كافية'}. القرار: ${l2?.objection_breakdown?.[0]?.executive_action ?? action}${rememberedContext}`;
    return `${finding}\n\nقرار الـ24 ساعة: ${action}${rememberedContext}`;
  };

  const sendQuestion = () => {
    const trimmed = question.trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, { role: 'user', text: trimmed }, { role: 'analyst', text: replyToQuestion(trimmed) }]);
    setQuestion('');
  };

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
      {dataContextNote && (
        <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50/70 p-3 text-xs leading-relaxed text-slate-700">
          <span className="block text-[10px] font-bold text-violet-800">ملحوظة البيانات المرفقة</span>
          <p className="mt-1 whitespace-pre-line">{dataContextNote}</p>
        </div>
      )}
      {systemMemoryNotes.length > 0 && (
        <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs leading-relaxed text-slate-700">
          <span className="block text-[10px] font-bold text-indigo-800">ذاكرة النظام المستخدمة في التحليل</span>
          <ul className="mt-1 list-inside list-disc space-y-0.5">{systemMemoryNotes.map((note, index) => <li key={`${note}-${index}`}>{note}</li>)}</ul>
        </div>
      )}
      <div className="mt-3 rounded-xl border border-slate-200 bg-white/85 overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-2 text-[11px] font-bold text-slate-800"><MessageCircle className="w-3.5 h-3.5 text-violet-600" />ناقش التحليل</div>
        <div className="max-h-52 overflow-y-auto space-y-2 p-3">
          {messages.map((message, index) => <div key={index} className={`max-w-[92%] rounded-xl px-3 py-2 text-[11px] leading-relaxed whitespace-pre-line ${message.role === 'user' ? 'mr-auto bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'}`}>{message.text}</div>)}
        </div>
        <div className="flex gap-2 border-t border-slate-100 p-2">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendQuestion()} placeholder={isLayer1 ? 'اسأل عن الـHook أو العرض أو الـCTA…' : 'اسأل عن الردود أو الاعتراضات أو الإغلاق…'} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 outline-none focus:border-violet-500" />
          <button type="button" onClick={sendQuestion} className="rounded-lg bg-violet-600 px-3 text-white transition hover:bg-violet-700" aria-label="إرسال السؤال"><Send className="w-4 h-4" /></button>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500">شات تحليلي محلي يعتمد على أرقام الـaudit الحالية؛ لا يتظاهر باتصال AI خارجي غير مُشغّل.</p>
    </section>
  );
};
