import React from 'react';
import { AuditPayload, AuditResult, Layer2ChatKpi, ChatLeakDiagnostic } from '../types';
import { 
  Stethoscope, 
  MessageSquare, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Zap, 
  FileCheck,
  Award,
  AlertCircle,
  HelpCircle,
  Target,
  UserCheck,
  Check,
  X,
  Megaphone,
  Briefcase,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { PerformanceAnalytical } from './PerformanceAnalytical';
import { DiagnosticNoteCard } from './DiagnosticNoteCard';

interface DiagnosisTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({ payload, auditResult }) => {
  const l2 = auditResult.layer2_diagnostic;
  const { backend_sheet } = payload;

  const rawOrders = backend_sheet.raw_orders || 0;
  const confirmed = backend_sheet.confirmed_orders || 0;
  const cancelled = backend_sheet.cancelled_fake_orders || 0;
  const delivered = backend_sheet.delivered_orders || 0;
  const salesPurchaseCvr = auditResult.raw_calculated_metrics?.sales_purchase_cvr ?? '0%';

  // Defaults if l2 is pending
  const chatKpis: Layer2ChatKpi[] = l2?.chat_kpis || [
    {
      id: 'kpi_click_to_chat',
      name: 'Click-to-Chat Rate',
      description: 'نسبة الرسائل الفعليه المستلمة بالداشبورد مقارنة بـ Outbound Clicks من ميتا.',
      value: 76.5,
      unit: '%',
      healthy_range: 'أعلى من 70%',
      red_flag_threshold: 'أقل من 50%',
      status: 'HEALTHY'
    },
    {
      id: 'kpi_frt',
      name: 'First Response Time (FRT)',
      description: 'الوقت اللي بيستغرقه السيلز للرد على أول رسالة من العميل.',
      value: 18.5,
      unit: 'دقيقة',
      healthy_range: 'أقل من 5 - 10 دقائق (خلال الشفت)',
      red_flag_threshold: 'أكبر من 15 دقيقة',
      status: 'RED_FLAG'
    },
    {
      id: 'kpi_qualified_rate',
      name: 'Qualified Lead Rate %',
      description: 'نسبة العملاء المستهدفين فعلاً والجاهزين للشراء من إجمالي الرسائل.',
      value: 65.7,
      unit: '%',
      healthy_range: 'من 50% لـ 70%+',
      red_flag_threshold: 'أقل من 30%',
      status: 'HEALTHY'
    },
    {
      id: 'kpi_chat_cvr',
      name: 'Chat Conversion Rate (CVR)',
      description: 'نسبة المحادثات التي انتهت بأوردر مقفول (Closed Orders ÷ Actual Chats).',
      value: 8.5,
      unit: '%',
      healthy_range: 'من 15% لـ 25%+',
      red_flag_threshold: 'أقل من 10%',
      status: 'RED_FLAG'
    },
    {
      id: 'kpi_followup_cvr',
      name: 'Follow-up Close Rate',
      description: 'نسبة الأوردرات المقفولة اللي جأت من رسائل المتابعة (بعد 24/48 ساعة).',
      value: 2.1,
      unit: '%',
      healthy_range: 'تشكل 15% - 20% من إجمالي المبيعات',
      red_flag_threshold: '0% (مفيش سيستم متابعة شغال إطلاقاً)',
      status: 'RED_FLAG'
    },
    {
      id: 'kpi_cpa_closed',
      name: 'Cost Per Closed Order (CPA)',
      description: 'تكلفة الإعلان المقسومة على الأوردرات المقفولة فعلياً من الشات.',
      value: 335.5,
      unit: 'ج.م',
      healthy_range: 'أقل من الـ Break-even CPA',
      red_flag_threshold: 'أعلى من سعر التكلفة المسموح به',
      status: 'WARNING'
    }
  ];

  const chatLeaks: ChatLeakDiagnostic[] = l2?.chat_leaks || [
    {
      id: 'leak_click_to_chat',
      leak_name: 'Click-to-Chat Leak',
      leak_name_ar: 'تسريب فتح المحادثة (Click-to-Chat Leak)',
      cause: 'العميل بيدوس على الإعلان بس مش بيبعت رسالة الـ Start.',
      condition: 'Outbound Clicks عالية في ميتا ولكن Actual Chats أقل من 60% منها.',
      is_triggered: false,
      diagnosis: 'معدل فتح الشات ممتازة (76.5% > 70%)، لا يوجد تسريب تقني في زر الواتساب.',
      sales_action: 'الحفاظ على نموذج الرسالة التلقائية البسيطة بنقرة واحدة.',
      media_buyer_action: 'متابعة كفاءة رابط التوجيه والتأكد من فتح الشات المباشر دون هبوط.'
    },
    {
      id: 'leak_speed',
      leak_name: 'Speed Leak',
      leak_name_ar: 'تسريب بطء الرد (Speed Leak)',
      cause: 'العميل بيبعت والرد بياخد وقت طويل.',
      condition: 'معدل الـ FRT أعلى من 15 دقيقة (الحالي: 18.5 دقيقة).',
      is_triggered: true,
      diagnosis: 'السيلز مضغوط، أو الشفت مش متغطي صح، أو الإعلان بيصرف ميزانية في أوقات السيلز مش متواجد فيها.',
      sales_action: 'إعادة توزيع الشفتات لضمان وجود سيلز متفرغ، وتحديد تنبيهات صوتية عند وصول رسالة جديدة.',
      media_buyer_action: 'تعديل جدول أوقات عرض الإعلان (Ad Scheduling) ليطابق شفتات السيلز، أو تشغيل بوت ترحيب آلي.'
    },
    {
      id: 'leak_lead_quality',
      leak_name: 'Lead Quality Leak',
      leak_name_ar: 'تسريب جودة الليدات (Lead Quality Leak)',
      cause: 'الرسائل كتير بس العميل بيكتب "بكام" ويختفي أول ما يعرف السعر.',
      condition: 'Qualified Lead Rate أقل من 30%.',
      is_triggered: false,
      diagnosis: 'جودة الليدات جيدة جداً (65.7% Qualified)، الجمهور المستهدف يستطيع شراء المنتج.',
      sales_action: 'استغلال اهتمام الجمهور المستهدف للتعمق في الفوائد.',
      media_buyer_action: 'الاستمرار بنفس زوايا الاستهداف الناجحة في ميتا.'
    },
    {
      id: 'leak_price_shock',
      leak_name: 'Price Shock / Script Leak',
      leak_name_ar: 'صدمة السعر والسكريبت (Price Shock / Script Leak)',
      cause: 'العميل مهتم وجاد، بس السيلز بيرمي السعر في أول المحادثة قبل ما يوضح قيمة المنتج (Value).',
      condition: 'Qualified Lead Rate ممتازة (65.7% >= 60%) ولكن Chat CVR ضعيفة (8.5% < 10%).',
      is_triggered: true,
      diagnosis: 'سكريبت البيع ضعيف، السيلز بيتعامل كـ "مُجيب آلي" بيدي السعر وخلاص، بدون إظهار صور حقيقية أو معالجة الاعتراضات.',
      sales_action: 'تعديل سكريبت البيع فوراً ➔ منع إعطاء السعر في أول رسالة، وإجبار السيلز على إبراز الفوائد ورأي العملاء السابقين أولاً.',
      media_buyer_action: 'تزويد فريق السيلز بمواد بصرية جديدة وفيديوهات معاينة لاستخدامها في إقناع الشات.'
    },
    {
      id: 'leak_no_followup',
      leak_name: 'No Follow-up Leak',
      leak_name_ar: 'غياب سيستم المتابعة (No Follow-up Leak)',
      cause: 'العميل قال "هفكر وأرد عليك" والسيلز نسي الموضوع.',
      condition: 'نسبة المبيعات من الـ Follow-up شبه معدومة (2.1% < 15%).',
      is_triggered: true,
      diagnosis: 'السيلز يركز فقط على العميل الذي يشتري فوراً، ويهمل 80% من الليدات التي تحتاج تذكير ومتابعة.',
      sales_action: 'تفعيل رسائل متابعة إجبارية بعد 24 ساعة (بعرض مؤقت أو إثبات اجتماعي) وبعد 48 ساعة.',
      media_buyer_action: 'إنشاء حملات إعادة استهداف (Retargeting) مخصصة للعملاء الذين تواصلوا في الشات ولم يشتروا.'
    }
  ];

  const salesTeamTasks = l2?.sales_team_tasks || [
    'تعديل سكريبت البيع فوراً: ممنوع رمي السعر في أول رسالة وإلزام السيلز ببناء القيمة أولاً.',
    'تفعيل سيستم المتابعة (Follow-up) بعد 24 ساعة وبعد 48 ساعة لاسترداد 15-20% من المبيعات المفقودة.',
    'تحويل 70% من المحادثات الجديدة فوراً إلى أحمد مصطفى (Top Rep)، وإعادة تدريب محمود طارق.',
    'إلزام السيلز بالرد خلال أقل من 10 دقائق لتجنب تآكل التحويل الزمني (Conversion Decay).'
  ];

  const mediaBuyerTasks = l2?.media_buyer_tasks || [
    'ضبط مواعيد تشغيل الإعلانات (Ad Scheduling) لتتوافق بدقة مع شفتات تفرغ السيلز.',
    'إنشاء حملة إعادة استهداف (Retargeting) مخصصة للعملاء الذين تواصلوا في الشات ولم يكملوا الطلب.',
    'تزويد السيلز بمواد بصرية وفيديوهات معاينة حقيقية لإرسالها أثناء الشات لزيادة الثقة.'
  ];

  const microFunnel = l2?.chat_micro_funnel || {
    total_incoming_messages: 1710,
    greeting_responded_customers: 1320,
    greeting_engagement_rate: 77.2,
    interactive_customers: 1320,
    price_inquiry_customers: 1020,
    price_inquiry_rate: 77.3,
    serious_qualified_customers: 867,
    offer_reached_customers: 578,
    offer_dropped_rate: 66.7,
    shipping_info_provided_customers: 210,
    closed_orders: 145,
    checkout_intent_rate: 69.0,
    checkout_intent_drop: 31.0
  };

  const slaData = l2?.time_decay_sla || {
    total_chats: 1710,
    delayed_chats_over_15m: 410,
    sla_breach_rate: 24.0,
    avg_frt_minutes: 18.5,
    decay_category: '50%_DECAY' as const,
    potential_conversion_percentage: 50.0,
    dead_leads_count: 240
  };

  const repVariance = l2?.sales_rep_variance || {
    reps: [
      { rep_id: 'REP-01', rep_name: 'أحمد مصطفى (Top Rep)', assigned_leads: 600, closed_orders: 132, cvr_percentage: 22.0, avg_frt_minutes: 2.8, status: 'TOP' as const },
      { rep_id: 'REP-02', rep_name: 'محمود طارق (Needs Training)', assigned_leads: 580, closed_orders: 23, cvr_percentage: 3.9, avg_frt_minutes: 22.4, status: 'NEEDS_TRAINING' as const },
      { rep_id: 'REP-03', rep_name: 'سارة علي (Avg Rep)', assigned_leads: 530, closed_orders: 68, cvr_percentage: 12.8, avg_frt_minutes: 8.1, status: 'AVERAGE' as const }
    ],
    top_rep_cvr: 22.0,
    lowest_rep_cvr: 3.9,
    rep_deviation: 18.1,
    is_high_variance: true,
    verdict: 'انحراف ضخم في أداء السيلز (18.1% > 15%). المشكلة ليست في الحملة أو الجمهور، بل في تفاوت تنفيذ سيلز محدد (محمود طارق: 3.9% CVR مقترن ببطء رد 22.4 دقيقة).'
  };

  const objections = l2?.objection_breakdown || [
    {
      objection_type: 'Price Objection' as const,
      label_ar: 'اعتراض على السعر (Price Objection)',
      percentage: 52.0,
      threshold_percentage: 45.0,
      exceeded_threshold: true,
      diagnosis: 'صدمة سعر / استهداف فئة غير مناسبة أو إرسال الرقم قبل بناء القيمة.',
      executive_action: 'تعديل سكريبت الرد لتأخير إظهار السعر للرسالة الثالثة مع إبراز الفائدة الفورية.'
    },
    {
      objection_type: 'Shipping & Delivery' as const,
      label_ar: 'مصاريف ومواعيد الشحن (Shipping & Delivery)',
      percentage: 28.0,
      threshold_percentage: 25.0,
      exceeded_threshold: true,
      diagnosis: 'مشكلة في تكلفة أو بطء وقت الشحن لدى العميل.',
      executive_action: 'إضافة عرض "شحن مجاني أو مخفض" عند الوصول لطلاَب أوردر محدد.'
    },
    {
      objection_type: 'Trust / Product Proof' as const,
      label_ar: 'الخوف من الجودة والنصب (Trust / Product Proof)',
      percentage: 12.0,
      threshold_percentage: 20.0,
      exceeded_threshold: false,
      diagnosis: 'معدل طبيعي للمخاوف الاعتيادية.',
      executive_action: 'إلزام السيلز بإرسال صور وفيديوهات حقيقية من المعاينات.'
    },
    {
      objection_type: 'Competitor Match' as const,
      label_ar: 'مقارنة مع منافس (Competitor Match)',
      percentage: 8.0,
      threshold_percentage: 15.0,
      exceeded_threshold: false,
      diagnosis: 'معدل متزن مقارنة بالسوق.',
      executive_action: 'تزويد السيلز بشيت مقارنة سريع (Comparison Sheet) لمميزاتنا.'
    }
  ];

  const masterRules = l2?.master_rules || [
    {
      rule_id: 'RULE_1_SLA',
      rule_name: '1. خرق SLA الزمني (SLA Breach > 20%)',
      condition_text: `SLA Breach Rate = ${slaData.sla_breach_rate}% (> 20%)`,
      condition_met: slaData.sla_breach_rate > 20,
      leak_label: 'Operational Delay Leak (تسريب بطء الاستجابة والخرق الزمني)',
      action_plan: 'إيقاف صرف الإعلانات في الساعات التي يزيد فيها الـ SLA Breach، أو إعادة توزيع الشفتات فوراً.'
    },
    {
      rule_id: 'RULE_2_REP_VARIANCE',
      rule_name: '2. تشتت أداء فريق المبيعات (Rep Deviation > 15%)',
      condition_text: `Rep Deviation = ${repVariance.rep_deviation}% (> 15%)`,
      condition_met: repVariance.is_high_variance,
      leak_label: 'Sales Team Execution Variance (تشتت أداء فريق المبيعات)',
      action_plan: 'عدم تغيير إعلانات ميتا. تحويل 70% من الليدات للسيلز الأعلى أداءً (أحمد مصطفى)، وإعادة تدريب السيلز الضعيف.'
    },
    {
      rule_id: 'RULE_3_PRICE_VALUE',
      rule_name: '3. فجوة السعر والقيمة (Price Objection > 50% & Qualified > 60%)',
      condition_text: 'Price Objection = 52.0% (> 50%) & Qualified Lead Rate = 65.7% (> 60%)',
      condition_met: true,
      leak_label: 'Value-to-Price Messaging Gap (فجوة القيمة مقابل السعر)',
      action_plan: 'السيلز يفشل في بناء القيمة قبل رمي الرقم. تعديل الهيكل العريض لسكريبت الرد لتأخير السعر للرسالة الثالثة.'
    },
    {
      rule_id: 'RULE_4_CLOSING_FRICTION',
      rule_name: '4. عقبات إغلاق الأوردر (Checkout Intent Drop > 30%)',
      condition_text: `Checkout Intent Drop = ${microFunnel.checkout_intent_drop}% (> 30%)`,
      condition_met: microFunnel.checkout_intent_drop > 30,
      leak_label: 'Friction at Closing Step (عقبات وتشتيت في خطوة إغلاق الأوردر)',
      action_plan: 'معالجة طريقة طلب بيانات الشحن (تقليل الأسئلة المطلوبة وتبسيط فورمة الشحن).'
    }
  ];

  return (
    <div className="space-y-6 text-slate-900 dir-rtl text-right font-sans">
      {/* Interactive 3-Line Diagnostic Note Card Pinned */}
      <DiagnosticNoteCard auditResult={auditResult} payload={payload} />

      {/* Layer 2 Title & Executive Status Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 font-extrabold text-xs font-mono border border-purple-200">
                Layer 2
              </span>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-headline flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-purple-700" />
                <span>المبيعات وشات الواتساب (Sales & Chat Operations Engine)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-sans">
              تحليل داتا الشات، قياس كفاءة السيلز، أماكن تسريب المحادثة، وتحديد المخرجات الموجهة للمبيعات والميديا باير
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>حالة الشات: الأصفر (Yellow - تسريب سكريبت ومتابعة)</span>
            </span>
          </div>
        </div>

        {/* Executive Summary Diagnosis */}
        <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3" dir="rtl"><p className="text-[10px] font-bold text-indigo-700">Sales Purchase CVR — Layer 2</p><p className="mt-1 text-xl font-black text-indigo-950">{salesPurchaseCvr}</p><p className="text-[10px] text-slate-600">Confirmed Sales Purchases ÷ Chats (مختلف عن Purchase المنصة في Layer 1)</p></div>
        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-purple-950 font-headline flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-700" />
            <span>ملخص تشخيص المبيعات والشات (Executive Chat Diagnosis):</span>
          </h4>
          <p className="text-xs text-purple-900 leading-relaxed font-sans">
            {l2?.summary_diagnosis || 'تسريب المبيعات ينحصر في عاملين رئيسيين: أ) تشتت تنفيذ السيلز، ب) صدمة السعر المبكر بدون بناء قيمة.'}
          </p>
        </div>
      </div>

      {/* Structured 3-Part Executive Output Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5 dir-rtl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-800 text-[11px] font-bold font-mono">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>هيكل الـ Output التنفيذي (Layer 2 Decision Output)</span>
            </div>
            <h3 className="text-base md:text-lg font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <span>تقرير تشخيص الشات والمبيعات (3-Part Executive Output)</span>
            </h3>
          </div>

          {/* Key Metrics Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center text-xs">
            <div className="px-3 py-1 border-l border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">إجمالي الشاتات المستقبلة</span>
              <strong className="text-slate-900 font-mono text-sm font-extrabold">{(payload.chat_data?.actual_received_chats || 0).toLocaleString()}</strong>
            </div>
            <div className="px-3 py-1 border-l border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">الرقم 1: Qualified Rate</span>
              <strong className="text-emerald-700 font-mono text-sm font-extrabold">{(((payload.chat_data?.qualified_leads_count || 860) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%</strong>
            </div>
            <div className="px-3 py-1 border-l border-slate-200">
              <span className="text-[10px] text-slate-500 block font-medium">الرقم 2: Chat CVR</span>
              <strong className="text-amber-700 font-mono text-sm font-extrabold">{(((payload.chat_data?.closed_orders_count || confirmed) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%</strong>
            </div>
            <div className="px-3 py-1">
              <span className="text-[10px] text-slate-500 block font-medium">الأوردرات المقفولة</span>
              <strong className="text-indigo-700 font-mono text-sm font-extrabold">{(payload.chat_data?.closed_orders_count || confirmed).toLocaleString()}</strong>
            </div>
          </div>
        </div>

        {/* 3 Output Parts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          {/* Part 1: Chat Health Status */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-mono text-amber-900 uppercase block font-bold">1. حالة الشات (Chat Health Status)</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-xs">
                <span>🟡 Yellow</span>
                <span>(يحتاج معالجة سكريبت ومتابعة)</span>
              </span>
            </div>
            <p className="text-[11px] text-amber-950/80 leading-relaxed pt-1">
              النظام متزن ولكن يوجد تسريب في تحويل المحادثات بزيادة صدمة السعر وإهمال المتابعة بعد 24 ساعة.
            </p>
          </div>

          {/* Part 2: Leak Location */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-mono text-rose-900 uppercase block font-bold">2. مكان التسريب (Leak Location)</span>
            <div className="font-extrabold text-rose-900 text-xs font-headline flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{chatLeaks.find(l => l.is_triggered)?.leak_name_ar || 'Price Shock / Script Leak'}</span>
            </div>
            <p className="text-[11px] text-rose-950/80 leading-relaxed pt-1">
              {chatLeaks.find(l => l.is_triggered)?.cause || 'السيلز بيرمي السعر في أول المحادثة قبل ما يوضح قيمة المنتج (Value).'}
            </p>
          </div>

          {/* Part 3: Executive Action Plan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <span className="text-[11px] font-mono text-slate-700 uppercase block font-bold">3. الأمر التنفيذي (Executive Action Plan)</span>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                <strong className="text-emerald-700 block font-headline text-xs mb-0.5">خطوة لفريق المبيعات:</strong>
                <span className="text-slate-700 leading-snug">{chatLeaks.find(l => l.is_triggered)?.sales_action || 'تعديل سكريبت الرد لإظهار قيمة المنتج قبل السعر وتفعيل رسائل المتابعة.'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 shadow-2xs">
                <strong className="text-indigo-700 block font-headline text-xs mb-0.5">خطوة للميديا باير:</strong>
                <span className="text-slate-700 leading-snug">{chatLeaks.find(l => l.is_triggered)?.media_buyer_action || 'عدم تعديل الإعلان، تزويد السيلز بمواد بصرية وفيديوهات معاينة لاستخدامها في الشات.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CORE TWO PILLAR METRICS SPOTLIGHT CARD (الرقم الأول والرقم الثاني) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 dir-rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>الركنان الأساسيان لتشخيص كفاءة الشات وحملات الرسائل</span>
            </div>
            <h3 className="text-base md:text-lg font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <span>الرقم الأول (Qualified Rate %) &amp; الرقم الثاني (Chat CVR %)</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-sans max-w-sm">
            المعادلتان الذهبيتان للفصل القاطع بين عيب الجمهور/الإعلان وعيب سكريبت ومتابعة السيلز.
          </span>
        </div>

        {/* The Two Metrics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Card 1: Qualified Rate % */}
          <div className="bg-slate-50/70 border border-emerald-300/80 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>الرقم الأول: Qualified Rate %</span>
                </span>
                <h4 className="text-base font-extrabold font-headline text-slate-900">
                  نسبة الليدات الجادة والمطابقة للجمهور
                </h4>
              </div>
              <div className="text-left">
                <span className="text-3xl font-extrabold font-mono text-emerald-700 block">
                  {(((payload.chat_data?.qualified_leads_count || 860) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-emerald-800 block font-mono text-center font-bold bg-emerald-100 px-2 py-0.5 rounded mt-1 border border-emerald-300">
                  {((payload.chat_data?.qualified_leads_count || 860) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100 >= 50 ? 'نطاق صحي (> 50%)' : 'تسريب جودة (< 40%)'}
                </span>
              </div>
            </div>

            {/* How to get it from Inbox / CRM */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs font-sans shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-headline">
                <Target className="w-3.5 h-3.5 text-emerald-700" />
                <span>طريقة استخراج الرقم من الـ Inbox / CRM:</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                افتح الـ Inbox أو الـ CRM وافرز الشاتات بناءً على الـ Tags اللي حطها السيلز (<strong className="text-emerald-800">Qualified</strong> مقابل <strong className="text-rose-700">Unqualified</strong>).
              </p>
            </div>

            {/* Mathematical Formula */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block">المعادلة الحسابية المطبقة:</span>
              <div className="bg-white p-2.5 rounded border border-emerald-200 font-mono text-xs text-center text-emerald-800 font-bold tracking-wide break-words">
                Qualified Rate = (عدد الشاتات الجادة والمطابقة ÷ إجمالي المحادثات المستقبلة) × 100
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center text-[11px] text-emerald-800 font-mono pt-1">
                <span>تطبيق الأرقام: ({((payload.chat_data?.qualified_leads_count || 860)).toLocaleString()} ÷ {((payload.chat_data?.actual_received_chats || 1308)).toLocaleString()}) × 100</span>
                <span className="text-emerald-700 font-bold">= {(((payload.chat_data?.qualified_leads_count || 860) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Diagnostic Meaning */}
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <strong className="text-slate-800 font-headline block">المعنى التشخيصي:</strong>
              <p>
                يقيس مدى ملاءمة الجمهور القادم من إعلان ميتا للمنتج. لو النسبة &gt; 50% فالاستهداف ممتاز ومستعد للشراء، وأي مشكلة بعد ذلك تكون داخل محادثة السيلز.
              </p>
            </div>
          </div>

          {/* Card 2: Chat CVR % */}
          <div className="bg-slate-50/70 border border-amber-300/80 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-amber-700" />
                  <span>الرقم الثاني: Chat CVR %</span>
                </span>
                <h4 className="text-base font-extrabold font-headline text-slate-900">
                  معدل تحويل الشات لأوردرات مقفولة ومؤكدة
                </h4>
              </div>
              <div className="text-left">
                <span className="text-3xl font-extrabold font-mono text-amber-700 block">
                  {(((payload.chat_data?.closed_orders_count || confirmed) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-amber-900 block font-mono text-center font-bold bg-amber-100 px-2 py-0.5 rounded mt-1 border border-amber-300">
                  {((payload.chat_data?.closed_orders_count || confirmed) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100 >= 15 ? 'نطاق صحي (15%-25%+)' : 'تسريب إغلاق / سكريبت (< 10%)'}
                </span>
              </div>
            </div>

            {/* How to get it from Sales Sheet / Store */}
            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 text-xs font-sans shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold font-headline">
                <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>طريقة استخراج الرقم من شيت المبيعات / المتجر:</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                اطلب من شيت المبيعات أو المتجر إجمالي عدد الأوردرات المقفولة والمؤكدة الناتجة عن أداة الرسائل في نفس الفترة.
              </p>
            </div>

            {/* Mathematical Formula */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5">
              <span className="text-[10px] font-mono text-amber-800 font-bold uppercase block">المعادلة الحسابية المطبقة:</span>
              <div className="bg-white p-2.5 rounded border border-amber-200 font-mono text-xs text-center text-amber-800 font-bold tracking-wide break-words">
                Chat CVR = (عدد الأوردرات المقفولة فعلياً ÷ إجمالي المحادثات المستقبلة) × 100
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center text-[11px] text-amber-800 font-mono pt-1">
                <span>تطبيق الأرقام: ({((payload.chat_data?.closed_orders_count || confirmed)).toLocaleString()} ÷ {((payload.chat_data?.actual_received_chats || 1308)).toLocaleString()}) × 100</span>
                <span className="text-amber-700 font-bold">= {(((payload.chat_data?.closed_orders_count || confirmed) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Diagnostic Meaning */}
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
              <strong className="text-slate-800 font-headline block">المعنى التشخيصي:</strong>
              <p>
                يقيس كفاءة فريق المبيعات في إغلاق الصفقات وتحويل المحادثات لأوردرات مسجلة في الشيت. النطاق الصحي الطبيعي هو 15% - 25%+.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Diagnostic Decision Matrix Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold font-headline text-xs">
            <Zap className="w-4 h-4 text-indigo-700" />
            <span>قاعدة القرار المشترك (Cross-Diagnostic Rule):</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-headline text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الحالة 1: Qualified Rate عالي (&gt; 50%) + Chat CVR واطي (&lt; 10%)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ➔ <strong className="text-slate-900">التشخيص الحتمي:</strong> المشكلة ليست في الإعلان ولا الاستهداف. الخلل داخل الشات (صدمة سعر مبكر، بطء رد، أو غياب المتابعة). الحل: تعديل السكريبت وإلزام السيلز بالمتابعة، ولا تلمس الإعلان!
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-rose-200 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-800 font-bold font-headline text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>الحالة 2: Qualified Rate واطي (&lt; 40%)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ➔ <strong className="text-slate-900">التشخيص الحتمي:</strong> المشكلة في الإعلان والجمهور المستهدف (رسائل فضولية ورخيصة). الحل للميديا باير: توضيح السعر أو الفئة داخل إعلان ميتا لفلترة الفضوليين قبل النقر.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SPOTLIGHT: 1. VBP SCORE & 2. AOV AUDIT */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-6 dir-rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>معايير التقييم التشغيلي لسيلز الشات وقيمة المبيعات</span>
            </div>
            <h3 className="text-base md:text-lg font-extrabold font-headline text-slate-900 flex items-center gap-2">
              <span>مؤشر بناء القيمة (VBP Score) &amp; تدقيق حجم الفاتورة (AOV &amp; Upsell)</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-sans max-w-sm">
            فحص التزام مسؤول المبيعات بعرض فوائد المنتج قبل السعر وتحفيز زيادة سلة الشراء.
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* VBP SCORE CARD */}
          <div className="bg-slate-50/70 border border-indigo-300/80 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-indigo-800 text-[11px] font-bold font-mono uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-indigo-700" />
                  <span>مؤشر تقييم سيلز الشات #1</span>
                </div>
                <h4 className="text-base font-extrabold font-headline text-slate-900">
                  1. VBP Score (Value-Before-Price)
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  يقيس مدى التزام مسؤول المبيعات بتوضيح قيمة المنتج وتشخيص المشكلة قبل إعلان السعر.
                </p>
              </div>

              <div className="text-left shrink-0">
                <span className={`text-3xl font-extrabold font-mono block ${
                  (l2?.vbp_score?.vbp_score_percentage ?? 42) >= 80 ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {(l2?.vbp_score?.vbp_score_percentage ?? 42)}%
                </span>
                <span className="text-[10px] text-indigo-900 font-mono text-center font-bold bg-indigo-100 px-2 py-0.5 rounded mt-1 border border-indigo-300 block">
                  الهدف: $\ge 80\%$
                </span>
              </div>
            </div>

            {/* Audit Logic & Trigger Condition */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs font-sans shadow-2xs">
              <div className="flex items-center justify-between text-indigo-900 font-bold font-headline">
                <span>شرط التفعيل (Trigger):</span>
                <span className="font-mono text-[11px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-bold">
                  سؤال العميلة عن السعر ("بكام؟" / "السعر كام؟")
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                يتم مسح المحادثات بمجرد استفسار العميلة عن السعر، للتحقق مما إذا كان السيلز يلقي بالسعر مباشرة أم يبني القيمة أولاً.
              </p>
            </div>

            {/* Pass vs Fail Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Pass State */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-headline">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>حالة النجاح (Pass / 1)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-emerald-950/80 list-disc list-inside">
                  <li>طرح سؤال تشخيصي عن طبيعة الشعر (هيجان، تساقط، جفاف).</li>
                  <li>شرح الفائدة المباشرة للروتين المناسب لمشكلتها (Value).</li>
                  <li>إعلان السعر في خطوة متأخرة كجزء من حل شامل.</li>
                </ul>
              </div>

              {/* Fail State */}
              <div className="p-3 bg-rose-50/80 border border-rose-300 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold font-headline">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>حالة الفشل (Fail / 0)</span>
                </div>
                <p className="text-[11px] text-rose-950/80 leading-relaxed">
                  إذا قام السيلز بإرسال السعر مباشرة أو إرسال قائمة الأسعار في الرد الأول دون طرح أسئلة تشخيصية أو ذكر فوائد المنتج.
                </p>
                <div className="p-1.5 bg-white rounded border border-rose-200 text-[10px] text-rose-800 font-mono font-bold">
                  النتيجة: صدمة سعر وفقدان العميلة فوراً.
                </div>
              </div>
            </div>

            {/* Real Chat Scenario Comparison */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs shadow-2xs">
              <span className="text-[10px] font-mono text-indigo-900 font-bold uppercase block">نموذج مقارنة عملي في الشات:</span>
              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950">
                  <strong className="text-emerald-800 block font-headline font-bold mb-0.5">✅ الرد الصحيح المعتمد:</strong>
                  <span>العميلة: "بكام الباكدج؟" ➔ السيلز: "أهلاً بك يا فندم! عشان أرشحلك الأنسب ونحل المشكلة من جذورها، ممكن أعرف طبيعة شعرك وهل المشكلة هيجان وتساقط ولا جفاف؟" ➔ توضيح الفائدة ➔ إعلان السعر كحل.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-950">
                  <strong className="text-rose-800 block font-headline font-bold mb-0.5">❌ الرد المرفوض (فشل فوري):</strong>
                  <span>العميلة: "بكام؟" ➔ السيلز: "أهلاً بحضرتك، الباكدج بـ 650 جنيه والشحن مجاني!"</span>
                </div>
              </div>
            </div>
          </div>

          {/* AOV & UPSELLING / CROSS-SELLING AUDIT CARD */}
          <div className="bg-slate-50/70 border border-purple-300/80 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-purple-800 text-[11px] font-bold font-mono uppercase tracking-wide">
                  <ShoppingBag className="w-4 h-4 text-purple-700" />
                  <span>مؤشر حجم الفاتورة والمبيعات #2</span>
                </div>
                <h4 className="text-base font-extrabold font-headline text-slate-900">
                  2. AOV (Average Order Value - متوسط قيمة الأوردر)
                </h4>
                <p className="text-[11px] text-slate-500 font-sans">
                  مؤشر قياس حجم الفاتورة المباشرة المقفولة لكل عميلة وتقييم محاولات الـ Upselling و Cross-selling.
                </p>
              </div>

              <div className="text-left shrink-0">
                <span className="text-3xl font-extrabold font-mono text-purple-700 block">
                  {((l2?.aov_audit?.aov_value ?? 650)).toLocaleString()} <span className="text-sm font-sans text-purple-600">ج.م</span>
                </span>
                <span className="text-[10px] text-purple-900 font-mono text-center font-bold bg-purple-100 px-2 py-0.5 rounded mt-1 border border-purple-300 block">
                  {confirmed} أوردر مقفول
                </span>
              </div>
            </div>

            {/* Mathematical Formula Box */}
            <div className="p-3 bg-violet-50 rounded-lg border border-violet-200 space-y-1.5">
              <span className="text-[10px] font-mono text-violet-800 font-bold uppercase block">المعادلة الرياضية:</span>
              <div className="bg-white p-2.5 rounded border border-violet-200 font-mono text-xs text-center text-violet-800 font-bold tracking-wide break-words">
                AOV = إجمالي إيرادات المبيعات ÷ عدد الأوردرات المقفولة
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-1 sm:items-center text-[11px] text-violet-800 font-mono pt-1">
                <span>تطبيق الأرقام: ({((payload.backend_sheet.average_order_value || 650) * confirmed).toLocaleString()} ج.م ÷ {confirmed} أوردر)</span>
                <span className="text-violet-700 font-bold">= {l2?.aov_audit?.aov_value ?? 650} ج.م</span>
              </div>
            </div>

            {/* Chat-level Audit Logic: Upselling & Cross-selling */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 text-xs font-sans">
              {/* Upselling Evaluation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-purple-900 font-bold font-headline">
                  <span>1. تقييم محاولة الـ Upselling:</span>
                  <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    {l2?.aov_audit?.upsell_attempts_rate ?? 35}% معدل
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  هل حاول السيلز ترقية الشراء من منتج فردي (مثلاً شامبو بـ 250 ج.م) إلى باكدج كاملة (روتين بـ 650 ج.م)؟
                </p>
              </div>

              {/* Cross-selling Evaluation */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-purple-900 font-bold font-headline">
                  <span>2. تقييم محاولة الـ Cross-selling:</span>
                  <span className="font-mono text-[11px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 font-bold">
                    {l2?.aov_audit?.cross_sell_attempts_rate ?? 28}% معدل
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  هل اقترح السيلز منتجاً مكملاً (مثل سيروم حماية أو حمام كريم) بناءً على الاحتياج الذي أبدته العميلة؟
                </p>
              </div>
            </div>

            {/* System Warning Flag */}
            <div className="p-3 bg-rose-50/80 border border-rose-300 rounded-xl flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-rose-900 font-headline">
                    تنبيه السيستم (AOV System Flag):
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-rose-100 border border-rose-300 text-rose-900 text-[10px] font-mono font-bold">
                    {l2?.aov_audit?.single_product_orders_without_upsell ?? 48} أوردر فردي
                  </span>
                </div>
                <p className="text-rose-950/80 text-[11px] leading-relaxed font-sans">
                  إعطاء علامة تنبيه فورية إذا وافق السيلز على إغلاق أوردر لمنتج فردي واحد دون محاولة تقديم عرض باكدج مخصص لرفع قيمة الفاتورة.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: LAYER 2 CORE CHAT KPIS MATRIX */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-700" />
              <span>1. الماتريكس الأساسية المطلوبة لـ Layer 2 (Chat KPIs Matrix)</span>
            </h3>
            <p className="text-xs text-slate-600">
              تحليل المؤشرات الستة الرئيسية لشات الواتساب ومقارنتها بالنطاق الصحي وعلامات الخطر
            </p>
          </div>
        </div>

        {/* Chat KPIs Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-headline font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">الماتريك (Metric)</th>
                <th className="p-3">القيمة الفعالية</th>
                <th className="p-3">النطاق الصحي (Healthy Range)</th>
                <th className="p-3">علامة الخطر (Red Flag)</th>
                <th className="p-3">المعنى التشخيصي والتحليل</th>
                <th className="p-3 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {chatKpis.map((kpi) => (
                <tr key={kpi.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 font-headline">
                    <div>{kpi.name}</div>
                  </td>
                  <td className="p-3 font-mono font-extrabold text-sm">
                    <span className={
                      kpi.status === 'HEALTHY' ? 'text-emerald-700' :
                      kpi.status === 'RED_FLAG' ? 'text-rose-700 font-bold' : 'text-amber-700'
                    }>
                      {kpi.value} {kpi.unit}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-emerald-800 bg-emerald-50/50 rounded">{kpi.healthy_range}</td>
                  <td className="p-3 font-mono text-rose-800 bg-rose-50/50 rounded">{kpi.red_flag_threshold}</td>
                  <td className="p-3 text-slate-700 max-w-xs">{kpi.description}</td>
                  <td className="p-3 text-center">
                    {kpi.status === 'HEALTHY' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> صحي
                      </span>
                    )}
                    {kpi.status === 'RED_FLAG' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                        <X className="w-3 h-3" /> تسريب
                      </span>
                    )}
                    {kpi.status === 'WARNING' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> تنبيه
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: DIAGNOSTIC RULES & FUNNEL LEAK LOCATIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-600" />
              <span>2. قواعد التشخيص وأماكن التسريب جوة الشات (Diagnostic Rules & Funnel Leaks)</span>
            </h3>
            <p className="text-xs text-slate-600">
              ربط أرقام Layer 1 وأرقام Layer 2 للوصول لأماكن الخلل بدقة وتحديد القرار لكل فريق
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {chatLeaks.map((leak) => (
            <div 
              key={leak.id} 
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                leak.is_triggered ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                <div className="flex items-center gap-2">
                  {leak.is_triggered ? (
                    <span className="p-1 rounded-full bg-rose-100 text-rose-700">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <span className="font-extrabold text-xs font-headline text-slate-900">{leak.leak_name_ar}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold font-mono ${
                  leak.is_triggered ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {leak.is_triggered ? 'تسريب نَشِط (Leak Triggered)' : 'وضع طبيعي (Healthy)'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1 bg-white/70 p-2.5 rounded border border-slate-200/80">
                  <p className="text-slate-700 font-sans">
                    <strong className="text-slate-900 font-headline">السبب والشرط:</strong> {leak.cause} ({leak.condition})
                  </p>
                  <p className="text-slate-700 font-sans mt-1">
                    <strong className="text-slate-900 font-headline">التشخيص الحالي:</strong> {leak.diagnosis}
                  </p>
                </div>

                <div className="space-y-1.5 bg-white/90 p-2.5 rounded border border-slate-200/80">
                  <p className="text-purple-900 font-sans font-bold flex items-start gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                    <span><strong>توصية فريق المبيعات (Sales Action):</strong> {leak.sales_action}</span>
                  </p>
                  <p className="text-blue-900 font-sans font-bold flex items-start gap-1.5 border-t border-slate-100 pt-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                    <span><strong>توصية الميديا باير (Media Buyer Action):</strong> {leak.media_buyer_action}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: ACTIONABLE TASKS FOR SALES & MEDIA BUYER */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-700" />
              <span>3. مخرجات التقرير الخاص بـ Layer 2 (Actionable Output Tasks)</span>
            </h3>
            <p className="text-xs text-slate-600">
              توزيع المهام الواضحة والتنفيذية على مدير المبيعات والميديا باير بناءً على التحليل
            </p>
          </div>

          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-bold rounded-full">
            Status: 🟡 Yellow (حاجة لضبط سكريبت ومتابعة)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Sales Team Tasks Box */}
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-purple-200 pb-2">
              <Briefcase className="w-4 h-4 text-purple-700" />
              <h4 className="font-extrabold text-xs text-purple-950 font-headline">
                توصيات فريق المبيعات (Sales Team & Script Actions):
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-purple-900 font-sans">
              {salesTeamTasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{task}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Media Buyer Tasks Box */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-2">
              <Megaphone className="w-4 h-4 text-blue-700" />
              <h4 className="font-extrabold text-xs text-blue-950 font-headline">
                توصيات الميديا باير (Media Buyer Actions):
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-blue-900 font-sans">
              {mediaBuyerTasks.map((task, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4: CHAT MICRO-FUNNEL TRACKING */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-700" />
              <span>4. الميكرو-فانل جوة الشات (Chat Micro-Funnel Tracking)</span>
            </h3>
            <p className="text-xs text-slate-600">
              تقسيم خط سير المحادثة إلى 4 مراحل دقيقة لتحديد تسريب الشات بالظبط
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            إجمالي المحادثات: {microFunnel.total_incoming_messages.toLocaleString()}
          </span>
        </div>

        {/* Micro-Funnel Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 font-headline">Greeting Engagement</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">مرحلة الترحيب</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-700">
              {microFunnel.greeting_engagement_rate}%
            </div>
            <p className="text-[11px] text-slate-600 leading-normal font-sans">
              <strong className="text-slate-800">طريقة الحسبة:</strong> ({microFunnel.greeting_responded_customers.toLocaleString()} / {microFunnel.total_incoming_messages.toLocaleString()}) * 100
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 font-headline">Price Inquiry Rate</span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded">الفضول المالي</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-blue-700">
              {microFunnel.price_inquiry_rate}%
            </div>
            <p className="text-[11px] text-slate-600 leading-normal font-sans">
              <strong className="text-slate-800">طريقة الحسبة:</strong> ({microFunnel.price_inquiry_customers.toLocaleString()} / {microFunnel.interactive_customers.toLocaleString()}) * 100
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 font-headline">Offer Dropped Rate</span>
              <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">تقديم العرض</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-700">
              {microFunnel.offer_dropped_rate}%
            </div>
            <p className="text-[11px] text-slate-600 leading-normal font-sans">
              <strong className="text-slate-800">طريقة الحسبة:</strong> ({microFunnel.offer_reached_customers.toLocaleString()} / {microFunnel.serious_qualified_customers.toLocaleString()}) * 100
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800 font-headline">Checkout Intent Rate</span>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded">إغلاق الأوردر</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-purple-700">
              {microFunnel.checkout_intent_rate}%
            </div>
            <p className="text-[11px] text-slate-600 leading-normal font-sans">
              <strong className="text-slate-800">طريقة الحسبة:</strong> ({microFunnel.closed_orders} / {microFunnel.shipping_info_provided_customers}) * 100
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: TIME-DECAY & SLA RULES */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>5. متغيرات الزمن وتآكل التحويل (Time-Decay & SLA Rules)</span>
            </h3>
            <p className="text-xs text-slate-600">
              قياس الخرق الزمني لتأخير الرد وتحديد تآكل احتمالية البيع (Conversion Decay)
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${slaData.sla_breach_rate > 20 ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800'}`}>
            SLA Breach: {slaData.sla_breach_rate}%
          </span>
        </div>

        {/* SLA Breach Alert Callout */}
        {slaData.sla_breach_rate > 20 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-900 font-headline">
                تحذير خرق زمني مرتفع (SLA Breach Rate = {slaData.sla_breach_rate}% &gt; 20%):
              </h4>
              <p className="text-rose-800 leading-relaxed font-sans">
                هناك {slaData.delayed_chats_over_15m} محادثة تأخر فيها الرد لأكثر من 15 دقيقة! متوسط زمن الرد الأول الحالي هو <strong className="font-mono">{slaData.avg_frt_minutes} دقيقة</strong>، مما يتسبب في حرق الليدات وتراجع احتمالية البيع بنسبة <strong className="font-mono">50% Decay</strong>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: SALES REP VARIANCE ENGINE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-700" />
              <span>6. تحليل تشتت أداء فريق السيلز (Sales Rep Variance Engine)</span>
            </h3>
            <p className="text-xs text-slate-600">
              التفريق بين خلل الإعلان/الجمهور وبين وجود سيلز محدد يحرق الليدات
            </p>
          </div>

          <div className="text-xs font-mono font-bold bg-purple-50 text-purple-900 px-3 py-1 rounded border border-purple-200">
            Rep Deviation = {repVariance.rep_deviation}%
          </div>
        </div>

        {/* Reps Performance Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-headline font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">اسم السيلز (Rep Name)</th>
                <th className="p-3">الليدات المستلمة</th>
                <th className="p-3">الأوردرات المقفولة</th>
                <th className="p-3">معدل التحويل (CVR)</th>
                <th className="p-3">متوسط زمن الرد (FRT)</th>
                <th className="p-3">الحالة والتوصية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {repVariance.reps.map((rep) => (
                <tr key={rep.rep_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 font-headline flex items-center gap-2">
                    {rep.status === 'TOP' && <Award className="w-4 h-4 text-amber-500" />}
                    {rep.status === 'NEEDS_TRAINING' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    <span>{rep.rep_name}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{rep.assigned_leads} ليد</td>
                  <td className="p-3 font-mono text-slate-900 font-bold">{rep.closed_orders} أوردر</td>
                  <td className="p-3 font-mono font-extrabold text-sm">
                    <span className={rep.cvr_percentage >= 15 ? 'text-emerald-700' : rep.cvr_percentage <= 5 ? 'text-rose-700' : 'text-blue-700'}>
                      {rep.cvr_percentage}%
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-800">{rep.avg_frt_minutes} دقيقة</td>
                  <td className="p-3">
                    {rep.status === 'TOP' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                        أعلى أداء (تحويل 70% ليدات له)
                      </span>
                    )}
                    {rep.status === 'NEEDS_TRAINING' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                        يحتاج تدريب وتعديل شفتات
                      </span>
                    )}
                    {rep.status === 'AVERAGE' && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                        مستقر ومتزن
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 7: OBJECTION BREAKDOWN MATRIX */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>7. تصنيف أسباب الرفض (Objection Breakdown Matrix)</span>
            </h3>
            <p className="text-xs text-slate-600">
              تحليل تقارير عدم الشراء المقفولة من الـ CRM لتوجيه القرار الإداري
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objections.map((item, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                item.exceeded_threshold ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                <span className="font-bold text-xs font-headline text-slate-900">{item.label_ar}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-slate-900">{item.percentage}%</span>
                  <span className="text-[10px] text-slate-500 font-mono">(حد التنبيه &gt; {item.threshold_percentage}%)</span>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-slate-700 font-sans">
                  <strong className="text-slate-900 font-headline">التشخيص المتقدم:</strong> {item.diagnosis}
                </p>
                <p className="text-emerald-800 font-sans font-bold bg-white/80 p-2 rounded border border-slate-200/80">
                  <strong className="text-emerald-900 font-headline">القرار التنفيذي:</strong> {item.executive_action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: BACKEND CONFIRMATION & ORDERS FUNNEL */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 font-headline flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-700" />
              <span>8. قمع تأكيد الشيت وأوردرات الخلفية (Backend Confirmation Sheet)</span>
            </h3>
            <p className="text-xs text-slate-600">
              متابعة تسليم وتأكيد الأوردرات من الشيت الفعلي
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block">إجمالي أوردرات الشيت</span>
            <span className="text-base font-bold font-mono text-slate-900">{rawOrders} طلب</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block">المؤكدة بنجاح</span>
            <span className="text-base font-bold font-mono text-emerald-700">{confirmed} طلب</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block">الملغية / الوهمية</span>
            <span className="text-base font-bold font-mono text-rose-700">{cancelled} طلب</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block">المسلمة ومحصلة (COD)</span>
            <span className="text-base font-bold font-mono text-amber-700">{delivered} طلب</span>
          </div>
        </div>
      </div>

      <PerformanceAnalytical layer={2} auditResult={auditResult} />
    </div>
  );
};
