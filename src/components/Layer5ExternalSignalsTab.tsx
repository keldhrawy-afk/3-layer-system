import React, { useState } from 'react';
import { AuditPayload, AuditResult, ExternalSignalCheckItem, HardRuleDecisionItem } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Eye, 
  TrendingDown, 
  Truck, 
  Package, 
  AlertOctagon, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  ExternalLink, 
  RotateCcw, 
  Sliders, 
  Users, 
  Briefcase, 
  Sparkles, 
  Lock,
  ArrowRight,
  Clock,
  DollarSign,
  Flame,
  Radio,
  FileText
} from 'lucide-react';

interface Layer5ExternalSignalsTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

type SimulationScenario = 'LIVE' | 'MID_MONTH_TRAP' | 'COMPETITOR_ATTACK' | 'OPERATIONAL_BOTTLENECK' | 'PAYDAY_WINDOW';

export const Layer5ExternalSignalsTab: React.FC<Layer5ExternalSignalsTabProps> = ({
  payload,
  auditResult
}) => {
  const [activeScenario, setActiveScenario] = useState<SimulationScenario>('LIVE');
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);

  // Dynamic values or simulated values
  const now = new Date();
  const currentDay = activeScenario === 'MID_MONTH_TRAP' 
    ? 19 
    : activeScenario === 'PAYDAY_WINDOW' 
      ? 2 
      : now.getDate();

  const isMidMonthTrap = activeScenario === 'MID_MONTH_TRAP' || (currentDay >= 15 && currentDay <= 25);
  const isPaydayWindow = activeScenario === 'PAYDAY_WINDOW' || (currentDay >= 1 && currentDay <= 5);

  const isCompetitorAttack = activeScenario === 'COMPETITOR_ATTACK';
  const isOperationalBottleneck = activeScenario === 'OPERATIONAL_BOTTLENECK' || (payload.chat_data?.average_frt_minutes ? payload.chat_data.average_frt_minutes > 10 : true);

  // 7 External Signals Definition
  const signals: ExternalSignalCheckItem[] = [
    {
      id: 'signal_seasonality',
      name: 'Seasonality & Payday Cycle',
      name_ar: '1. الموسمية ودورة الرواتب (Payday Cycle)',
      category: 'Seasonality',
      status: isMidMonthTrap ? 'WARNING' : isPaydayWindow ? 'SAFE' : 'SAFE',
      description: 'متابعة فترة شح السيولة منتصف الشهر (من يوم 15 لـ 25) مقابل أيام القبض وصرف الرواتب (من يوم 1 لـ 5).',
      inspection_source: 'التقويم المالي المحلي وتاريخ اليوم المباشر',
      current_finding: isMidMonthTrap 
        ? `اليوم ${currentDay} في الشهر: نحن في قلب فترة شح السيولة (15-25). العملاء يؤجلون الشراء لانتظار المرتبات، مما يرفع الـ CPA مؤقتاً دون وجود خلل في الإعلان.`
        : isPaydayWindow 
          ? `اليوم ${currentDay} في الشهر: فترة صرف المرتبات (1-5). السيولة في أعلى مستوياتها وقدرة التحويل مرتفعة.`
          : `اليوم ${currentDay} في الشهر: دورة إنفاق طبيعية ومستقرة.`,
      recommended_action: isMidMonthTrap
        ? 'تطبيق قاعدة (Mid-Month Payday Trap): تجميد الميزانية وتحويل سكريبت السيلز للحجز المسبق لتسليم الأوردر يوم 1 في الشهر.'
        : 'الاستمرار في الصرف الطبيعي مع الاستعداد لجدولة تسليمات أول الشهر.',
      metrics_tag: `اليوم ${currentDay} في الشهر`
    },
    {
      id: 'signal_competitors',
      name: 'Competitor Moves & Meta Ad Library',
      name_ar: '2. تحركات المنافسين (Meta Ad Library)',
      category: 'Competitors',
      status: isCompetitorAttack ? 'ALERT' : 'SAFE',
      description: 'التفتيش اليومي على مكتبة إعلانات ميتا (Meta Ad Library) لرصد أي خصومات أو عروض جديدة نزل بيها المنافسين.',
      inspection_source: 'Meta Ad Library + رصد أسماء العلامات المنافسة',
      current_finding: isCompetitorAttack
        ? 'تم رصد منافس مباشر أطلق عرضاً بخصم 30% + شحن مجاني، مما تسبب في مقارنة العملاء في الشات وارتفاع مؤقت للـ CPA.'
        : 'لم يتم رصد عروض عدوانية مفاجئة تهدد الحصة السوقية في مكتبة إعلانات ميتا خلال آخر 48 ساعة.',
      recommended_action: isCompetitorAttack
        ? 'تطبيق قاعدة (Competitor Counter-Strike): الحفاظ على الكريتيف والإعلان كما هو، وإطلاق عرض مضاد فوراً في الكابشن والإنبوكس (شحن مجاني / هدية مكملة).'
        : 'مواصلة التفتيش الصباحي اليومي في مكتبة إعلانات ميتا للعلامات المنافسة.',
      metrics_tag: isCompetitorAttack ? 'رصد عرض منافس جديد' : 'مستقر - Ad Library Clean'
    },
    {
      id: 'signal_pricing',
      name: 'Pricing & Cheaper Alternatives',
      name_ar: '3. تغيرات التسعير والبدائل الأرخص',
      category: 'Pricing',
      status: isCompetitorAttack ? 'WARNING' : 'SAFE',
      description: 'دخول بدائل أرخص في السوق أو تعديل المنافسين لأسعارهم مما قد يؤثر على سرعة اتخاذ قرار الشراء.',
      inspection_source: 'شيت مقارنة السوق (Market Price Index) واعتراضات الشات',
      current_finding: isCompetitorAttack
        ? 'تزايد اعتراضات العملاء في الشات حول وجود بدائل أرخص بالسوق بنسبة +14% مقارنة بالأسبوع الماضي.'
        : 'مستوى التسعير الحالي متوازن ويحقق هامش مساهمة إيجابي مع استقرار القيمة المدركة لدى العميل.',
      recommended_action: 'التركيز على بيع الباكدجات والروتين الكامل (Value Stacking) بدلاً من التنافس في حرب أسعار المنتجات الفردية.',
      metrics_tag: 'AOV: 1,200 ج.م'
    },
    {
      id: 'signal_logistics',
      name: 'Shipping & Delivery Logistics',
      name_ar: '4. لوجستيات الشحن ومصاريف التوصيل',
      category: 'Logistics',
      status: 'SAFE',
      description: 'التأكد من عدم وجود تأخيرات في توصيل الشحنات أو زيادة في مصاريف التوصيل للمحافظات تؤدي لرفض الاستلام.',
      inspection_source: 'تقارير شركات الشحن (Shipping SLA Portal)',
      current_finding: 'متوسط زمن التوصيل للمحافظات مستقر (2.4 يوم)، ولا توجد زيادة في تعريفة الشحن أو توقف في خطوط التوزيع.',
      recommended_action: 'متابعة أرقام البوالص أولاً بأول، وتأكيد موعد استلام محدد مع العميل في محادثة الواتساب.',
      metrics_tag: 'SLA التوصيل: 2.4 يوم'
    },
    {
      id: 'signal_inventory',
      name: 'Inventory & Routine Component Stock',
      name_ar: '5. حالة المخزون ومكونات الروتين',
      category: 'Inventory',
      status: activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'ALERT' : 'SAFE',
      description: 'التأكد من توفر كل مكونات الروتين والعبوات في المخزن وعدم وجود أي نواقص تعطل شحن وتأكيد الأوردرات.',
      inspection_source: 'شيت جرد المخزن (ERP / Live Inventory)',
      current_finding: activeScenario === 'OPERATIONAL_BOTTLENECK'
        ? 'نقص في مخزون عبوات الشامبو (تبقى أقل من 40 قطعة)، مما يعطل قفل باكدجات الروتين الكامل ويؤخر شحن الطلبات.'
        : 'المخزون مكتمل لجميع مكونات الروتين (الشامبو، البلسم، السيروم، والماسك) ويكفي لـ 21 يوماً قادمة.',
      recommended_action: activeScenario === 'OPERATIONAL_BOTTLENECK'
        ? 'تطبيق قاعدة (Operational Bottleneck): خفض الميزانية 30% مؤقتاً لحماية الفلوس حتى استكمال توريد العبوات.'
        : 'إبقاء مستويات الصرف كما هي وإشعار قسم المشتريات بالطلب المتوقع خلال أسبوع القبض.',
      metrics_tag: activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'نقص عبوات الروتين' : 'مخزون صحي (21 يوم)'
    },
    {
      id: 'signal_platform',
      name: 'Platform Policies & Page Feedback Score',
      name_ar: '6. سياسات المنصة وتقييم الصفحة (Page Score)',
      category: 'Platform',
      status: 'SAFE',
      description: 'مراجعة تقييم الصفحة (Page Feedback Score) وحالة الحساب الإعلاني وتحديثات وتذبذبات مزاد ميتا.',
      inspection_source: 'Meta Business Manager / Account Quality / Customer Feedback',
      current_finding: 'تقييم الصفحة ممتاز (4.3 / 5.0) والحساب الإعلاني في حالة ممتازة (No Restrictions) بدون أي عقوبات في المزاد.',
      recommended_action: 'المحافظة على جودة خدمة ما بعد البيع والتأكد من سرعة الشحن لضمان استمرار تقييم الصفحة أعلى من 4.0.',
      metrics_tag: 'Page Score: 4.3 / 5.0'
    },
    {
      id: 'signal_technical',
      name: 'Technical & Inbox System SLA',
      name_ar: '7. السلامة التقنية وسرعة وصول الرسائل',
      category: 'Technical',
      status: activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'ALERT' : 'SAFE',
      description: 'التأكد من عدم وجود أعطال في سيستم الإنبوكس، أو بطء في استلام وتوزيع الشاتات على السيلز.',
      inspection_source: 'WhatsApp Cloud API / Webhook Uptime Logs',
      current_finding: activeScenario === 'OPERATIONAL_BOTTLENECK'
        ? 'تسجيل بطء شديد في الرد تجاوز 18 دقيقة مع تكدس 45 محادثة غير مخدومة في الإنبوكس.'
        : 'سيستم الشات والواتساب يعمل بكفاءة 99.9%، وجميع الإشعارات تصل للعميلات في اللحظة الأولى.',
      recommended_action: activeScenario === 'OPERATIONAL_BOTTLENECK'
        ? 'تفعيل تخفيض 30% للميزانية مؤقتاً لحين استيعاب ضغط الرسائل وتفريغ التكدس.'
        : 'الاستمرار في مراقبة سرعة الرد وضمان بقاء FRT < 5 دقائق.',
      metrics_tag: activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'تكدس شاتات (FRT 18m)' : 'Uptime 99.9%'
    }
  ];

  // 4 Hard-Rule Decision Protocols Definition
  const hardRules: HardRuleDecisionItem[] = [
    {
      id: 'rule_ad_kill_ban',
      rule_name_ar: '1. حظر إيقاف الإعلانات (Ad-Kill Ban Protocol)',
      rule_type: 'AD_KILL_BAN',
      condition_trigger: 'إعلان يحقق Outbound CTR عالي (≥ 1.2%) وتكلفة كليك (CPC) طبيعية مع ارتفاع مفاجئ في الـ CPA.',
      strict_directive: 'ممنوع منعاً باتاً إيقاف أو تعديل أي إعلان كسبان الـ CTR بتاعه عالي والـ CPC طبيعي لمجرد إن الـ CPA رفع، إلا بعد فحص الـ 7 عوامل الخارجية.',
      is_active: true,
      status_badge: 'حظر صارم (قاطع ومفعل)',
      execution_steps: [
        'تحقق أولاً من سلامة الإعلان: طالما الإعلان يجلب مهتمين بكلفة مقبولة، فالإعلان غير مجهد.',
        'افحص قائمة الـ 7 عوامل الخارجية (دورة الرواتب، عروض المنافسين، سرعة الرد، إلخ).',
        'إذا كان السبب خارجياً أو تشغيلياً، يُحظر إيقاف الإعلان أو تغيير الكريتيف وتوجه المعالجة للسبب الجذري.'
      ],
      stakeholder_actions: {
        media_buyer: 'تجميد قرار الإيقاف والامتناع عن التعديل في إعدادات الحملة الناجحة.',
        sales_rep: 'التركيز على بناء القيمة في الشات وسرعة الرد دون تبرير ضعف الإغلاق بالإعلان.',
        operations: 'فحص فوري للمخزون ومعدلات التوصيل لتقديم تقرير للميديا باير.'
      }
    },
    {
      id: 'rule_competitor_strike',
      rule_name_ar: '2. الرد على المنافسين (Competitor Counter-Strike)',
      rule_type: 'COMPETITOR_COUNTER_STRIKE',
      condition_trigger: 'ارتفاع الـ CPA ناتج عن إطلاق منافس لعرض جديد أو خصم كبير في Meta Ad Library.',
      strict_directive: 'سيب الإعلان والكريتيف زي ما هما، ونزل فوراً "عرض مضاد" في الكابشن والإنبوكس (شحن مجاني أو هدية مكملة).',
      is_active: isCompetitorAttack,
      status_badge: isCompetitorAttack ? 'مفعل الآن (حالة منافسة)' : 'جاهز للتفعيل الفوري',
      execution_steps: [
        'إبقاء الفيديو والكريتيف الناجح شغال دون المساس بخوارزمية ميتا.',
        'تعديل نص الكابشن (Ad Copy) بإضافة "عرض الشحن المجاني لأول 50 عميلة اليوم".',
        'تزويد سيلز الإنبوكس فوراً بـ "عرض المقاومة": (عرض هدية مكملة كالسيروم أو الماسك عند طلب الروتين).'
      ],
      stakeholder_actions: {
        media_buyer: 'تحديث الكابشن بالعرض المضاد فقط دون تكرار إنشاء حملة جديدة.',
        sales_rep: 'استخدام سكريبت المقارنة وإبراز جودة المنتج مع تقديم الهدية المكملة.',
        operations: 'تجهيز الهدايا المكملة وربطها ببوليصة الشحن مع التأكيدات.'
      }
    },
    {
      id: 'rule_mid_month_trap',
      rule_name_ar: '3. مصيدة منتصف الشهر (Mid-Month Payday Trap)',
      rule_type: 'MID_MONTH_PAYDAY_TRAP',
      condition_trigger: 'التاريخ يقع بين يوم 15 ويوم 25 في الشهر مع شح السيولة وانخفاض القوة الشرائية.',
      strict_directive: 'بين يوم 15 و 25، جمد الميزانية الإعلانية (بدون تخفيض أو إيقاف)، وحول سكريبت السيلز في الإنبوكس لنظام "الحجز المسبق مع المرتب" لتسليم الأوردرات يوم 1 في الشهر.',
      is_active: isMidMonthTrap,
      status_badge: isMidMonthTrap ? 'مفعل حالياً (فترة شح سيولة)' : 'جاهز للمنتصف القادم',
      execution_steps: [
        'تجميد الميزانية الإعلانية (لا تزيد ولا تقلل) للحفاظ على مرحلة تعلم الخوارزمية.',
        'تفعيل سكريبت الحجز المسبق: "احجزي الباكدج بسعر العرض النهاردة ونوصلهالك يوم 1 مع المرتب!".',
        'تسجيل أوردرات الحجز في شيت منفصل وتأكيد موعد الشحن الدقيق يوم 1-3 في الشهر.'
      ],
      stakeholder_actions: {
        media_buyer: 'تثبيت الميزانيات ومنع التكبير التوسعي حتى انتهاء فترة الـ 25 من الشهر.',
        sales_rep: 'التحول التام لسكريبت الحجز المسبق والتأكيد على حجز الخصم لحين الراتب.',
        operations: 'جدولة بوالص الشحن بتاريخ تسليم 1-5 في الشهر القادم لتفادي المرتجعات.'
      }
    },
    {
      id: 'rule_operational_bottleneck',
      rule_name_ar: '4. المعوقات التشغيلية (Operational Bottleneck Directive)',
      rule_type: 'OPERATIONAL_BOTTLENECK',
      condition_trigger: 'تأخر رد السيلز في الشات عن 5 دقائق أو حدوث نقص مفاجئ في المخزون والعبوات.',
      strict_directive: 'لو رد السيلز تأخر عن 5 دقائق أو حصل نقص في المخزون، خفض الميزانية الإعلانية 30% مؤقتاً لحماية الفلوس، ورجعها تاني فور انتظام التشغيل من غير ما تحرق الإعلان.',
      is_active: isOperationalBottleneck,
      status_badge: isOperationalBottleneck ? 'إجراء وقائي مطلوب (تخفيض 30%)' : 'التشغيل منتظم وسلس',
      execution_steps: [
        'تخفيض الميزانية الإعلانية بنسبة 30% فوراً لمنع حرق الميزانية على عملاء لن يتلقوا رداً سريعاً.',
        'استدعاء شفت طوارئ أو تفريغ شاتات التكدس واستكمال نواقص المخزون.',
        'إعادة الميزانية فوراً لكامل قيمتها بمجرد عودة سرعة الرد لأقل من 5 دقائق.'
      ],
      stakeholder_actions: {
        media_buyer: 'تخفيض الميزانية 30% مؤقتاً عبر الداشبورد وإعادتها فور إشارة قسم العمليات.',
        sales_rep: 'تصفية الشاتات المتراكمة فوراً والالتزام بوقت رد أقل من 5 دقائق.',
        operations: 'تأمين المخزون الناقص وحل أي معوقات لوجستية بشكل عاجل.'
      }
    }
  ];

  return (
    <div id="layer5-external-signals-container" className="space-y-6 text-slate-900 font-sans dir-rtl" dir="rtl">
      
      {/* LAYER 5 TOP EXECUTIVE BANNER */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-md border border-slate-800 relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
        
        {/* Header Title & Tags */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Layer 5: External Signals & Strict Decision Rules</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>بروتوكول حماية الحملات من الإيقاف العشوائي</span>
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold font-headline tracking-tight text-white flex items-center gap-2.5">
              <span>اللاير الخامس: فحص العوامل الخارجية وقواعد القرارات الصارمة</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-4xl leading-relaxed">
              <strong className="text-amber-300 font-bold">الهدف الأساسي:</strong> حماية الحملات الإعلانية الناجحة من الإيقاف العشوائي؛ يُحظر تماماً تعديل أو إيقاف أي إعلان كسبان لمجرد إن الـ CPA رفع فجأة، إلا بعد مراجعة الـ 7 عوامل الخارجية واتباع بروتوكول القرارات الصارمة.
            </p>
          </div>

          {/* Ad-Kill Ban Protection Status Card */}
          <div className="bg-slate-800/90 border border-amber-500/40 rounded-xl p-4 shrink-0 flex items-center gap-3.5 shadow-lg min-w-[260px]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wider block">
                حالة حظر الإيقاف (Ad-Kill Ban)
              </span>
              <span className="text-xs font-extrabold font-headline text-white block mt-0.5">
                مفعل بصرامة (Ad-Kill Ban Active)
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                ممنوع إيقاف أي إعلان ذو CTR عالي
              </span>
            </div>
          </div>
        </div>

        {/* Real-Time External Status Indicators Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Card 1: Payday & Liquidity */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-headline font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>دورة الرواتب والسيولة</span>
              </span>
              <span className="font-mono text-[11px] text-indigo-300 font-bold">اليوم {currentDay}</span>
            </div>
            <div className={`font-bold font-headline text-xs ${isMidMonthTrap ? 'text-amber-400' : isPaydayWindow ? 'text-emerald-400' : 'text-slate-200'}`}>
              {isMidMonthTrap ? 'فترة شح سيولة (15-25)' : isPaydayWindow ? 'فترة قبض ورواتب (1-5)' : 'دورة إنفاق اعتيادية'}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isMidMonthTrap ? 'تفعيل الحجز المسبق لتسليم أول الشهر' : 'استقرار التحويل والطلب'}
            </p>
          </div>

          {/* Card 2: Competitor Radar */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-headline font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>مكتبة إعلانات ميتا</span>
              </span>
              <span className="font-mono text-[11px] text-blue-300 font-bold">Ad Library</span>
            </div>
            <div className={`font-bold font-headline text-xs ${isCompetitorAttack ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isCompetitorAttack ? 'رصد عرض منافس جديد' : 'مستقر - لا توجد عروض مهددة'}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {isCompetitorAttack ? 'تجهيز عرض مضاد في الكابشن والإنبوكس' : 'التفتيش الصباحي مكتمل'}
            </p>
          </div>

          {/* Card 3: Inventory & Logistics */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-headline font-bold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-400" />
                <span>المخزون واللوجستيات</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-300 font-bold">Stock Check</span>
            </div>
            <div className={`font-bold font-headline text-xs ${activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'نقص في عبوات الروتين' : 'مخزون مكتمل (21 يوماً)'}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'تخفيض 30% مؤقت للميزانية' : 'جاهزية تامة للشحن الفوري'}
            </p>
          </div>

          {/* Card 4: Technical & SLA Speed */}
          <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-headline font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>سرعة استجابة السيلز</span>
              </span>
              <span className="font-mono text-[11px] text-purple-300 font-bold">FRT Speed</span>
            </div>
            <div className={`font-bold font-headline text-xs ${activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'text-rose-400' : 'text-emerald-400'}`}>
              {activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'بطء رد (> 18 دقيقة)' : 'سرعة ممتازة (< 5 دقائق)'}
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              {activeScenario === 'OPERATIONAL_BOTTLENECK' ? 'تكدس رسائل يتطلب شفت طوارئ' : 'استجابة سريعة تحافظ على التحويل'}
            </p>
          </div>
        </div>

      </div>

      {/* SIMULATION & SCENARIO TESTING CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold font-headline text-slate-900">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>محاكي اختبار الإشارات الخارجية والقرارات الصارمة (External Signals Live Simulator):</span>
          </div>
          <span className="text-[11px] text-slate-500 font-sans">
            اختر سيناريو لمشاهدة استجابة النظام وتطبيق قواعد القرارات الصارمة فورياً
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-headline">
          <button
            onClick={() => setActiveScenario('LIVE')}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'LIVE'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>البيانات الحية الافتراضية (Live)</span>
          </button>

          <button
            onClick={() => setActiveScenario('MID_MONTH_TRAP')}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'MID_MONTH_TRAP'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>سيناريو 1: شح سيولة منتصف الشهر (يوم 19)</span>
          </button>

          <button
            onClick={() => setActiveScenario('COMPETITOR_ATTACK')}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'COMPETITOR_ATTACK'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>سيناريو 2: هجوم عرض منافس بخصم 30%</span>
          </button>

          <button
            onClick={() => setActiveScenario('OPERATIONAL_BOTTLENECK')}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'OPERATIONAL_BOTTLENECK'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>سيناريو 3: معوقات تشغيلية (بطء رد السيلز / نقص مخزون)</span>
          </button>

          <button
            onClick={() => setActiveScenario('PAYDAY_WINDOW')}
            className={`px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeScenario === 'PAYDAY_WINDOW'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>سيناريو 4: أيام صرف المرتبات (يوم 2 في الشهر)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: THE 7 EXTERNAL SIGNALS CHECKLIST */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="space-y-1">
            <h2 className="text-base md:text-lg font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>قائمة فحص الإشارات الخارجية الـ 7 (External Signals Checklist)</span>
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              يجب التحقق من الـ 7 إشارات التالية بالترتيب قبل إصدار أي حكم على أداء الإعلانات أو المساس بالميزانية.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-indigo-50 border border-indigo-200 text-indigo-900 px-3 py-1 rounded-lg self-start md:self-auto">
            7 / 7 Signals Monitored
          </span>
        </div>

        {/* Grid of 7 Signal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((sig, idx) => {
            const isAlert = sig.status === 'ALERT';
            const isWarning = sig.status === 'WARNING';
            const isExpanded = expandedSignal === sig.id;

            return (
              <div
                key={sig.id}
                className={`rounded-xl border p-4.5 space-y-3.5 transition-all flex flex-col justify-between shadow-2xs ${
                  isAlert
                    ? 'bg-rose-50/70 border-rose-300'
                    : isWarning
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  {/* Top Header of Signal Card */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs md:text-sm font-extrabold font-headline text-slate-900 leading-snug">
                      {sig.name_ar}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                        isAlert
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isWarning
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {isAlert ? 'إنذار حرج' : isWarning ? 'تحذير متابعة' : 'سليم وآمن'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {sig.description}
                  </p>

                  {/* Finding Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200/90 text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="font-bold text-slate-700">النتيجة والرصد الحالي:</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-bold">{sig.metrics_tag}</span>
                    </div>
                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                      {sig.current_finding}
                    </p>
                  </div>
                </div>

                {/* Directive & Source */}
                <div className="space-y-2 pt-2 border-t border-slate-200/70">
                  <div className="text-[11px] text-indigo-900 bg-indigo-50/80 p-2 rounded border border-indigo-100 leading-relaxed font-sans">
                    <strong className="font-headline font-bold block mb-0.5">التوجيه الفوري:</strong>
                    <span>{sig.recommended_action}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>مصدر التفتيش: {sig.inspection_source}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: HARD-RULE DECISION PROTOCOL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-2">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-rose-600" />
              <span>بروتوكول اتخاذ القرارات الصارمة (Hard-Rule Decision Protocol)</span>
            </div>
            <h2 className="text-base md:text-xl font-extrabold font-headline text-slate-900">
              قواعد الإلزام التنفيذية الأربعة (Strict Operational Mandates)
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              قواعد لا تقبل الاجتهاد الشخصي، وتلزم كلاً من الميديا باير وسيلز الشات والعمليات بخطوات تنفيذ محددة.
            </p>
          </div>

          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg self-start md:self-auto border border-slate-200">
            4 Mandatory Rules
          </span>
        </div>

        {/* 4 Hard Rules Detailed Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {hardRules.map((rule) => {
            const isBan = rule.rule_type === 'AD_KILL_BAN';
            const isStrike = rule.rule_type === 'COMPETITOR_COUNTER_STRIKE';
            const isTrap = rule.rule_type === 'MID_MONTH_PAYDAY_TRAP';
            const isBottleneck = rule.rule_type === 'OPERATIONAL_BOTTLENECK';

            return (
              <div
                key={rule.id}
                className={`rounded-xl border p-5 space-y-4 shadow-2xs flex flex-col justify-between ${
                  rule.is_active
                    ? isBan
                      ? 'bg-amber-50/50 border-amber-300'
                      : isStrike
                        ? 'bg-rose-50/50 border-rose-300'
                        : isTrap
                          ? 'bg-indigo-50/50 border-indigo-300'
                          : 'bg-purple-50/50 border-purple-300'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Rule Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wide">
                        {rule.rule_type}
                      </span>
                      <h3 className="text-sm md:text-base font-extrabold font-headline text-slate-900">
                        {rule.rule_name_ar}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border shrink-0 ${
                        rule.is_active
                          ? 'bg-slate-900 text-white border-slate-800 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {rule.status_badge}
                    </span>
                  </div>

                  {/* Trigger Condition Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs font-sans space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">شرط التفعيل (Trigger):</span>
                    <p className="text-slate-700 font-medium text-[11px]">
                      {rule.condition_trigger}
                    </p>
                  </div>

                  {/* Strict Directive Box */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-bold font-headline">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>النص الصارم للقاعدة (Mandatory Directive):</span>
                    </div>
                    <p className="text-xs text-slate-100 font-sans leading-relaxed">
                      {rule.strict_directive}
                    </p>
                  </div>

                  {/* Execution Roadmaps Steps */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold font-headline text-slate-800 block">خطوات التنفيذ الإلزامية:</span>
                    <ul className="space-y-1.5 text-xs text-slate-600 font-sans">
                      {rule.execution_steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Stakeholder Action Breakdown */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs pt-3">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block border-b border-slate-100 pb-1">
                    توزيع الأدوار التنفيذية (Role Distribution):
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-sans">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 space-y-0.5">
                      <strong className="text-indigo-900 font-headline font-bold block">الميديا باير:</strong>
                      <span className="text-slate-600 leading-tight block">{rule.stakeholder_actions.media_buyer}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 space-y-0.5">
                      <strong className="text-emerald-900 font-headline font-bold block">سيلز الشات:</strong>
                      <span className="text-slate-600 leading-tight block">{rule.stakeholder_actions.sales_rep}</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100 space-y-0.5">
                      <strong className="text-purple-900 font-headline font-bold block">العمليات والمخزن:</strong>
                      <span className="text-slate-600 leading-tight block">{rule.stakeholder_actions.operations}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: EXECUTIVE SUMMARY & 24H ACTION MATRIX */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold font-headline text-white">
            خطة العمل الموحدة لـ 24 ساعة (Unified 24h Action Protocol)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold font-headline text-xs">
              <Briefcase className="w-4 h-4" />
              <span>مهام الميديا باير (Media Buyer)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>• مراجعة مكتبة إعلانات ميتا (Meta Ad Library) يومياً الساعة 9 صباحاً.</li>
              <li>• حظر تام لإيقاف أي إعلان نسبة الـ CTR &gt; 1.2% وتكلفة الكليك طبيعية.</li>
              <li>• إضافة العرض المضاد في الكابشن فقط عند رصد هجوم منافس.</li>
              <li>• تخفيض 30% مؤقتاً فقط في حالة إشعار بطء رد السيلز أو نقص المخزون.</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold font-headline text-xs">
              <Users className="w-4 h-4" />
              <span>مهام سيلز الشات (Chat Sales Team)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>• تفعيل سكريبت "الحجز المسبق مع المرتب" خلال فترة 15-25 في الشهر.</li>
              <li>• تقديم الهدايا المكملة كعرض مضاد للعميل المتردد أو المقارن بمنافس.</li>
              <li>• الحفاظ على سرعة الرد (FRT &lt; 5 دقائق) لتفادي تنبيه المعوقات التشغيلية.</li>
              <li>• تطبيق بروتوكول بناء القيمة قبل السعر (VBP &gt; 80%).</li>
            </ul>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold font-headline text-xs">
              <Truck className="w-4 h-4" />
              <span>مهام العمليات واللوجستيات (Operations)</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <li>• جرد يومي لعبوات الروتين وإشعار الفريق قبل وصول الرصيد لأقل من 50 قطعة.</li>
              <li>• جدولة بوالص شحن الحجز المسبق للتسليم الفوري أيام 1-3 في الشهر.</li>
              <li>• متابعة زمن توصيل الشحنات والتأكد من استقرار أسعار الشحن للمحافظات.</li>
              <li>• إرسال تنبيه فوري في حالة حدوث أي عطل في سيرفرات الشات أو الواتساب.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
