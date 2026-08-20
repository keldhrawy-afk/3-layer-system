import React, { useState, useMemo } from 'react';
import { AuditPayload, AuditResult } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Eye, 
  TrendingDown, 
  Truck, 
  Package, 
  CheckCircle2, 
  Sliders, 
  Users, 
  Briefcase, 
  Sparkles, 
  Lock,
  Clock,
  DollarSign,
  Flame,
  FileText,
  Layers,
  Tag,
  MessageSquare,
  Copy,
  Check,
  Send,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkle
} from 'lucide-react';

interface Layer3DiagnosticEngineTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

// Expected report input interface
interface ExternalReportInput {
  dayOfMonth: number;
  ctr: string;
  cpc: string;
  previousCpa: string;
  currentCpa: string;
  competitorsStatus: string; // 'none' | 'new_offers'
  competitorDetails: string;
  shippingStatus: string; // 'stable' | 'delays' | 'fee_increase'
  inventoryStatus: string; // 'full' | 'routine_shortage' | 'shampoo_shortage'
  supportSpeedStatus: string; // 'fast_under_5m' | 'slow_over_5m' | 'page_score_low'
  frtMinutes: number;
}

export const Layer3DiagnosticEngineTab: React.FC<Layer3DiagnosticEngineTabProps> = ({
  payload,
  auditResult
}) => {
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [isCustomReportActive, setIsCustomReportActive] = useState(false);

  // Form State for User Input Template
  const [reportInput, setReportInput] = useState<ExternalReportInput>({
    dayOfMonth: 19,
    ctr: '2.4%',
    cpc: '1.80 ج.م',
    previousCpa: '88 ج.م',
    currentCpa: '155 ج.م',
    competitorsStatus: 'none',
    competitorDetails: 'لا توجد عروض ترويجية غير اعتيادية تم رصدها في مكتبة إعلانات ميتا',
    shippingStatus: 'stable',
    inventoryStatus: 'full',
    supportSpeedStatus: 'fast_under_5m',
    frtMinutes: 3
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2500);
  };

  // Quick Preset Handlers
  const loadPreset = (preset: 'MID_MONTH' | 'COMPETITOR' | 'OPERATIONAL' | 'PAYDAY') => {
    setIsCustomReportActive(false);
    if (preset === 'MID_MONTH') {
      setReportInput({
        dayOfMonth: 19,
        ctr: '2.5%',
        cpc: '1.75 ج.م',
        previousCpa: '88 ج.م',
        currentCpa: '155 ج.م',
        competitorsStatus: 'none',
        competitorDetails: 'المكتبة الإعلانية مستقرة ولا يوجد عرض مفاجئ',
        shippingStatus: 'stable',
        inventoryStatus: 'full',
        supportSpeedStatus: 'fast_under_5m',
        frtMinutes: 3
      });
    } else if (preset === 'COMPETITOR') {
      setReportInput({
        dayOfMonth: 11,
        ctr: '2.3%',
        cpc: '1.85 ج.م',
        previousCpa: '85 ج.م',
        currentCpa: '145 ج.م',
        competitorsStatus: 'new_offers',
        competitorDetails: 'رصد إعلان منافس مباشر بخصم 30% + شحن مجاني في Meta Ad Library',
        shippingStatus: 'stable',
        inventoryStatus: 'full',
        supportSpeedStatus: 'fast_under_5m',
        frtMinutes: 4
      });
    } else if (preset === 'OPERATIONAL') {
      setReportInput({
        dayOfMonth: 9,
        ctr: '2.1%',
        cpc: '1.90 ج.م',
        previousCpa: '90 ج.م',
        currentCpa: '168 ج.م',
        competitorsStatus: 'none',
        competitorDetails: 'مستقر',
        shippingStatus: 'stable',
        inventoryStatus: 'routine_shortage',
        supportSpeedStatus: 'slow_over_5m',
        frtMinutes: 18
      });
    } else if (preset === 'PAYDAY') {
      setReportInput({
        dayOfMonth: 2,
        ctr: '2.8%',
        cpc: '1.60 ج.م',
        previousCpa: '115 ج.م',
        currentCpa: '68 ج.م',
        competitorsStatus: 'none',
        competitorDetails: 'مستقر',
        shippingStatus: 'stable',
        inventoryStatus: 'full',
        supportSpeedStatus: 'fast_under_5m',
        frtMinutes: 2
      });
    }
  };

  // Diagnostic & Hard-Rules Engine based on user report inputs
  const diagnosis = useMemo(() => {
    const { dayOfMonth, competitorsStatus, inventoryStatus, supportSpeedStatus, frtMinutes } = reportInput;

    const isMidMonthTrap = dayOfMonth >= 15 && dayOfMonth <= 25;
    const isCompetitorNewOffer = competitorsStatus === 'new_offers';
    const isOperationalIssue = supportSpeedStatus === 'slow_over_5m' || frtMinutes > 5 || inventoryStatus !== 'full';
    const isPaydayWindow = dayOfMonth >= 1 && dayOfMonth <= 5;

    // Rule 1: Operational Bottleneck Priority (Delayed FRT > 5m or Inventory Shortage)
    if (isOperationalIssue) {
      const reasonTitle = supportSpeedStatus === 'slow_over_5m' || frtMinutes > 5
        ? `تأخر رد السيلز في الشات (${frtMinutes} دقيقة > 5 دقائق المسموحة)`
        : 'نقص في مخزون عبوات الروتين بالمخزن يعطل إتمام الطلبات';

      return {
        ruleCategory: 'OPERATIONAL_BOTTLENECK',
        badge: 'معوقات تشغيلية (تخفيض 30% مؤقتاً)',
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
        realCause: `السبب الحقيقي لارتفاع الـ CPA ليس الإعلان، بل ${reasonTitle}. العملاء يبردون أثناء الانتظار أو يتعطل شحن أوردراتهم، مما يخفض نسبة التحويل (CVR).`,
        adFate: 'حظر إيقاف الإعلان نهائياً (Ad-Kill Ban Active) — الإعلان ناجح ومؤشراته (CTR و CPC) طبيعية؛ يُطبق تخفيض 30% للميزانية مؤقتاً لحماية الفلوس دون مساس بالحملات، وتُعاد فور انتظام التشغيل.',
        directRemedy: {
          strategyName: 'تخفيض وقائي 30% + شفت طوارئ للإنبوكس',
          counterOfferCaption: 'إجراء الميديا باير: خفض الميزانية 30% من داخل Ads Manager فوراً لحين تأكيد تصفية الشاتات واستكمال نواقص المخزون.',
          salesScript: 'بنعتذر جداً لحضرتك على التأخير غير المقصود في الرد بسبب الإقبال الكبير! 🌸 عشان نعتذر لحضرتك عملياً، فعلنالك كود خصم إضافي 50 ج.م مع شحن مجاني لباكدج الروتين الكامل! قوليلي يا فندم إيه المشكلة الأساسية لشعرك عشان نجهزلك الروتين فوراً؟',
          crmTag: 'Delayed_FRT_Apology',
          actionRole: 'تخفيض الميزانية 30% فوراً + استدعاء شفت طوارئ لتصفية الشاتات في أقل من 5 دقائق.'
        }
      };
    }

    // Rule 2: Competitor Counter-Strike
    if (isCompetitorNewOffer) {
      return {
        ruleCategory: 'COMPETITOR_COUNTER_STRIKE',
        badge: 'هجوم عرض منافس (Offer Counter-Strike)',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
        realCause: 'رصد عرض جديد أو خصم قوي لمنافس مباشر في Meta Ad Library أدى لمقارنة العميلات وتأجيل الشراء داخل الإنبوكس مما رفع الـ CPA.',
        adFate: 'ممنوع منعاً باتاً تعديل الفيديو أو إيقاف الإعلان الكسبان (Ad-Kill Ban Active). الكريتيف يجلب تفاعلاً ممتازاً والمشكلة في العرض الخارجي فقط.',
        directRemedy: {
          strategyName: 'العرض المضاد (Offer Counter-Strike) في الكابشن والإنبوكس',
          counterOfferCaption: '🚨 عرض الـ 48 ساعة فقط: اطلبي روتين العناية الملكي الكامل النهاردة واحصلي على [شحن مجاني + سيروم ترطيب مكمل هدية مجانية فورية] لأول 50 عميلة! احجزي دلوقتي قبل اكتمال العدد 🎁✨',
          salesScript: 'أهلاً بحضرتك يا فندم! 🌸 فاهمين جداً إن فيه بدايل في السوق، لكن روتيننا بتركيبة علاجية طبيعية 100% بدون أي مواد ضارة ومجرب من آلاف العميلات. وعشان تتأكدي بنفسك، بنقدملك النهاردة: شحن مجاني لحد باب بيتك + سيروم مكمل هدية فورية مع الباكدج! تحبي نسجل العنوان ونحجزلك الهدية دلوقتي؟',
          crmTag: 'Competitor_Comparison',
          actionRole: 'إبقاء الفيديو كما هو وتعديل نص الكابشن (Ad Copy) بالعرض المضاد فوراً وتدريب السيلز على سكريبت المقارنة.'
        }
      };
    }

    // Rule 3: Mid-Month Payday Trap (Day 15-25)
    if (isMidMonthTrap) {
      return {
        ruleCategory: 'MID_MONTH_PAYDAY_TRAP',
        badge: 'مصيدة منتصف الشهر (15-25) - شح سيولة',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        realCause: `تاريخ اليوم (${reportInput.dayOfMonth} في الشهر) يقع في قلب فترة شح السيولة وانخفاض القوة الشرائية (15 لـ 25). العميلات يؤجلن الشراء لانتظار المرتبات، مما يرفع الـ CPA مؤقتاً بالرغم من تفاعل الإعلان العالي.`,
        adFate: 'رفض قاطع لإيقاف الإعلان (Ad-Kill Ban Enforced) — طالما الـ CTR و CPC طبيعيان، يتم تجميد الميزانية (Hold Budget) دون زيادة أو نقصان لمنع إرباك خوارزمية ميتا.',
        directRemedy: {
          strategyName: 'بروتوكول الحجز المسبق للقبض (Pre-Order Payday)',
          counterOfferCaption: '💳 ميزة الحجز المسبق مع المرتب: احجزي روتينك النهاردة بسعر العرض الحصري، والشحن والتسليم هيكون يوم 1 في الشهر مع المرتب! الدفع عند الاستلام وبدون أي مقدم 🎁📦',
          salesScript: 'ولا يهمك خالص يا فندم! عارفين إننا في نص الشهر، عشان كده وفرنالك ميزة "الحجز المسبق مع المرتب" 🌸 نقدر نسجل أوردر حضرتك وسعر الخصم النهاردة، ومندوب الشحن يوصلهولك يوم 1 في الشهر أول ما تقبضي على طول، والدفع عند الاستلام وبدون أي مقدم! تحبي نسجل الاسم والعنوان ونحجزلك الخصم دلوقتي؟',
          crmTag: 'Pending_Payday_PreOrder',
          actionRole: 'تجميد الميزانية الإعلانية وتحويل سكريبت تيم السيلز في الإنبوكس للحجز المسبق لتسليم أول الشهر.'
        }
      };
    }

    // Rule 4: Payday Golden Window (Day 1-5)
    if (isPaydayWindow) {
      return {
        ruleCategory: 'PAYDAY_SCALE',
        badge: 'أسبوع الرواتب والسيولة (Green Scale)',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        realCause: `تاريخ اليوم (${reportInput.dayOfMonth} في الشهر) يقع في نافذة صرف الرواتب؛ السيولة في أعلى مستوياتها والقدرة الشرائية جاهزة للتحويل الفوري.`,
        adFate: 'ضوء أخضر للتكبير والتوسع (Green Scale) — رفع الميزانية الإعلانية تدريجياً بنسبة 20% كل 24 ساعة لاستغلال ذروة السيولة.',
        directRemedy: {
          strategyName: 'عرض الرواتب السريع + ترقية الأوردر (Upsell)',
          counterOfferCaption: '🎉 عرض أول الشهر المميز: اطلبي باكدج الروتين الملكي الكامل واستمتعي بخصم الرواتب + شحن مجاني سريع لحد باب بيتك في 48 ساعة! العرض ساري حتى يوم 5 في الشهر فقط 🛍️',
          salesScript: 'ألف مبروك يا فندم! تم حجز باكدج الروتين الكامل لحضرتك بعرض أول الشهر 🌸 بمناسبة أسبوع الرواتب، متاح لحضرتك إضافة سيروم الحماية الحرارية بخصم 50% فقط داخل نفس الشحنة وبدون أي مصاريف شحن إضافية! تحبي نضيفه للأوردر ويطلع شحن فوري بكرة الصبح؟',
          crmTag: 'Payday_Confirmed_FastTrack',
          actionRole: 'زيادة الميزانية بنسبة 20% وتسريع شحن الأوردرات الفورية.'
        }
      };
    }

    // Default Normal Cycle
    return {
      ruleCategory: 'NORMAL_STABLE_CYCLE',
      badge: 'دورة إنفاق اعتيادية ومستقرة',
      badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
      realCause: 'العوامل الخارجية مستقرة (المخزون مكتمل، سرعة الرد ممتازة، لا توجد عروض منافسين مفاجئة).',
      adFate: 'الاستمرار في تشغيل الإعلانات ومراقبة مؤشرات الأداء بشكل دوري (Ad-Kill Ban Active).',
      directRemedy: {
        strategyName: 'المحافظة على وتيرة الصرف الطبيعية وبناء القيمة',
        counterOfferCaption: 'اطلبي روتين العناية المتكامل بشعرك واستفيدي من عرض الخصم الحالي مع ضمان استرجاع 14 يوم!',
        salesScript: 'أهلاً بحضرتك يا فندم! 🌸 روتيننا بيحتوي على كافة المكونات الطبيعية لتغذية وتكثيف الشعر. تحبي نوضح لحضرتك طريقة الاستخدام وأسعار الباكدج بالخصم الحالي؟',
        crmTag: 'Standard_Prospect',
        actionRole: 'مواصلة الصرف الاعتيادي والالتزام بمعدل رد أقل من 5 دقائق.'
      }
    };
  }, [reportInput]);

  return (
    <div id="layer3-external-signals-auditor" className="space-y-6 text-slate-900 font-sans dir-rtl" dir="rtl">
      
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold font-mono">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Layer 3 (العوامل الخارجية) — External Signals & Hard-Rules Auditor</span>
            </div>
            <h1 className="text-lg md:text-2xl font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <span>نظام تحليل أداء الإعلانات والقرارات الصارمة (Layer 3: العوامل الخارجية)</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-500 font-sans max-w-3xl leading-relaxed">
              استقبال "تقرير العوامل الخارجية"، وتشخيص السبب الحقيقي لارتفاع الـ CPA لمنع التسرع في إيقاف الإعلانات الكسبانة، وتوليد (السبب الحقيقي | مصير الإعلان | الخطوة العلاجية المباشرة).
            </p>
          </div>

          {/* Ad-Kill Ban Protection Status Box */}
          <div className="bg-slate-50 border border-emerald-200 rounded-xl p-3.5 shrink-0 flex items-center gap-3 shadow-2xs self-start lg:self-center">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-mono font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">قاعدة حظر الإيقاف (Ad-Kill Ban)</span>
              <span className="text-xs font-extrabold font-headline text-slate-900 block">حظر صارم مفعل 100%</span>
              <span className="text-[10px] text-slate-500 block">ممنوع إيقاف إعلان تفاعله ونقره عاليان</span>
            </div>
          </div>
        </div>

        {/* Quick Scenario Selector Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-headline text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>قوالب تقارير جاهزة للاختبار الفوري:</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              أو عدّل في الحقول بالأسفل لتجربة بياناتك الخاصة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-headline">
            <button
              onClick={() => loadPreset('MID_MONTH')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                reportInput.dayOfMonth === 19 && reportInput.competitorsStatus === 'none' && reportInput.supportSpeedStatus === 'fast_under_5m'
                  ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs font-extrabold ring-1 ring-amber-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">1. مصيدة منتصف الشهر (يوم 19)</span>
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <span className="text-[10px] font-sans font-normal text-slate-500">فترة شح السيولة (تأجيل شراء)</span>
            </button>

            <button
              onClick={() => loadPreset('COMPETITOR')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                reportInput.competitorsStatus === 'new_offers'
                  ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-2xs font-extrabold ring-1 ring-rose-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">2. رصد عرض منافس جديد</span>
                <Flame className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <span className="text-[10px] font-sans font-normal text-slate-500">خصم 30% في Ad Library</span>
            </button>

            <button
              onClick={() => loadPreset('OPERATIONAL')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                reportInput.supportSpeedStatus === 'slow_over_5m' || reportInput.inventoryStatus === 'routine_shortage'
                  ? 'bg-purple-50 border-purple-400 text-purple-950 shadow-2xs font-extrabold ring-1 ring-purple-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">3. تأخر رد السيلز (&gt; 5 دقائق)</span>
                <Clock className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-[10px] font-sans font-normal text-slate-500">FRT 18 دقيقة + نقص مخزون</span>
            </button>

            <button
              onClick={() => loadPreset('PAYDAY')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between gap-1 cursor-pointer ${
                reportInput.dayOfMonth === 2 && reportInput.competitorsStatus === 'none' && reportInput.supportSpeedStatus === 'fast_under_5m'
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-2xs font-extrabold ring-1 ring-emerald-400'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">4. أسبوع صرف المرتبات (يوم 2)</span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-sans font-normal text-slate-500">سيولة مرتفعة وتوسع 20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* PART 1: USER DATA INPUT TEMPLATE (قالب البيانات المتوقع استقباله من المستخدم) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono font-bold text-xs">1</span>
            <h2 className="text-sm md:text-base font-extrabold font-headline text-slate-900">
              قالب تقرير العوامل الخارجية المُستقبل (External Signals Data Input Template)
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            جاهز للتحليل التلقائي
          </span>
        </div>

        {/* Input Fields Grid matching user's exact specification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          
          {/* Field 1: Day of Month */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 flex items-center justify-between">
              <span>📅 تاريخ اليوم في الشهر:</span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                اليوم {reportInput.dayOfMonth}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="31"
              value={reportInput.dayOfMonth}
              onChange={(e) => {
                setIsCustomReportActive(true);
                setReportInput(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) || 1 }));
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1 (القبض)</span>
              <span>15 (بداية الشح)</span>
              <span>25 (نهاية الشح)</span>
              <span>31</span>
            </div>
          </div>

          {/* Field 2: Ad Performance Indicators */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 block">
              📊 مؤشرات الإعلان [CTR% | CPC | CPA]:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">CTR%:</span>
                <input
                  type="text"
                  value={reportInput.ctr}
                  onChange={(e) => setReportInput(prev => ({ ...prev, ctr: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-emerald-700"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CPC:</span>
                <input
                  type="text"
                  value={reportInput.cpc}
                  onChange={(e) => setReportInput(prev => ({ ...prev, cpc: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-slate-800"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">CPA الحالي:</span>
                <input
                  type="text"
                  value={reportInput.currentCpa}
                  onChange={(e) => setReportInput(prev => ({ ...prev, currentCpa: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-rose-700"
                />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">السابق: {reportInput.previousCpa}</span>
          </div>

          {/* Field 3: Competitors Status (Meta Ad Library) */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 block">
              🎯 حالة المنافسين (Meta Ad Library):
            </label>
            <select
              value={reportInput.competitorsStatus}
              onChange={(e) => {
                setIsCustomReportActive(true);
                setReportInput(prev => ({ ...prev, competitorsStatus: e.target.value }));
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-sans font-bold text-slate-800 text-xs cursor-pointer"
            >
              <option value="none">لا توجد عروض/خصومات جديدة للمنافسين (مستقر)</option>
              <option value="new_offers">تم رصد عروض وخصومات جديدة للمنافسين (30%+)</option>
            </select>
            <span className="text-[10px] text-slate-500 block truncate">{reportInput.competitorDetails}</span>
          </div>

          {/* Field 4: Shipping & Logistics */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 block">
              🚚 حالة الشحن واللوجستيات:
            </label>
            <select
              value={reportInput.shippingStatus}
              onChange={(e) => {
                setIsCustomReportActive(true);
                setReportInput(prev => ({ ...prev, shippingStatus: e.target.value }));
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-sans font-bold text-slate-800 text-xs cursor-pointer"
            >
              <option value="stable">استقرار في التوصيل ومصاريف الشحن (2.4 يوم)</option>
              <option value="delays">تأخيرات في تسليم بوالص المحافظات</option>
              <option value="fee_increase">زيادة في مصاريف الشحن</option>
            </select>
            <span className="text-[10px] text-slate-400 block font-mono">SLA الشحن: مستقر</span>
          </div>

          {/* Field 5: Inventory Status */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 block">
              📦 حالة المخزون:
            </label>
            <select
              value={reportInput.inventoryStatus}
              onChange={(e) => {
                setIsCustomReportActive(true);
                setReportInput(prev => ({ ...prev, inventoryStatus: e.target.value }));
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-sans font-bold text-slate-800 text-xs cursor-pointer"
            >
              <option value="full">توفر الروتين كاملاً (شامبو، بلسم، سيروم، ماسك)</option>
              <option value="routine_shortage">وجود نواقص في عبوات الروتين (الشامبو)</option>
            </select>
            <span className="text-[10px] text-slate-400 block font-mono">
              {reportInput.inventoryStatus === 'full' ? 'المخزون يكفي لـ 21 يوماً' : 'تنبيه: نقص يمنع إتمام الباكدج'}
            </span>
          </div>

          {/* Field 6: Support Speed & Page Feedback */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="font-headline font-bold text-slate-800 flex items-center justify-between">
              <span>⚡ سرعة الرد وتقييم البيدج:</span>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${reportInput.frtMinutes > 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                {reportInput.frtMinutes} دقائق FRT
              </span>
            </label>
            <select
              value={reportInput.supportSpeedStatus}
              onChange={(e) => {
                setIsCustomReportActive(true);
                const isSlow = e.target.value === 'slow_over_5m';
                setReportInput(prev => ({ 
                  ...prev, 
                  supportSpeedStatus: e.target.value,
                  frtMinutes: isSlow ? 18 : 3
                }));
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-sans font-bold text-slate-800 text-xs cursor-pointer"
            >
              <option value="fast_under_5m">زمن رد ممتاز (أقل من 5 دقائق) - تقييم البيدج 4.3</option>
              <option value="slow_over_5m">تأخير في الرد (أكثر من 5 دقائق / زحمة شاتات)</option>
            </select>
            <span className="text-[10px] text-slate-400 block font-mono">تقييم الصفحة: 4.3 / 5.0 (ممتاز)</span>
          </div>

        </div>
      </div>

      {/* PART 2: MANDATORY OUTPUT STRUCTURE (المخرجات الإلزامية المطلوبة فوراً) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-mono font-bold text-xs">2</span>
          <h2 className="text-base md:text-lg font-extrabold font-headline text-slate-900">
            مخرجات التحليل والقرارات التنفيذية الإلزامية (Auditor Executive Outputs)
          </h2>
        </div>

        {/* 3 Executive Pillars Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* OUTPUT 1: THE REAL CAUSE (السبب الحقيقي) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  المخرج الأول
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${diagnosis.badgeColor}`}>
                  {diagnosis.badge}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm md:text-base font-extrabold font-headline text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span>السبب الحقيقي (Root Cause)</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  تحديد العامل الخارجي الفعلي المسبب لارتفاع الـ CPA دون تسرع:
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-sans leading-relaxed text-slate-800 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>التشخيص الدقيق:</span>
                </div>
                <p className="text-[12px] leading-relaxed">
                  {diagnosis.realCause}
                </p>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100">
              📌 المرجع: فحص العوامل الخارجية المستقلة عن ميتا
            </div>
          </div>

          {/* OUTPUT 2: AD FATE & AD-KILL BAN (مصير الإعلان) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  المخرج الثاني
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🛡️ Ad-Kill Ban
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm md:text-base font-extrabold font-headline text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>مصير الإعلان (Ad Fate)</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  تأكيد الاستمرار عليه ومنع إيقافه أو تعديل الكريتيف:
                </p>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl border border-slate-800 text-xs font-sans leading-relaxed space-y-2 shadow-2xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>القرار الحاسم الصارم:</span>
                </div>
                <p className="text-[11px] md:text-xs leading-relaxed text-slate-100">
                  {diagnosis.adFate}
                </p>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-emerald-700 font-bold border-t border-slate-100">
              ✅ مؤشرات الإعلان: CTR {reportInput.ctr} (ممتاز) | CPC {reportInput.cpc} (طبيعي)
            </div>
          </div>

          {/* OUTPUT 3: DIRECT REMEDY STEP (الخطوة العلاجية المباشرة) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  المخرج الثالث
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {diagnosis.directRemedy.crmTag}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm md:text-base font-extrabold font-headline text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>الخطوة العلاجية المباشرة (Direct Remedy)</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  إعطاء العرض المضاد، أو سكريبت الحجز، أو تعديل الميزانية:
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-sans">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-headline">{diagnosis.directRemedy.strategyName}:</strong>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                    CRM Tag: {diagnosis.directRemedy.crmTag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {diagnosis.directRemedy.actionRole}
                </p>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-400 border-t border-slate-100">
              📌 التنفيذ فوراً بين الميديا باير وسيلز الشات
            </div>
          </div>

        </div>
      </div>

      {/* ACTIONABLE COPY & SCRIPT ASSETS (الكابشن الخارجي وسكريبت الإنبوكس المباشر) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Layer 1: Ad Copy / Counter Offer Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold font-headline text-slate-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>نص الكابشن الخارجي والعرض المضاد (Layer 1: Ad Caption):</span>
            </div>
            <button
              onClick={() => handleCopy(diagnosis.directRemedy.counterOfferCaption, 'caption')}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
            >
              {copiedScriptId === 'caption' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedScriptId === 'caption' ? 'تم النسخ!' : 'نسخ الكابشن'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs md:text-sm text-slate-800 font-sans leading-relaxed select-all">
            "{diagnosis.directRemedy.counterOfferCaption}"
          </div>

          <span className="text-[10px] text-slate-400 font-mono block">
            * يتم تعديل نص الإعلان فقط دون المساس بالفيديو أو إعادة تشغيل الكامبين.
          </span>
        </div>

        {/* Layer 2: Sales Rep Script in Inbox */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold font-headline text-slate-900">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>سكريبت الإنبوكس لتيم السيلز (Layer 2: Sales Script):</span>
            </div>
            <button
              onClick={() => handleCopy(diagnosis.directRemedy.salesScript, 'salesScript')}
              className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer border border-emerald-200"
            >
              {copiedScriptId === 'salesScript' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedScriptId === 'salesScript' ? 'تم النسخ!' : 'نسخ السكريبت'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs md:text-sm text-slate-800 font-sans leading-relaxed select-all">
            "{diagnosis.directRemedy.salesScript}"
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>الـ CRM Tag المطلوب: <strong className="text-emerald-700 font-bold">{diagnosis.directRemedy.crmTag}</strong></span>
            <span className="text-emerald-700 font-bold">الرد المطلوب: FRT &lt; 5 دقائق</span>
          </div>
        </div>

      </div>

    </div>
  );
};
