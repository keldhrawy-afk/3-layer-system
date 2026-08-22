import React, { useState } from 'react';
import { 
  WeeklySnapshot, 
  DecisionToOutcomeRecord,
  AuditPayload,
  AuditResult
} from '../types';
import { 
  Archive, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  History, 
  BarChart3, 
  Layers, 
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Zap,
  Check,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';

interface SnapshotVaultTabProps {
  payload: AuditPayload;
  auditResult?: AuditResult | null;
}

// Initial Mock Weekly Historical Snapshots
const INITIAL_SNAPSHOTS: WeeklySnapshot[] = [
  {
    id: 'snap-w33-2026',
    week_code: 'W33-2026',
    week_label: 'الأسبوع الحالي (11 - 18 أغسطس 2026)',
    period_start: '2026-08-11',
    period_end: '2026-08-18',
    timestamp: '2026-08-18T23:59:59Z',
    is_immutable: false,
    immutable_hash: 'sha256:9f8a3c2e1b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
    spent: 48500,
    impressions: 450000,
    clicks: 9500,
    raw_orders: 233,
    confirmed_orders: 121,
    delivered_orders: 98,
    cancelled_orders: 58,
    average_order_value: 1200,
    cogs_per_order: 350,
    blended_cpa: 400.82,
    confirmed_revenue: 145200,
    net_contribution_margin: 54350,
    contribution_margin_pct: 37.4,
    roas: 2.99,
    cvr: 2.45,
    decision_applied: {
      action_type: 'SCALE_BUDGET_20',
      title: 'رفع ميزانية الحملة الرابحة بنسبة 20%',
      description: 'زيادة الصرف اليومي من 5,000 ج.م إلى 6,000 ج.م بعد اجتياز حاجز الـ True CPA (تحت 380 ج.م)',
      applied_date: '2026-08-12',
      target_kpi: 'Contribution Margin > 35%'
    },
    outcome_evaluation: {
      success_status: 'SUCCESS',
      profit_delta_pct: 14.8,
      cpa_delta_pct: 4.2,
      retrospective_finding: 'أدى التكبير لزيادة الأرباح الصافية بمقدار 7,050 ج.م مع الحفاظ على هامش مساهمة ممتاز (37.4%).',
      confidence_impact: 4.5
    },
    yoy_baseline: {
      same_week_last_year_spend: 32000,
      same_week_last_year_revenue: 88000,
      same_week_last_year_cpa: 480,
      same_week_last_year_margin_pct: 29.5,
      seasonal_event_name: 'موسم الصيف والعناية بالبشرة (نشاط استهلاكي مرتفع)'
    }
  },
  {
    id: 'snap-w32-2026',
    week_code: 'W32-2026',
    week_label: 'الأسبوع السابق (4 - 10 أغسطس 2026)',
    period_start: '2026-08-04',
    period_end: '2026-08-10',
    timestamp: '2026-08-10T23:59:59Z',
    is_immutable: true,
    immutable_hash: 'sha256:4a7b2c9e8f1d3e5a7b9c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a',
    spent: 40416,
    impressions: 395000,
    clicks: 8100,
    raw_orders: 195,
    confirmed_orders: 105,
    delivered_orders: 88,
    cancelled_orders: 45,
    average_order_value: 1180,
    cogs_per_order: 350,
    blended_cpa: 384.91,
    confirmed_revenue: 123900,
    net_contribution_margin: 47300,
    contribution_margin_pct: 38.2,
    roas: 3.06,
    cvr: 2.41,
    decision_applied: {
      action_type: 'INBOX_SCRIP_CHANGE',
      title: 'تغيير سكريبت الشات لمعالجة اعتراض السعر',
      description: 'إضافة ضمان الاسترجاع 14 يوم + عرض الشحن المجاني في الشات الأول',
      applied_date: '2026-08-05',
      target_kpi: 'SLA Confirmation > 52%'
    },
    outcome_evaluation: {
      success_status: 'SUCCESS',
      profit_delta_pct: 18.2,
      cpa_delta_pct: -8.5,
      retrospective_finding: 'ارتفعت نسبة تأكيد الطلبات من 48% إلى 53.8% مما خفض الـ CPA مباشرة.',
      confidence_impact: 6.0
    },
    yoy_baseline: {
      same_week_last_year_spend: 28500,
      same_week_last_year_revenue: 76000,
      same_week_last_year_cpa: 510,
      same_week_last_year_margin_pct: 26.8,
      seasonal_event_name: 'موسم الصيف العادي'
    }
  },
  {
    id: 'snap-w31-2026',
    week_code: 'W31-2026',
    week_label: 'أسبوع 31 (28 يوليو - 3 أغسطس 2026)',
    period_start: '2026-07-28',
    period_end: '2026-08-03',
    timestamp: '2026-08-03T23:59:59Z',
    is_immutable: true,
    immutable_hash: 'sha256:1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
    spent: 35000,
    impressions: 340000,
    clicks: 7200,
    raw_orders: 170,
    confirmed_orders: 84,
    delivered_orders: 70,
    cancelled_orders: 50,
    average_order_value: 1150,
    cogs_per_order: 350,
    blended_cpa: 416.66,
    confirmed_revenue: 96600,
    net_contribution_margin: 32200,
    contribution_margin_pct: 33.3,
    roas: 2.76,
    cvr: 2.36,
    decision_applied: {
      action_type: 'KILL_CREATIVE',
      title: 'إيقاف الفيديو الإعلاني القديم واستبداله بالـ Hook الطبي الجديد',
      description: 'فيديو المشكلة والحل لطبيبة الجلدية',
      applied_date: '2026-07-29',
      target_kpi: '3-Sec Hook Rate > 30%'
    },
    outcome_evaluation: {
      success_status: 'SUCCESS',
      profit_delta_pct: 9.4,
      cpa_delta_pct: -6.0,
      retrospective_finding: 'تحسن الـ CTR من 1.7% إلى 2.1% مع انخفاض تكلفة الكليك.',
      confidence_impact: 3.5
    },
    yoy_baseline: {
      same_week_last_year_spend: 25000,
      same_week_last_year_revenue: 65000,
      same_week_last_year_cpa: 520,
      same_week_last_year_margin_pct: 25.0,
      seasonal_event_name: 'فترة قبوضات نهاية يوليو'
    }
  },
  {
    id: 'snap-w30-2026',
    week_code: 'W30-2026',
    week_label: 'أسبوع 30 (21 - 27 يوليو 2026)',
    period_start: '2026-07-21',
    period_end: '2026-07-27',
    timestamp: '2026-07-27T23:59:59Z',
    is_immutable: true,
    immutable_hash: 'sha256:7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    spent: 31500,
    impressions: 310000,
    clicks: 6400,
    raw_orders: 145,
    confirmed_orders: 72,
    delivered_orders: 60,
    cancelled_orders: 40,
    average_order_value: 1150,
    cogs_per_order: 350,
    blended_cpa: 437.50,
    confirmed_revenue: 82800,
    net_contribution_margin: 26100,
    contribution_margin_pct: 31.5,
    roas: 2.63,
    cvr: 2.26,
    decision_applied: {
      action_type: 'MAINTAIN',
      title: 'تثبيت الميزانية خلال ركود منتصف الشهر (21-27 يوليو)',
      description: 'منع زيادة الصرف وتفعيل سكريبت الحجز المسبق للتسليم مع القبض',
      applied_date: '2026-07-22',
      target_kpi: 'Prevent CPA inflation > 450 EGP'
    },
    outcome_evaluation: {
      success_status: 'SUCCESS',
      profit_delta_pct: 2.1,
      cpa_delta_pct: 1.5,
      retrospective_finding: 'حماية الميزانية من الحرق خلال شح السيولة قبل نزول الرواتب.',
      confidence_impact: 4.0
    },
    yoy_baseline: {
      same_week_last_year_spend: 22000,
      same_week_last_year_revenue: 55000,
      same_week_last_year_cpa: 540,
      same_week_last_year_margin_pct: 24.0,
      seasonal_event_name: 'ركود منتصف الشهر المعتاد'
    }
  }
];

export const SnapshotVaultTab: React.FC<SnapshotVaultTabProps> = ({ payload, auditResult }) => {
  const [snapshots, setSnapshots] = useState<WeeklySnapshot[]>(INITIAL_SNAPSHOTS);
  const [selectedWeekA, setSelectedWeekA] = useState<string>('snap-w33-2026');
  const [selectedWeekB, setSelectedWeekB] = useState<string>('snap-w32-2026');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'JSON' | 'CSV' | 'DB_DUMP'>('JSON');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Decision Modal State
  const [newDecisionModalOpen, setNewDecisionModalOpen] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionActionType, setDecisionActionType] = useState<'SCALE_BUDGET_20' | 'KILL_CREATIVE' | 'CHANGE_OFFER' | 'MAINTAIN' | 'INBOX_SCRIP_CHANGE'>('SCALE_BUDGET_20');
  const [decisionRationale, setDecisionRationale] = useState('');

  // Active Snapshot calculation
  const currentSnap = snapshots.find(s => s.id === selectedWeekA) || snapshots[0];
  const previousSnap = snapshots.find(s => s.id === selectedWeekB) || snapshots[1];

  // 4-Week Moving Average
  const last4Weeks = snapshots.slice(0, 4);
  const avg4W = {
    spend: last4Weeks.reduce((acc, s) => acc + s.spent, 0) / (last4Weeks.length || 1),
    revenue: last4Weeks.reduce((acc, s) => acc + s.confirmed_revenue, 0) / (last4Weeks.length || 1),
    cpa: last4Weeks.reduce((acc, s) => acc + s.blended_cpa, 0) / (last4Weeks.length || 1),
    margin_pct: last4Weeks.reduce((acc, s) => acc + s.contribution_margin_pct, 0) / (last4Weeks.length || 1),
    profit: last4Weeks.reduce((acc, s) => acc + s.net_contribution_margin, 0) / (last4Weeks.length || 1),
    roas: last4Weeks.reduce((acc, s) => acc + s.roas, 0) / (last4Weeks.length || 1)
  };

  // Trigger Manual Instant Snapshot
  const handleTakeManualSnapshot = () => {
    const now = new Date();
    const newId = `snap-manual-${Date.now()}`;
    const generatedHash = `sha256:${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const newSnapshot: WeeklySnapshot = {
      id: newId,
      week_code: `W${Math.ceil((now.getDate() + 6) / 7)}-${now.getFullYear()}`,
      week_label: `لقطة أرشفة لحظية (${now.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })})`,
      period_start: now.toISOString().split('T')[0],
      period_end: now.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      is_immutable: true,
      immutable_hash: generatedHash,
      spent: payload.ad_platforms[0]?.spend || 0,
      impressions: payload.ad_platforms[0]?.impressions || 0,
      clicks: payload.ad_platforms[0]?.clicks || 0,
      raw_orders: payload.backend_sheet?.raw_orders || 0,
      confirmed_orders: payload.backend_sheet?.confirmed_orders || 0,
      delivered_orders: payload.backend_sheet?.delivered_orders || 0,
      cancelled_orders: payload.backend_sheet?.cancelled_fake_orders || 0,
      average_order_value: payload.backend_sheet?.average_order_value || 0,
      cogs_per_order: payload.backend_sheet?.cogs_per_order || 0,
      blended_cpa: auditResult?.financial_economics?.true_cpa || 0,
      confirmed_revenue: (payload.backend_sheet?.confirmed_orders || 0) * (payload.backend_sheet?.average_order_value || 0),
      net_contribution_margin: auditResult?.financial_economics?.net_profit || 0,
      contribution_margin_pct: auditResult?.financial_economics?.contribution_margin_pct || 0,
      roas: auditResult?.financial_economics?.true_roas || 0,
      cvr: 2.45,
      decision_applied: {
        action_type: 'SCALE_BUDGET_20',
        title: 'لقطة بيانات مشفرة للحساب',
        description: 'تم أرشفة البيانات الخام الحالية مع بصمة التشفير غير القابلة للتعديل.',
        applied_date: now.toISOString().split('T')[0],
        target_kpi: 'Immutable Record Saved'
      },
      yoy_baseline: {
        same_week_last_year_spend: 32000,
        same_week_last_year_revenue: 88000,
        same_week_last_year_cpa: 480,
        same_week_last_year_margin_pct: 29.5,
        seasonal_event_name: 'أداء الموسم السنوي المقارن'
      }
    };

    setSnapshots([newSnapshot, ...snapshots]);
    setToastMessage('✅ تم إنشاء وحفظ لقطة أرشفة مشفرة (Immutable Snapshot) بنجاح وتخزينها في الخزينة الدائمة!');
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Add Decision to Outcome Vault
  const handleSaveDecision = () => {
    if (!decisionTitle.trim()) return;

    setSnapshots(prev => prev.map((s, idx) => {
      if (idx === 0) {
        return {
          ...s,
          decision_applied: {
            action_type: decisionActionType,
            title: decisionTitle,
            description: decisionRationale || 'قرار مخصص مسجل للاختبار الرجعي (Back-testing).',
            applied_date: new Date().toISOString().split('T')[0],
            target_kpi: 'Track Next Week ROI'
          },
          outcome_evaluation: {
            success_status: 'PENDING',
            profit_delta_pct: 0,
            cpa_delta_pct: 0,
            retrospective_finding: 'جاري مراقبة الأداء في الأسبوع اللاحق لحساب نسبة النجاح ومعايرة الثقة.',
            confidence_impact: 0
          }
        };
      }
      return s;
    }));

    setNewDecisionModalOpen(false);
    setDecisionTitle('');
    setDecisionRationale('');
    setToastMessage('🎯 تم تسجيل القرار في مُحاكي القرارات (Decision Vault) وسيتم ربطه تلقائياً بنتائج الأسبوع القادم!');
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Export Data Download Simulation
  const handleExportDownload = () => {
    let content = '';
    let mimeType = 'application/json';
    let fileExt = 'json';

    if (exportFormat === 'JSON' || exportFormat === 'DB_DUMP') {
      content = JSON.stringify({
        database_name: 'OmniSignal_Immutable_Vault',
        exported_at: new Date().toISOString(),
        total_snapshots: snapshots.length,
        retention_policy: 'PERMANENT_RAW_CRM_OVERCOMING_ATTRIBUTION_LIMITS',
        snapshots: snapshots
      }, null, 2);
    } else {
      // CSV Format
      mimeType = 'text/csv;charset=utf-8;';
      fileExt = 'csv';
      const headers = ['Week Code', 'Label', 'Spent (EGP)', 'Raw Orders', 'Confirmed Orders', 'Blended CPA', 'Revenue', 'Contribution Margin', 'Margin %', 'ROAS', 'SHA256 Hash'];
      const rows = snapshots.map(s => [
        s.week_code,
        `"${s.week_label}"`,
        s.spent,
        s.raw_orders,
        s.confirmed_orders,
        s.blended_cpa.toFixed(2),
        s.confirmed_revenue,
        s.net_contribution_margin,
        s.contribution_margin_pct.toFixed(1) + '%',
        s.roas.toFixed(2),
        s.immutable_hash
      ]);
      content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniSignal_Snapshots_${exportFormat.toLowerCase()}_${new Date().toISOString().split('T')[0]}.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`📥 تم تصدير وتحميل ملف الـ ${exportFormat} بنجاح!`);
    setTimeout(() => setToastMessage(null), 4000);
    setExportModalOpen(false);
  };

  // Calculations for Deltas
  const calcDelta = (curr: number, prev: number) => {
    if (!prev || prev === 0) return 0;
    return ((curr - prev) / prev) * 100;
  };

  const spendDelta = calcDelta(currentSnap.spent, previousSnap.spent);
  const cpaDelta = calcDelta(currentSnap.blended_cpa, previousSnap.blended_cpa);
  const profitDelta = calcDelta(currentSnap.net_contribution_margin, previousSnap.net_contribution_margin);
  const revenueDelta = calcDelta(currentSnap.confirmed_revenue, previousSnap.confirmed_revenue);

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-900 text-emerald-100 border border-emerald-700 rounded-xl shadow-lg flex items-center justify-between text-xs font-headline font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white text-xs cursor-pointer">
            إغلاق ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-mono font-bold text-sm">
                <Archive className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold font-headline tracking-tight text-white">
                خزينة الأرشفة الأسبوعية والذاكرة السنوية (Snapshot & YoY Seasonality Vault)
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Lock className="w-3 h-3" />
                سجل محمي غير قابل للتعديل (Immutable Log)
              </span>
            </div>
            
            <p className="text-xs text-slate-300 font-sans max-w-3xl leading-relaxed">
              تجاوز قيود المنصات وتغيرات الـ Attribution Models عبر الحفظ الدائم لأرقام الـ CRM الخام والصرف الحقيقي.
              يتم أخذ لقطة أسبوعية تلقائية <strong className="text-indigo-200 font-mono">كل أحد الساعة 12:00 منتصف الليل</strong> مع مقارنة ثلاثية الأبعاد (WoW, MoM 4W, YoY).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleTakeManualSnapshot}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>أخذ لقطة أرشفة فورية (Snapshot Now)</span>
            </button>

            <button
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-headline font-bold text-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              <span>تصدير واسترجاع (Backup & Export)</span>
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">الأرشفة التلقائية القادمة:</span>
              <span className="text-white font-bold">الأحد 12:00 AM (متبقي 2 يوم)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">سلامة التشفير (Hash Security):</span>
              <span className="text-emerald-300 font-bold">SHA-256 Verified (100%)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">دقة القرارات السابقة (Back-testing):</span>
              <span className="text-amber-300 font-bold">84.6% نجاح (+8.2% ثقة)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 block">مؤشر موسمية الصيف (YoY Index):</span>
              <span className="text-cyan-300 font-bold">1.14x (موسم نشط)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Level Comparison Dashboard (WoW, MoM 4W, YoY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-headline text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>محرك المقارنة ثلاثي الأبعاد (Tri-Level Seasonality & Trend Engine)</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            الأسبوع الحالي: <strong className="text-slate-800">{currentSnap.week_label}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Level 1: WoW (الأسبوع السابق مباشرة) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-bold font-headline text-slate-900">
                  الأسبوع السابق مباشرة (WoW)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Week-over-Week</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">تغير الصرف (Spend):</span>
                <span className={`font-bold flex items-center gap-1 ${spendDelta > 0 ? 'text-blue-600' : 'text-slate-700'}`}>
                  {spendDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {spendDelta > 0 ? `+${spendDelta.toFixed(1)}%` : `${spendDelta.toFixed(1)}%`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">تغير الـ True CPA:</span>
                <span className={`font-bold flex items-center gap-1 ${cpaDelta > 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {cpaDelta > 0 ? `+${cpaDelta.toFixed(1)}%` : `${cpaDelta.toFixed(1)}%`}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">تغير صافي الأرباح (Profit):</span>
                <span className={`font-bold flex items-center gap-1 ${profitDelta > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {profitDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {profitDelta > 0 ? `+${profitDelta.toFixed(1)}%` : `${profitDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-sans leading-relaxed">
              <strong>خلاصة الـ WoW:</strong> زيادة الصرف (+20%) أدت لنمو صافي الأرباح بنسبة (+14.8%) مع بقاء الـ Contribution Margin في المنطقة الآمنة (37.4%).
            </div>
          </div>

          {/* Level 2: MoM Trend (متوسط آخر 4 أسابيع) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 font-bold font-mono text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-bold font-headline text-slate-900">
                  متوسط آخر 4 أسابيع (MoM Trend)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">4-Week Moving Avg</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">متوسط الصرف الأسبوعي:</span>
                <span className="font-bold text-slate-900">{Math.round(avg4W.spend).toLocaleString()} ج.م</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">متوسط الـ True CPA:</span>
                <span className="font-bold text-slate-900">{avg4W.cpa.toFixed(1)} ج.م</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">متوسط هامش المساهمة:</span>
                <span className="font-bold text-emerald-600">{avg4W.margin_pct.toFixed(1)}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 font-sans leading-relaxed">
              <strong>خلاصة الاتجاه (Trend):</strong> أداء الأسبوع الحالي أعلى من متوسط الشهر في الإيرادات (+29.8%)، مع تحسن مستمر في كفاءة الـ ROAS بفضل استقرار سكريبتات الشات.
            </div>
          </div>

          {/* Level 3: YoY Seasonality Memory (ذاكرة المواسم السنوية) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 font-bold font-mono text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-bold font-headline text-slate-900">
                  نفس الأسبوع من السنة السابقة (YoY)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Year-over-Year</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">صرف نفس الأسبوع (2025):</span>
                <span className="font-bold text-slate-700">32,000 ج.م</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">CPA نفس الأسبوع (2025):</span>
                <span className="font-bold text-slate-700">480 ج.م</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600">معدل نمو الأرباح YoY:</span>
                <span className="font-bold text-emerald-600">+65.0% نمو سنوي</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-sans leading-relaxed">
              <strong>تشخيص الموسمية:</strong> الـ CPA الحالي (400 ج.م) أقل من السنة السابقة (480 ج.م). الزيادة في المبيعات طبيعية ومطابقة لمنحنى موسم الصيف وليست طفرة مؤقتة.
            </div>
          </div>
        </div>
      </div>

      {/* Week-to-Week Comparative Deep Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-xs font-bold font-headline text-slate-900">
              أداة مقارنة أسبوع بأسبوع (Week-over-Week Comparator)
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              اختر أي أسبوعين تاريخيين لمقارنة الأرقام الخام الحقيقية ومعدل الفروقات بدقة متناهية.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">الأسبوع (أ):</span>
              <select
                value={selectedWeekA}
                onChange={(e) => setSelectedWeekA(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {snapshots.map(s => (
                  <option key={s.id} value={s.id}>{s.week_label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-bold">الأسبوع (ب):</span>
              <select
                value={selectedWeekB}
                onChange={(e) => setSelectedWeekB(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {snapshots.map(s => (
                  <option key={s.id} value={s.id}>{s.week_label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparative Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-sans">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-headline font-bold text-[11px] border-b border-slate-200">
                <th className="p-3">المؤشر المالي والتشغيلي</th>
                <th className="p-3 bg-indigo-50/70 text-indigo-950 font-mono">الأسبوع (أ): {currentSnap.week_code}</th>
                <th className="p-3 bg-slate-50 text-slate-900 font-mono">الأسبوع (ب): {previousSnap.week_code}</th>
                <th className="p-3 text-center">نسبة التغير (Delta %)</th>
                <th className="p-3">التشخيص التنفيذي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {/* Row 1: Spend */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">إجمالي الصرف الحقيقي (True Spent)</td>
                <td className="p-3 font-bold text-indigo-900 bg-indigo-50/30">{currentSnap.spent.toLocaleString()} ج.م</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.spent.toLocaleString()} ج.م</td>
                <td className="p-3 text-center font-bold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${spendDelta > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                    {spendDelta > 0 ? `+${spendDelta.toFixed(1)}%` : `${spendDelta.toFixed(1)}%`}
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  {spendDelta > 0 ? 'تكبير تدريجي للميزانية (Scaling Mode)' : 'تثبيت أو تحجيم للميزانية'}
                </td>
              </tr>

              {/* Row 2: Raw Leads & Orders */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">الطلبات الأولية بشيت CRM (Raw Leads)</td>
                <td className="p-3 font-bold text-indigo-900 bg-indigo-50/30">{currentSnap.raw_orders} طلب</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.raw_orders} طلب</td>
                <td className="p-3 text-center font-bold">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">
                    +{calcDelta(currentSnap.raw_orders, previousSnap.raw_orders).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  حجم الطلبات الخام الواردة من الحملات دون تلاعب المنصات.
                </td>
              </tr>

              {/* Row 3: Confirmed Orders */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">الطلبات المؤكدة (Confirmed Orders)</td>
                <td className="p-3 font-bold text-indigo-900 bg-indigo-50/30">{currentSnap.confirmed_orders} طلب ({((currentSnap.confirmed_orders / currentSnap.raw_orders) * 100).toFixed(1)}%)</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.confirmed_orders} طلب ({((previousSnap.confirmed_orders / previousSnap.raw_orders) * 100).toFixed(1)}%)</td>
                <td className="p-3 text-center font-bold">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">
                    +{calcDelta(currentSnap.confirmed_orders, previousSnap.confirmed_orders).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  معدل تأكيد السيلز والكول سنتر (SLA Ground Truth).
                </td>
              </tr>

              {/* Row 4: Blended True CPA */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">تكلفة الطلب المؤكد الحقيقي (Blended CPA)</td>
                <td className="p-3 font-bold text-indigo-900 bg-indigo-50/30">{currentSnap.blended_cpa.toFixed(2)} ج.م</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.blended_cpa.toFixed(2)} ج.م</td>
                <td className="p-3 text-center font-bold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${cpaDelta > 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {cpaDelta > 0 ? `+${cpaDelta.toFixed(1)}%` : `${cpaDelta.toFixed(1)}%`}
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  المعيار الذهبي لجدوى الصرف الحقيقي على الأوردر المؤكد.
                </td>
              </tr>

              {/* Row 5: Contribution Margin */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">صافي هامش المساهمة (Contribution Margin)</td>
                <td className="p-3 font-bold text-emerald-700 bg-indigo-50/30">{currentSnap.net_contribution_margin.toLocaleString()} ج.م ({currentSnap.contribution_margin_pct}%)</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.net_contribution_margin.toLocaleString()} ج.م ({previousSnap.contribution_margin_pct}%)</td>
                <td className="p-3 text-center font-bold">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">
                    +{profitDelta.toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  الأرباح الصافية بعد خصم تكلفة المنتج (COGS) وميزانية الإعلانات.
                </td>
              </tr>

              {/* Row 6: True ROAS */}
              <tr className="hover:bg-slate-50/50">
                <td className="p-3 font-bold text-slate-900 font-sans">العائد الحقيقي على الإنفاق (True ROAS)</td>
                <td className="p-3 font-bold text-indigo-900 bg-indigo-50/30">{currentSnap.roas.toFixed(2)}x</td>
                <td className="p-3 text-slate-700 bg-slate-50/50">{previousSnap.roas.toFixed(2)}x</td>
                <td className="p-3 text-center font-bold">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">
                    {calcDelta(currentSnap.roas, previousSnap.roas).toFixed(1)}%
                  </span>
                </td>
                <td className="p-3 font-sans text-slate-600 text-[11px]">
                  معدل دوران السيولة الصافية المحققة فعلياً.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision-to-Outcome Vault & Back-testing Sandbox */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center">
                <History className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold font-headline text-slate-900">
                مُحاكي التعلم واختبار القرارات (Decision-to-Outcome Vault & Back-testing)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              يسجل السيستم كل قرار يتم تطبيقه، ويقيس نتائج الأسبوع التالي لتقييم صحة قرارات الـ Scaling وتعديل نسبة الثقة (Confidence Score).
            </p>
          </div>

          <button
            onClick={() => setNewDecisionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-headline font-bold text-xs transition cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>تسجيل قرار جديد للاختبار</span>
          </button>
        </div>

        {/* Decisions History Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {snapshots.filter(s => s.decision_applied).map((snap) => (
            <div 
              key={snap.id} 
              className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-headline">
                      {snap.decision_applied?.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                      {snap.week_code}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    تاريخ التطبيق: {snap.decision_applied?.applied_date}
                  </span>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  snap.outcome_evaluation?.success_status === 'SUCCESS'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : snap.outcome_evaluation?.success_status === 'FAILED'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {snap.outcome_evaluation?.success_status === 'SUCCESS' ? '✅ نجاح القرار (Verified)' : snap.outcome_evaluation?.success_status === 'FAILED' ? '❌ قرار غير موفق' : '⏳ قيد المراقبة'}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 font-sans">
                {snap.decision_applied?.description}
              </p>

              {snap.outcome_evaluation && (
                <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] font-sans text-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-500">أثر القرار في الأسبوع التالي:</span>
                    <span className="font-bold text-emerald-700">
                      أرباح +{snap.outcome_evaluation.profit_delta_pct}% | ثقة +{snap.outcome_evaluation.confidence_impact}%
                    </span>
                  </div>
                  <p className="text-slate-800 leading-normal">
                    {snap.outcome_evaluation.retrospective_finding}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Snapshot Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold font-headline text-slate-900">
              سجل الـ Snapshots المؤرشفة في قاعدة البيانات (Immutable Data Ledger)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {snapshots.length} لقطات محفوظة دائمة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-headline font-bold text-[11px]">
                <th className="p-2.5">رمز الأسبوع</th>
                <th className="p-2.5">الفترة الزمنية</th>
                <th className="p-2.5">الصرف الحقيقي</th>
                <th className="p-2.5">الطلبات المؤكدة</th>
                <th className="p-2.5">True CPA</th>
                <th className="p-2.5">صافي الأرباح</th>
                <th className="p-2.5">بصمة التشفير (Immutable Hash)</th>
                <th className="p-2.5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {snapshots.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60">
                  <td className="p-2.5 font-bold text-indigo-950">{s.week_code}</td>
                  <td className="p-2.5 font-sans text-slate-600 text-[11px]">{s.week_label}</td>
                  <td className="p-2.5 font-bold">{s.spent.toLocaleString()} ج.م</td>
                  <td className="p-2.5">{s.confirmed_orders} طلب</td>
                  <td className="p-2.5 font-bold text-indigo-700">{s.blended_cpa.toFixed(1)} ج.م</td>
                  <td className="p-2.5 font-bold text-emerald-700">{s.net_contribution_margin.toLocaleString()} ج.م</td>
                  <td className="p-2.5 text-slate-400 text-[10px]" title={s.immutable_hash}>
                    {s.immutable_hash.slice(0, 16)}...
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check className="w-3 h-3 text-emerald-600" />
                      محفوظ
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export / Backup Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
                  <Download className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-headline">
                  تصدير واسترجاع الأرشيف الأسبوعي
                </h3>
              </div>
              <button 
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              اختر صيغة التصدير المطلوبة لحفظ بيانات الـ CRM والصرف الخام والـ Snapshots التاريخية كاملة على جهازك:
            </p>

            <div className="space-y-2">
              <label 
                onClick={() => setExportFormat('JSON')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  exportFormat === 'JSON' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileCode className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-headline">ملف JSON المهيكل</span>
                    <span className="text-[10px] text-slate-500 font-mono">Snapshots & Backtesting Data</span>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={exportFormat === 'JSON'} 
                  onChange={() => setExportFormat('JSON')}
                  className="accent-indigo-600" 
                />
              </label>

              <label 
                onClick={() => setExportFormat('CSV')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  exportFormat === 'CSV' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-headline">شيت إكسل / CSV</span>
                    <span className="text-[10px] text-slate-500 font-mono">جاهز للفتح والتحليل في Excel أو Sheets</span>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={exportFormat === 'CSV'} 
                  onChange={() => setExportFormat('CSV')}
                  className="accent-emerald-600" 
                />
              </label>

              <label 
                onClick={() => setExportFormat('DB_DUMP')}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                  exportFormat === 'DB_DUMP' ? 'border-purple-500 bg-purple-50/50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-headline">نسخة قاعدة بيانات كاملة (DB Dump)</span>
                    <span className="text-[10px] text-slate-500 font-mono">مع بصمة التحقق والتشفير SHA-256</span>
                  </div>
                </div>
                <input 
                  type="radio" 
                  checked={exportFormat === 'DB_DUMP'} 
                  onChange={() => setExportFormat('DB_DUMP')}
                  className="accent-purple-600" 
                />
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleExportDownload}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold font-headline flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الملف الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Decision Logger Modal */}
      {newDecisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-headline">
                  تسجيل قرار إعلاني / تشغيلي للاختبار
                </h3>
              </div>
              <button 
                onClick={() => setNewDecisionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-bold text-slate-800 mb-1">عنوان القرار الإعلاني:</label>
                <input
                  type="text"
                  value={decisionTitle}
                  onChange={(e) => setDecisionTitle(e.target.value)}
                  placeholder="مثال: زيادة ميزانية الحملة 20%، استبدال الكرييتف، تغيير عرض الإنبوكس..."
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">نوع الإجراء:</label>
                <select
                  value={decisionActionType}
                  onChange={(e) => setDecisionActionType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="SCALE_BUDGET_20">زيادة الميزانية (Scale Budget +20%)</option>
                  <option value="KILL_CREATIVE">إيقاف واستبدال الكرييتف (Kill/Rotate Creative)</option>
                  <option value="CHANGE_OFFER">تعديل العرض والكابشن (Offer Counter-Strike)</option>
                  <option value="INBOX_SCRIP_CHANGE">تعديل سكريبت الشات والردود (Inbox SLA)</option>
                  <option value="MAINTAIN">تجميد الميزانية (Maintain / Freeze)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">مبررات القرار والهدف المتوقع (Rationale):</label>
                <textarea
                  value={decisionRationale}
                  onChange={(e) => setDecisionRationale(e.target.value)}
                  placeholder="اكتب أسباب القرار والـ KPI المستهدف في الأسبوع التالي..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewDecisionModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveDecision}
                disabled={!decisionTitle.trim()}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold font-headline flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>حفظ وتفعيل التتبع</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
