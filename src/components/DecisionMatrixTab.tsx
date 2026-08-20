import React, { useState } from 'react';
import { AuditPayload, AuditResult } from '../types';
import { 
  CheckSquare, 
  ArrowUpRight, 
  AlertOctagon, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  PlayCircle, 
  RefreshCw, 
  MessageSquare, 
  Layers, 
  Send, 
  Sliders, 
  ChevronRight, 
  Sparkles, 
  Check, 
  ExternalLink,
  Target,
  Flame,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Award
} from 'lucide-react';

interface DecisionMatrixTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export type DecisionType = 'SCALE' | 'HOLD_FIX_OPS' | 'KILL' | 'FATIGUE_REPLACE' | 'RESTRUCTURE';
export type ConfidenceTier = 'HIGH_GREEN' | 'MEDIUM_YELLOW' | 'CRITICAL_RED';

export interface DecisionRow {
  id: string;
  target_name: string;
  target_type: 'CAMPAIGN' | 'ADSET' | 'CREATIVE';
  target_id_code: string;
  synthesis_diagnosis: string;
  layers_analyzed: string[];
  confidence_score: number; // e.g. 94
  confidence_tier: ConfidenceTier;
  guardrail_note: string;
  required_action_title: string;
  required_action_detail: string;
  decision_type: DecisionType;
  financial_impact_highlight: string;
  financial_impact_type: 'PROFIT_INCREASE' | 'WASTE_PREVENTION' | 'REVENUE_RECOVERY';
  financial_amount_egp?: number;
  action_button_label: string;
  action_api_target: 'META_API' | 'SALES_ALERT' | 'STOP_NOW' | 'VAULT_PICKER';
  executed?: boolean;
  executed_at?: string;
}

