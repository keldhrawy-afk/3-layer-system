import React, { useState } from 'react';
import { NavTab, AuditPayload, AuditResult } from '../types';
import { 
  Home, 
  UploadCloud,
  Activity, 
  Stethoscope, 
  Workflow, 
  GitMerge, 
  Gauge, 
  ShieldAlert, 
  BookOpen, 
  Layers,
  Archive,
  Download,
  Lock,
  Clock,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  CheckSquare,
  HelpCircle,
  BrainCircuit,
  FileWarning,
  ChevronDown,
  Send
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  autoStopLightStatus?: StopLightStatus;
  autoStopLightReason?: string;
  payload: AuditPayload;
  auditResult: AuditResult;
}

export type StopLightStatus = 'RED' | 'YELLOW' | 'GREEN';

export const SidebarNav: React.FC<SidebarNavProps> = ({ 
  activeTab, 
  onSelectTab,
  autoStopLightStatus = 'GREEN',
  autoStopLightReason,
  payload,
  auditResult
}) => {
  // Stop Light Guardrail State (صفحة 32) - تلقائي بناءً على الأرقام الحقيقية
  const stopLightStatus = autoStopLightStatus;
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const platform = payload.ad_platforms[0];
  const inputs = auditResult.analysis_inputs;
  const missingMetrics = [
    !platform?.spend && 'الصرف الإعلاني (Spend)',
    !platform?.impressions && 'الظهور (Impressions)',
    !platform?.clicks && 'النقرات (Clicks)',
    !payload.backend_sheet.raw_orders && 'حجم الطلبات',
    !payload.backend_sheet.average_order_value && 'قيمة الطلب / AOV',
    payload.chat_data?.average_frt_minutes === undefined && 'سرعة أول رد FRT',
    !inputs?.creative_images.length && 'صورة أو فيديو الإعلان',
    !inputs?.has_text && 'سياق كتابي أو تفسير للداتا'
  ];
  const answerAssistant = () => {
    const question = assistantQuestion.trim();
    if (!question) return;
    const normalized = question.toLowerCase();
    const action = auditResult.action_queue?.[0]?.action || 'ارفع أو اكتب السياق المطلوب ثم شغّل Run من جديد.';
    const missing = missingMetrics.length ? `أهم النواقص الآن: ${missingMetrics.slice(0, 3).join('، ')}.` : 'لا توجد نواقص أساسية في بيانات آخر Run.';
    const response = /ناقص|محتاج|ارفع/.test(normalized) ? `${missing} ${action}`
      : /قرار|اعمل|حل|تصلح/.test(normalized) ? `قرار النظام الحالي: ${auditResult.status_reason}. الخطوة التالية: ${action}`
      : /ربح|هامش|roas|cpa/.test(normalized) ? `True CPA: ${auditResult.financial_economics?.true_cpa ?? 0} ج.م، هامش المساهمة: ${auditResult.financial_economics?.contribution_margin ?? 0} ج.م. ${missing}`
      : `من آخر Run: ${auditResult.diagnosis_summary}. ${missing}`;
    setAssistantMessages(previous => [...previous, { role: 'user', text: question }, { role: 'assistant', text: response }]);
    setAssistantQuestion('');
  };

  const primaryNavItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'لوحة التحكم الرئيسية', icon: <Home className="w-4 h-4" /> },
    { id: 'upload_files', label: 'رفع شيت Excel / صور', icon: <UploadCloud className="w-4 h-4" /> },
    { id: 'signals', label: 'Layer 1 (إشارات الداتا والبيانات)', icon: <Activity className="w-4 h-4" /> },
    { id: 'diagnosis', label: 'Layer 2 (المبيعات وشات الواتساب)', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'layer3_diagnostic', label: 'Layer 3 (العوامل الخارجية والقرارات الصارمة)', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'benchmark', label: 'معايير السوق (Market Benchmark)', icon: <Gauge className="w-4 h-4" /> },
    { id: 'guardrails', label: 'حواجز الأمان وإشارات المرور', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'decisions', label: 'مصفوفة القرارات (Decision Matrix)', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'playbooks', label: 'خطط العلاج والتوصيات', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'snapshot_vault', label: 'الأرشفة الأسبوعية والـ YoY (Vault)', icon: <Archive className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#fdfcff] border-l md:border-l-0 md:border-r border-[#e7e1f2] p-3 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto md:overflow-x-visible">
      {/* 2. Stop Lights Guardrails (لمبة أمان أعلى الشاشة الجانبية - صفحة 32) */}
      <div className="hidden md:block mb-2">
        <div 
          onClick={() => onSelectTab('guardrails')}
          className={`rounded-xl p-3 border text-right cursor-pointer transition shadow-2xs group relative overflow-hidden ${
            stopLightStatus === 'RED'
              ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200'
              : stopLightStatus === 'YELLOW'
              ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-200'
              : 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold font-headline text-slate-700 flex items-center gap-1.5">
              <span>إشارة أمان القرارات</span>
              <span className="text-[9px] font-mono text-slate-400">(ص 32)</span>
            </span>

            {/* 3 Stop Light Bulbs Container */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-full border border-slate-700 shadow-inner">
              {/* Red Bulb */}
              <div
                title="أحمر: ممنوع التعديل تماماً"
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stopLightStatus === 'RED'
                    ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e] scale-125 animate-pulse'
                    : 'bg-rose-950 opacity-40'
                }`}
              />
              {/* Yellow Bulb */}
              <div
                title="أصفر: انتظار وتجميع داتا"
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stopLightStatus === 'YELLOW'
                    ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b] scale-125 animate-pulse'
                    : 'bg-amber-950 opacity-40'
                }`}
              />
              {/* Green Bulb */}
              <div
                title="أخضر: اتحرك بثقة"
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stopLightStatus === 'GREEN'
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10b981] scale-125'
                    : 'bg-emerald-950 opacity-40'
                }`}
              />
            </div>
          </div>

          {/* Dynamic Status Text & Icon */}
          <div className="flex items-center gap-2 mb-1">
            {stopLightStatus === 'RED' && (
              <>
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertOctagon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-rose-950 font-headline">
                  أحمر (RED): ممنوع التعديل
                </span>
              </>
            )}

            {stopLightStatus === 'YELLOW' && (
              <>
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-amber-950 font-headline">
                  أصفر (YELLOW): انتظار وتجميع داتا
                </span>
              </>
            )}

            {stopLightStatus === 'GREEN' && (
              <>
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-950 font-headline">
                  أخضر (GREEN): اتحرك بثقة
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-[10px] text-slate-600 font-sans leading-tight mt-1">
            {autoStopLightReason || (
              stopLightStatus === 'RED' ? 'أول 48 ساعة من Launch جديد، أو أيام أعياد، أو بعد تعديل ميزانية كبير.'
              : stopLightStatus === 'YELLOW' ? 'حجم العينة أقل من 10 Purchases، أو الـ ROAS فيه تضارب بين المنصات.'
              : 'الـ Leak محدد بدقة، وحجم العينة كافي لاتخاذ قرارات التكبير والتدخل.'
            )}
          </p>
        </div>
      </div>

      <div className="hidden md:block mb-2 rounded-xl border border-violet-200 bg-gradient-to-b from-violet-50 to-white p-3 text-right shadow-2xs" dir="rtl">
        <button type="button" onClick={() => setAssistantOpen(open => !open)} className="flex w-full items-center justify-between gap-2 text-right">
          <span className="flex items-center gap-1.5 text-xs font-bold text-violet-950"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-600 text-white"><BrainCircuit className="h-3.5 w-3.5" /></span>AI Data Assistant</span>
          <ChevronDown className={`h-4 w-4 text-violet-700 transition ${assistantOpen ? 'rotate-180' : ''}`} />
        </button>
        {assistantOpen && <>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">يراجع آخر Run وكل مدخلات النظام ويحدد ما لا يمكن تحليله بدقة بسبب نقص الداتا.</p>
          {missingMetrics.length ? <div className="mt-2 space-y-1.5"><p className="flex items-center gap-1 text-[10px] font-bold text-amber-800"><FileWarning className="h-3.5 w-3.5" />ناقص {missingMetrics.length} مؤشرات</p>{missingMetrics.slice(0, 4).map(metric => <p key={metric} className="rounded-md bg-white px-2 py-1 text-[10px] text-slate-700">• {metric}</p>)}{missingMetrics.length > 4 && <p className="text-[10px] text-slate-500">+ {missingMetrics.length - 4} عناصر أخرى</p>}<button type="button" onClick={() => onSelectTab('upload_files')} className="mt-1 w-full rounded-md bg-violet-600 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-violet-700">أضف داتا أو توضيح</button></div> : <p className="mt-2 rounded-md bg-emerald-50 px-2 py-1.5 text-[10px] font-bold text-emerald-800">الداتا الأساسية متاحة للتحليل الحالي.</p>}
          {assistantMessages.length > 0 && <div className="mt-2 max-h-32 space-y-1 overflow-y-auto border-t border-violet-100 pt-2">{assistantMessages.map((message, index) => <p key={index} className={`rounded-md px-2 py-1 text-[10px] leading-relaxed ${message.role === 'user' ? 'mr-3 bg-violet-600 text-white' : 'bg-white text-slate-700'}`}>{message.text}</p>)}</div>}
          <div className="mt-2 flex gap-1"><input value={assistantQuestion} onChange={(event) => setAssistantQuestion(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && answerAssistant()} placeholder="اسأل عن نقص أو قرار…" className="min-w-0 flex-1 rounded-md border border-violet-200 bg-white px-2 py-1.5 text-[10px] outline-none focus:border-violet-500" /><button type="button" onClick={answerAssistant} className="rounded-md bg-violet-600 px-2 text-white hover:bg-violet-700" aria-label="إرسال"><Send className="h-3.5 w-3.5" /></button></div>
        </>}
      </div>

      <div className="text-[10px] font-bold font-mono tracking-[0.12em] text-[#8b8497] px-3 py-2 hidden md:block border-b border-[#eeeaf5] mb-1 uppercase">
        Workspace
      </div>

      {primaryNavItems.map((item) => {
        const isActive = activeTab === item.id;
        const isVault = item.id === 'snapshot_vault';

        return (
          <React.Fragment key={item.id}>
            {/* Special Section Divider & Snapshot Info Card right above Settings */}
            {item.id === 'snapshot_vault' && (
              <div className="hidden md:block my-2 pt-2 border-t border-slate-200">
                <div 
                  onClick={() => onSelectTab('snapshot_vault')}
                  className="bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-right cursor-pointer transition shadow-2xs group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Immutable Log
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      الأحد 12:00 AM
                    </span>
                  </div>

                  <span className="text-xs font-bold text-indigo-950 font-headline block group-hover:text-indigo-600 transition">
                    خزينة الأرشفة وذاكرة الـ YoY
                  </span>
                  <span className="text-[10px] text-slate-600 font-sans block mt-0.5 leading-snug">
                    حفظ دائم للأرقام الخام وتجاوز قيود Attribution ومقارنة 3 مستويات (WoW / MoM / YoY).
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-headline font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? isVault
                    ? 'bg-[#4d2bc5] text-white shadow-[0_8px_18px_rgba(109,69,255,0.2)]'
                    : 'bg-[#6d45ff] text-white shadow-[0_8px_18px_rgba(109,69,255,0.2)]'
                  : isVault
                  ? 'text-[#4d2bc5] hover:text-[#3e20ae] hover:bg-[#f0edff] border border-[#e5ddff]'
                  : 'text-[#5d5668] hover:text-[#20123a] hover:bg-[#f3f0fa] border border-transparent'
              }`}
            >
              <span className={isActive ? 'text-white' : isVault ? 'text-[#6d45ff]' : 'text-[#8b8497]'}>
                {item.icon}
              </span>
              <span className="tracking-normal">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </aside>
  );
};