export const DecisionMatrixTab: React.FC<DecisionMatrixTabProps> = ({ payload, auditResult }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [executedActions, setExecutedActions] = useState<Record<string, { time: string; msg: string }>>({});
  const [isExecutingId, setIsExecutingId] = useState<string | null>(null);
  const [bulkExecuted, setBulkExecuted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const initialDecisions: DecisionRow[] = [
    {
      id: 'dec-1',
      target_name: 'حملة Campaign_Serum_Glow_CBO',
      target_type: 'CAMPAIGN',
      target_id_code: 'CMP-7829',
      synthesis_diagnosis: 'الـ Blended CPA ممتاز (220 ج.م)، والـ Contribution Margin متصاعد للأسبوع الثاني على التوالي، ونسبة التأكيدات تتجاوز 72% في الداتا الحقيقية.',
      layers_analyzed: ['Layer 1 (Meta)', 'Layer 2 (WhatsApp)', 'Layer 3 (CRM/Shipment)', 'Benchmarks'],
      confidence_score: 94,
      confidence_tier: 'HIGH_GREEN',
      guardrail_note: 'حاجز الأمان الأخضر: استقرار لأكثر من 48 ساعة دون قفزات مفاجئة في الـ CPM.',
      required_action_title: 'Scale (+20% Budget)',
      required_action_detail: 'ارفع الميزانية اليومية من 2,000 ج.م إلى 2,400 ج.م تدريجياً لتفادي خروج الخوارزمية من طور الاستقرار.',
      decision_type: 'SCALE',
      financial_impact_highlight: '+18% زيادة في الأوردرات المؤكدة الأسبوع القادم بدون ضرب الـ CPA (+12,500 ج.م أرباح صافية)',
      financial_impact_type: 'PROFIT_INCREASE',
      financial_amount_egp: 12500,
      action_button_label: 'تطبيق الزيادة فوراً على Meta API',
      action_api_target: 'META_API'
    },
    {
      id: 'dec-2',
      target_name: 'إعلان Ad_Acne_Cream_Video2',
      target_type: 'CREATIVE',
      target_id_code: 'CR-02-ACNE',
      synthesis_diagnosis: 'الـ CTR ممتاز (3.2%) وسعر الرسالة 8 ج.م، لكن زمن الرد الأول (FRT) تجاوز 25 دقيقة ومعدل تحويل الواتساب هبط لـ 6.1% فقط.',
      layers_analyzed: ['Layer 1 (Media)', 'Layer 2 (Sales & Chat)', 'Benchmarks'],
      confidence_score: 88,
      confidence_tier: 'MEDIUM_YELLOW',
      guardrail_note: 'حاجز أمان أصفر (Off-Meta Bottleneck): الخلل في خدمة العملاء ومتابعة الشات وليس في ميتا.',
      required_action_title: 'HOLD / Fix Sales & Script',
      required_action_detail: 'لا تلمس الإعلان على ميتا، ووجه فريق المبيعات فوراً بتطبيق سكريبت الـ Follow-up واستخدام الـ Voice Notes وتقليص الرد إلى أقل من 5 دقائق.',
      decision_type: 'HOLD_FIX_OPS',
      financial_impact_highlight: 'حماية ميزانية الإعلان من الهدر واستعادة 15 أوردر ضائع يومياً (+6,750 ج.م إيراد مسترد)',
      financial_impact_type: 'REVENUE_RECOVERY',
      financial_amount_egp: 6750,
      action_button_label: 'إرسال تنبيه عاجل لمدير المبيعات',
      action_api_target: 'SALES_ALERT'
    },
    {
      id: 'dec-3',
      target_name: 'أدسيت AdSet_Broad_HairOil',
      target_type: 'ADSET',
      target_id_code: 'ADS-4091',
      synthesis_diagnosis: 'تجاوز صرف 4 أضعاف سعر الرسالة المستهدف، وتكلفة الطلب المؤكد (Cost Per Confirmed Order) بلغت 850 ج.م متجاوزة الحد الحرج بكثير.',
      layers_analyzed: ['Layer 1 (Ad Spend)', 'Layer 2 (CRM Confirmations)', 'Layer 3 (Unit Economics)'],
      confidence_score: 99,
      confidence_tier: 'CRITICAL_RED',
      guardrail_note: 'حاجز أمان أحمر (Stop Loss Breached): استنزاف مستمر للسيولة دون عائد يعوض تكلفة المنتج والشحن.',
      required_action_title: 'KILL - إيقاف فوري',
      required_action_detail: 'إيقاف مجموعة الإعلانات (Ad Set) فوراً وإعادة توجيه ميزانيتها نحو الزاوية الإعلانية الرابحة.',
      decision_type: 'KILL',
      financial_impact_highlight: 'توفير هدر يومي مباشر بقيمة 1,200 ج.م (توفير شهري 36,000 ج.م في السيولة)',
      financial_impact_type: 'WASTE_PREVENTION',
      financial_amount_egp: 36000,
      action_button_label: 'إيقاف الأدسيت الآن على المنصة',
      action_api_target: 'STOP_NOW'
    },
    {
      id: 'dec-4',
      target_name: 'إعلان Ad_Sunscreen_Offer1',
      target_type: 'CREATIVE',
      target_id_code: 'CR-04-SUN',
      synthesis_diagnosis: 'التكرار (Frequency) وصل 3.82، ومعدل النقر CTR نزل من 2.8% إلى 1.1% على مدار آخر 72 ساعة، مع ارتفاع كلفة الرسالة 60%.',
      layers_analyzed: ['Layer 1 (Frequency & CTR)', 'Layer 3 (Audience Saturation)'],
      confidence_score: 90,
      confidence_tier: 'MEDIUM_YELLOW',
      guardrail_note: 'حاجز أمان أصفر (Creative Fatigue): تشبع الشريحة المستهدفة وتآكل جاذبية الهوك الأول.',
      required_action_title: 'Replace Creative (New Angle)',
      required_action_detail: 'الإعلان بيحضر وينهار تدريجياً؛ قم بتشغيل إعلان جديد بنفس العرض المالي لكن بزاوية تسويقية مختلفة (مثل زاوية ترشيح الدكاترة أو الـ Before/After).',
      decision_type: 'FATIGUE_REPLACE',
      financial_impact_highlight: 'منع ارتفاع الـ CPA المتوقع بنسبة +45% خلال الـ 48 ساعة القادمة',
      financial_impact_type: 'WASTE_PREVENTION',
      financial_amount_egp: 4500,
      action_button_label: 'اختيار زاوية إعلانية جديدة من الـ Vault',
      action_api_target: 'VAULT_PICKER'
    },
    {
      id: 'dec-5',
      target_name: 'كريتيف د. نورهان استشاري الجلدية (Doctor Endorsement)',
      target_type: 'CREATIVE',
      target_id_code: 'CR-01-DOC',
      synthesis_diagnosis: 'الزاوية الرابحة الأولى: حققت CVR بنسبة 15.0%، و Blended CPA منخفض جداً (163 ج.م) مع 87 طلب مؤكد وحجم تفاعل ممتاز.',
      layers_analyzed: ['Layer 1 (Angle Matrix)', 'Layer 2 (Closed Deals)', 'Layer 3 (Profitability)'],
      confidence_score: 96,
      confidence_tier: 'HIGH_GREEN',
      guardrail_note: 'حاجز أمان أخضر: كفاءة مثالية عبر كافة طبقات الفحص.',
      required_action_title: 'Horizontal Scaling & Duplication',
      required_action_detail: 'تكرار الكريتيف في حملة استهداف عام Broad جديدة وزيادة ضخ الإنتاج لفيديوهات مماثلة من نفس الزاوية.',
      decision_type: 'SCALE',
      financial_impact_highlight: '+25% توسع في الحصة السوقية وتحقيق 40 أوردر إضافي أسبوعياً (+18,000 ج.م إيراد صافي)',
      financial_impact_type: 'PROFIT_INCREASE',
      financial_amount_egp: 18000,
      action_button_label: 'تدشين نسخة التكبير الموسع (Broad Scale)',
      action_api_target: 'META_API'
    }
  ];

  const handleExecute = (id: string, label: string) => {
    setIsExecutingId(id);
    setTimeout(() => {
      const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setExecutedActions(prev => ({
        ...prev,
        [id]: { time: now, msg: `تم التنفيذ بنجاح (${now})` }
      }));
      setIsExecutingId(null);
      setToastMessage(`تم بنجاح: ${label}`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 800);
  };

  const handleBulkExecuteAll = () => {
    setIsExecutingId('ALL');
    setTimeout(() => {
      const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const nextMap: Record<string, { time: string; msg: string }> = {};
      initialDecisions.forEach(d => {
        nextMap[d.id] = { time: now, msg: `تم التنفيذ بنجاح (${now})` };
      });
      setExecutedActions(nextMap);
      setBulkExecuted(true);
      setIsExecutingId(null);
      setToastMessage('تم تطبيق جميع القرارات والحواجز تلقائياً عبر واجهات الربط!');
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const filteredDecisions = initialDecisions.filter(d => {
    if (filterType === 'SCALE' && d.decision_type !== 'SCALE') return false;
    if (filterType === 'HOLD_FIX_OPS' && d.decision_type !== 'HOLD_FIX_OPS') return false;
    if (filterType === 'KILL' && d.decision_type !== 'KILL') return false;
    if (filterType === 'FATIGUE_REPLACE' && d.decision_type !== 'FATIGUE_REPLACE') return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        d.target_name.toLowerCase().includes(q) ||
        d.synthesis_diagnosis.toLowerCase().includes(q) ||
        d.required_action_title.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSavedWaste = initialDecisions
    .filter(d => d.financial_impact_type === 'WASTE_PREVENTION')
    .reduce((acc, curr) => acc + (curr.financial_amount_egp || 0), 0);

  const totalAddedProfit = initialDecisions
    .filter(d => d.financial_impact_type === 'PROFIT_INCREASE' || d.financial_impact_type === 'REVENUE_RECOVERY')
    .reduce((acc, curr) => acc + (curr.financial_amount_egp || 0), 0);

  const getConfidenceBadge = (tier: ConfidenceTier, score: number) => {
    switch (tier) {
      case 'HIGH_GREEN':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 text-xs font-bold font-mono shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="font-black text-sm">{score}%</span>
            <span className="text-[10px] font-headline font-bold text-emerald-800">ثقة عالية 🟢</span>
          </div>
        );
      case 'MEDIUM_YELLOW':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-bold font-mono shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span className="font-black text-sm">{score}%</span>
            <span className="text-[10px] font-headline font-bold text-amber-900">حاجز أمان 🟡</span>
          </div>
        );
      case 'CRITICAL_RED':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-800 border border-rose-500/40 text-xs font-bold font-mono shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping opacity-75" />
            <span className="font-black text-sm">{score}%</span>
            <span className="text-[10px] font-headline font-bold text-rose-900">حاسم / إيقاف 🔴</span>
          </div>
        );
    }
  };

  const getDecisionTypeBadge = (type: DecisionType, title: string) => {
    switch (type) {
      case 'SCALE':
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-black font-headline bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm flex items-center gap-1.5 w-fit border border-emerald-400/30">
            <TrendingUp className="w-4 h-4 text-emerald-200" />
            <span>{title}</span>
          </span>
        );
      case 'HOLD_FIX_OPS':
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-black font-headline bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm flex items-center gap-1.5 w-fit border border-amber-300/30">
            <Clock className="w-4 h-4 text-amber-100" />
            <span>{title}</span>
          </span>
        );
      case 'KILL':
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-black font-headline bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-sm flex items-center gap-1.5 w-fit border border-rose-400/30">
            <AlertOctagon className="w-4 h-4 text-rose-200" />
            <span>{title}</span>
          </span>
        );
      case 'FATIGUE_REPLACE':
      default:
        return (
          <span className="px-3 py-1.5 rounded-lg text-xs font-black font-headline bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm flex items-center gap-1.5 w-fit border border-purple-400/30">
            <RotateCcw className="w-4 h-4 text-purple-200" />
            <span>{title}</span>
          </span>
        );
    }
  };

  const getRowThemeClasses = (type: DecisionType, isDone: boolean) => {
    if (isDone) {
      return 'bg-emerald-50/60 border-r-4 border-r-emerald-500 hover:bg-emerald-50';
    }
    switch (type) {
      case 'SCALE':
        return 'bg-gradient-to-r from-emerald-50/40 via-white to-white border-r-4 border-r-emerald-500 hover:bg-emerald-50/60';
      case 'HOLD_FIX_OPS':
        return 'bg-gradient-to-r from-amber-50/40 via-white to-white border-r-4 border-r-amber-500 hover:bg-amber-50/60';
      case 'KILL':
        return 'bg-gradient-to-r from-rose-50/50 via-white to-white border-r-4 border-r-rose-600 hover:bg-rose-50/70';
      case 'FATIGUE_REPLACE':
      default:
        return 'bg-gradient-to-r from-purple-50/40 via-white to-white border-r-4 border-r-purple-600 hover:bg-purple-50/60';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white border border-emerald-500 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold font-headline">{toastMessage}</span>
        </div>
      )}

      {/* HEADER: SMART LANDING STATION (محطة الهبوط الذكية) */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border-2 border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full text-xs font-black font-mono bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
                ⚡ COMMAND CENTER & ACTION MATRIX
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-indigo-500/25 text-indigo-200 border border-indigo-400/40">
                🎯 3-LAYER SYNTHESIS
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30">
                🛡️ ACTIVE GUARDRAILS
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-headline flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30">
                <CheckSquare className="w-6 h-6" />
              </div>
              <span className="bg-gradient-to-r from-white via-slate-100 to-emerald-200 bg-clip-text text-transparent">
                مصفوفة القرارات النهائية (Final Decision Matrix)
              </span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              محطة الهبوط الذكية التي تجمع مخرجات كافة الـ Layers وتحولها لقرارات تنفيذية ملونة وفورية تجيبك بوضوح: <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">"أنا كـ Media Buyer أو Business Owner، أعمل إيه حالا بالظبط؟"</span>
            </p>
          </div>

          {/* Quick Metrics Flash & Bulk Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-gradient-to-br from-emerald-950/70 to-slate-900/90 border border-emerald-500/40 rounded-xl shadow-lg relative overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-emerald-400 absolute top-2.5 left-2.5 animate-pulse" />
                <span className="text-[11px] text-emerald-300 font-bold block font-headline">أرباح وإيرادات مستهدفة</span>
                <span className="text-lg font-black font-mono text-emerald-400 block mt-0.5">
                  +{totalAddedProfit.toLocaleString()} ج.م
                </span>
              </div>
              <div className="p-3.5 bg-gradient-to-br from-rose-950/70 to-slate-900/90 border border-rose-500/40 rounded-xl shadow-lg relative overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-rose-400 absolute top-2.5 left-2.5" />
                <span className="text-[11px] text-rose-300 font-bold block font-headline">هدر محمي بالـ Guardrails</span>
                <span className="text-lg font-black font-mono text-rose-400 block mt-0.5">
                  -{totalSavedWaste.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <button
              onClick={handleBulkExecuteAll}
              disabled={isExecutingId === 'ALL' || bulkExecuted}
              className={`w-full py-3 px-4 rounded-xl font-black text-xs font-headline flex items-center justify-center gap-2 transition-all shadow-xl ${
                bulkExecuted
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white cursor-default border border-emerald-400/40'
                  : 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 text-slate-950 active:scale-95 shadow-emerald-500/25 border border-emerald-300'
              }`}
            >
              {isExecutingId === 'ALL' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري المزامنة والتطبيق الفوري...</span>
                </>
              ) : bulkExecuted ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>تم تطبيق كافة القرارات بنجاح</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>تطبيق جميع القرارات الفورية (Auto-Sync)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300 font-headline ml-1 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>فلترة القرارات:</span>
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all ${
              filterType === 'ALL'
                ? 'bg-white text-slate-950 shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            الكل ({initialDecisions.length})
          </button>
          <button
            onClick={() => setFilterType('SCALE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all flex items-center gap-1.5 ${
              filterType === 'SCALE'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black ring-2 ring-emerald-300'
                : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>قرارات التكبير (Scaling)</span>
          </button>
          <button
            onClick={() => setFilterType('HOLD_FIX_OPS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all flex items-center gap-1.5 ${
              filterType === 'HOLD_FIX_OPS'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                : 'bg-amber-950/60 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>عنق زجاجة العمليات (Off-Meta)</span>
          </button>
          <button
            onClick={() => setFilterType('KILL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all flex items-center gap-1.5 ${
              filterType === 'KILL'
                ? 'bg-rose-600 text-white shadow-md font-black ring-2 ring-rose-400'
                : 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60 border border-rose-500/30'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>إيقاف حاسم (Kill)</span>
          </button>
          <button
            onClick={() => setFilterType('FATIGUE_REPLACE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-headline transition-all flex items-center gap-1.5 ${
              filterType === 'FATIGUE_REPLACE'
                ? 'bg-purple-600 text-white shadow-md font-black ring-2 ring-purple-400'
                : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900/60 border border-purple-500/30'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إنهاك الكريتيف (Fatigue)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الكيان، التشخيص، أو القرار..."
            className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans"
          />
        </div>
      </div>

      {/* 6-COLUMN DECISION MATRIX TABLE */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white font-bold font-headline border-b-2 border-emerald-500/40">
              <tr>
                <th className="p-4 w-1/6">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[11px] flex items-center justify-center font-mono font-black">1</span>
                    <span>الكيان (Target)</span>
                  </div>
                </th>
                <th className="p-4 w-1/4">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-500 text-white text-[11px] flex items-center justify-center font-mono font-black">2</span>
                    <span>التشخيص النهائي (Synthesis)</span>
                  </div>
                </th>
                <th className="p-4 w-1/8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 text-[11px] flex items-center justify-center font-mono font-black">3</span>
                    <span>درجة الأمان والثقة (Confidence)</span>
                  </div>
                </th>
                <th className="p-4 w-1/6">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 text-[11px] flex items-center justify-center font-mono font-black">4</span>
                    <span>القرار المباشر (Required Action)</span>
                  </div>
                </th>
                <th className="p-4 w-1/6">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-teal-500 text-slate-950 text-[11px] flex items-center justify-center font-mono font-black">5</span>
                    <span>الأثر المالي المتوقع (Financial Impact)</span>
                  </div>
                </th>
                <th className="p-4 w-1/8 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-500 text-white text-[11px] flex items-center justify-center font-mono font-black">6</span>
                    <span>التنفيذ (Action Button)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 font-sans bg-slate-50">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                    <span className="text-sm font-bold block">لا توجد قرارات مطابقة للفلتر المحدد</span>
                    <span className="text-xs text-slate-400 mt-1 block">جرب تغيير نوع الفلترة أو مسح عبارة البحث</span>
                  </td>
                </tr>
              ) : (
                filteredDecisions.map((dec) => {
                  const isDone = !!executedActions[dec.id];
                  const isLoading = isExecutingId === dec.id;

                  return (
                    <tr 
                      key={dec.id} 
                      className={`transition-all ${getRowThemeClasses(dec.decision_type, isDone)}`}
                    >
                      {/* 1. الكيان Target */}
                      <td className="p-4 align-top">
                        <div className="space-y-1.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black font-mono border shadow-2xs ${
                            dec.target_type === 'CAMPAIGN' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                            dec.target_type === 'ADSET' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' :
                            'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            {dec.target_type}
                          </span>
                          <h4 className="font-black text-slate-900 text-xs font-headline leading-tight">
                            {dec.target_name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono block font-semibold">
                            كود: {dec.target_id_code}
                          </span>
                        </div>
                      </td>

                      {/* 2. التشخيص النهائي Synthesis */}
                      <td className="p-4 align-top space-y-2">
                        <p className="text-slate-900 text-xs leading-relaxed font-semibold">
                          {dec.synthesis_diagnosis}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dec.layers_analyzed.map((layer, idx) => (
                            <span key={idx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100/90 text-slate-700 border border-slate-300 shadow-2xs">
                              {layer}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* 3. درجة الأمان والثقة Confidence */}
                      <td className="p-4 align-top text-center space-y-2">
                        <div className="flex justify-center">
                          {getConfidenceBadge(dec.confidence_tier, dec.confidence_score)}
                        </div>
                        <span className="text-[11px] text-slate-600 font-medium leading-tight block text-right bg-white/70 p-2 rounded-lg border border-slate-200/80">
                          {dec.guardrail_note}
                        </span>
                      </td>

                      {/* 4. القرار المباشر Required Action */}
                      <td className="p-4 align-top space-y-2">
                        {getDecisionTypeBadge(dec.decision_type, dec.required_action_title)}
                        <p className="text-[11px] text-slate-700 leading-relaxed font-medium pt-0.5 bg-white/60 p-2 rounded-lg border border-slate-200/70">
                          {dec.required_action_detail}
                        </p>
                      </td>

                      {/* 5. الأثر المالي المتوقع Financial Impact */}
                      <td className="p-4 align-top">
                        <div className={`p-3 rounded-xl border-2 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                          dec.financial_impact_type === 'PROFIT_INCREASE'
                            ? 'bg-gradient-to-br from-emerald-50 to-teal-50/80 border-emerald-400 text-emerald-950'
                            : dec.financial_impact_type === 'REVENUE_RECOVERY'
                            ? 'bg-gradient-to-br from-sky-50 to-blue-50/80 border-sky-400 text-sky-950'
                            : 'bg-gradient-to-br from-rose-50 to-red-50/80 border-rose-400 text-rose-950'
                        }`}>
                          <div className="flex items-center gap-1.5 font-black font-headline text-[11px]">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              dec.financial_impact_type === 'PROFIT_INCREASE' ? 'bg-emerald-500 text-white' :
                              dec.financial_impact_type === 'REVENUE_RECOVERY' ? 'bg-sky-500 text-white' :
                              'bg-rose-600 text-white'
                            }`}>
                              <DollarSign className="w-3.5 h-3.5" />
                            </div>
                            <span>
                              {dec.financial_impact_type === 'PROFIT_INCREASE' ? 'أرباح إضافية مؤكدة:' :
                               dec.financial_impact_type === 'REVENUE_RECOVERY' ? 'استعادة إيراد مفقود:' : 'حماية فورية للسيولة:'}
                            </span>
                          </div>
                          <span className="font-bold block text-[11px] leading-snug">
                            {dec.financial_impact_highlight}
                          </span>
                        </div>
                      </td>

                      {/* 6. التنفيذ Action Button */}
                      <td className="p-4 align-top text-center">
                        <div className="space-y-2">
                          {isDone ? (
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border border-emerald-400 px-3 py-2.5 rounded-xl text-xs font-black font-headline flex items-center justify-center gap-1.5 shadow-md">
                              <CheckCircle2 className="w-4 h-4 text-emerald-100 shrink-0" />
                              <span>تم التنفيذ</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleExecute(dec.id, dec.action_button_label)}
                              disabled={isLoading}
                              className={`w-full px-3 py-2.5 rounded-xl font-black text-xs font-headline flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                                dec.decision_type === 'SCALE'
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 border border-emerald-400/40'
                                  : dec.decision_type === 'HOLD_FIX_OPS'
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 border border-amber-300/40 font-black'
                                  : dec.decision_type === 'KILL'
                                  ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-500/25 border border-rose-400/40'
                                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 border border-purple-400/40'
                              }`}
                            >
                              {isLoading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>تنفيذ...</span>
                                </>
                              ) : (
                                <>
                                  <ArrowUpRight className="w-4 h-4" />
                                  <span>{dec.action_button_label}</span>
                                </>
                              )}
                            </button>
                          )}

                          {isDone && (
                            <span className="text-[10px] text-emerald-800 font-mono block font-bold bg-emerald-100/80 px-2 py-0.5 rounded">
                              {executedActions[dec.id]?.time}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WHY AUTO DECISION MATRIX IS CRITICAL (لماذا التحويل التلقائي لـ Decision Matrix مهم؟) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm font-headline text-white">
              لماذا تعتبر مصفوفة القرارات (Decision Matrix) هي المحطة التنفيذية الأهم؟
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-4xl leading-relaxed">
              بمجرد اكتمال الفحص التشخيصي عبر كافة الطبقات، يتم تحويل المؤشرات المعقدة إلى خطة عمل تنفيذية بنسبة 100%، لتوجيه تركيز الميديا باير وصاحب العمل نحو اتخاذ القرار وحماية السيولة فوراً دون التشتت في تفاصيل الشارتات.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold bg-white/5 border border-white/10 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Ambiguity Execution</span>
        </div>
      </div>
    </div>
  );
};
