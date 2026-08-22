import React, { useState, useEffect } from 'react';
import { 
  AuditPayload, 
  AuditResult, 
  NavTab
} from './types';
import { run5LayerAudit, PRESET_PAYLOADS } from './lib/auditEngine';
import { Header } from './components/Header';
import { SidebarNav } from './components/SidebarNav';
import { TopKpiCards } from './components/TopKpiCards';
import { HealthScoresGrid } from './components/HealthScoresGrid';
import { ChatConversionMetricsDashboard } from './components/ChatConversionMetricsDashboard';
import { GuardrailsAndActions } from './components/GuardrailsAndActions';
import { PerformanceWorkflowBar } from './components/PerformanceWorkflowBar';
import { FileUploadTab } from './components/FileUploadTab';
import { SignalsTab } from './components/SignalsTab';
import { DiagnosisTab } from './components/DiagnosisTab';
import { GuardrailsTab } from './components/GuardrailsTab';
import { PlaybooksTab } from './components/PlaybooksTab';
import { Layer3DiagnosticEngineTab } from './components/Layer3DiagnosticEngineTab';
import { SnapshotVaultTab } from './components/SnapshotVaultTab';
import { MarketBenchmarkTab } from './components/MarketBenchmarkTab';
import { DecisionMatrixTab } from './components/DecisionMatrixTab';
import { CommercialOutputsBoard } from './components/CommercialOutputsBoard';

interface SharedReportSnapshot {
  version: 1;
  sharedAt: string;
  payload: AuditPayload;
  auditResult: AuditResult;
}

const encodeShareSnapshot = (snapshot: SharedReportSnapshot) => {
  const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const readShareSnapshot = (): SharedReportSnapshot | null => {
  try {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get('report');
    if (!encoded) return null;
    const padded = encoded.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - encoded.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as SharedReportSnapshot;
    return parsed?.version === 1 && parsed.payload && parsed.auditResult ? parsed : null;
  } catch {
    return null;
  }
};

const makeSharePayload = (payload: AuditPayload): AuditPayload => ({
  ...payload,
  ad_platforms: payload.ad_platforms.map(({ ad_sets, ...campaign }) => campaign),
  backend_sheet: { ...payload.backend_sheet }
});

export default function App() {
  const [sharedReport] = useState<SharedReportSnapshot | null>(readShareSnapshot);
  // يبدأ المستخدم من مسار الإدخال حتى لا يخلط الأرقام التجريبية بنتائج متجره.
  const [activeTab, setActiveTab] = useState<NavTab>(sharedReport ? 'overview' : 'upload_files');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [currentPayload, setCurrentPayload] = useState<AuditPayload>(() => sharedReport?.payload || PRESET_PAYLOADS[0].payload);

  const [auditResult, setAuditResult] = useState<AuditResult>(() => sharedReport?.auditResult || run5LayerAudit(PRESET_PAYLOADS[0].payload));

  const [isAuditing, setIsAuditing] = useState(false);
  const [hasLiveData, setHasLiveData] = useState(Boolean(sharedReport));
  const [shareFeedback, setShareFeedback] = useState('');

  // Trigger audit call to backend Express endpoint or local calculation
  const executeAudit = async (payloadToAudit: AuditPayload) => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToAudit)
      });
      if (res.ok) {
        const data: AuditResult = await res.json();
        setAuditResult(data);
      } else {
        setAuditResult(run5LayerAudit(payloadToAudit));
      }
    } catch (err) {
      console.warn('Backend API audit fetch fallback to local calculation:', err);
      setAuditResult(run5LayerAudit(payloadToAudit));
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    if (!sharedReport) executeAudit(currentPayload);
  }, []);

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const newPayload = PRESET_PAYLOADS[idx].payload;
    setCurrentPayload(newPayload);
    setHasLiveData(false);
    executeAudit(newPayload);
  };

  const handleWebhookAuditExecute = (
    updatedPayload: AuditPayload,
    newResult: AuditResult
  ) => {
    setCurrentPayload(updatedPayload);
    setAuditResult(newResult);
    setHasLiveData(true);
  };

  const handleShareReport = async () => {
    const snapshot: SharedReportSnapshot = {
      version: 1,
      sharedAt: new Date().toISOString(),
      payload: makeSharePayload(currentPayload),
      auditResult
    };
    const link = `${window.location.origin}${window.location.pathname}#report=${encodeShareSnapshot(snapshot)}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareFeedback('تم نسخ رابط التقرير. أي شخص يفتحه سيرى نفس النتيجة دون إعادة رفع البيانات.');
    } catch {
      window.prompt('انسخ رابط التقرير وأرسله للمدير:', link);
      setShareFeedback('رابط التقرير جاهز للمشاركة.');
    }
  };

  // حساب حالة إشارة المرور تلقائياً بناءً على الأرقام الحقيقية (صفحة 32)
  let minAge = 999;
  let maxJump = 0;
  currentPayload.ad_platforms?.forEach((p) => {
    if (p.campaign_age_hours !== undefined) minAge = Math.min(minAge, p.campaign_age_hours);
    if (p.budget_scaled_24h_pct !== undefined) maxJump = Math.max(maxJump, p.budget_scaled_24h_pct);
  });
  if (minAge === 999) minAge = 72;

  const confirmedOrders = currentPayload.backend_sheet?.confirmed_orders || 0;
  const isFirst48Hours = minAge < 48;
  const isBigBudgetJump = maxJump > 30;
  const isHolidayOrCrisis = currentPayload.layer3_external?.is_holiday_or_crisis || false;
  const isLowSampleSize = confirmedOrders < 10;
  const roasDiscrepancy = Math.abs((currentPayload.ad_platforms?.[0]?.roas || 3.0) - (auditResult?.financial_economics?.true_roas || 2.99)) > 0.8;
  const isLosingMoney = (auditResult?.financial_economics?.contribution_margin ?? 0) < 0;

  let autoStopLightStatus: 'RED' | 'YELLOW' | 'GREEN' = 'GREEN';
  let autoStopLightReason = 'الـ Leak محدد والداتا كافية ومستقرة، يمكنك اتخاذ قرارات التكبير أو التعديل بأمان.';

  if (isFirst48Hours || isBigBudgetJump || isHolidayOrCrisis || isLosingMoney) {
    autoStopLightStatus = 'RED';
    if (isFirst48Hours) autoStopLightReason = `الحملة في أول ${minAge} ساعة (< 48 ساعة) - ممنوع التعديل لحماية الخوارزمية.`;
    else if (isBigBudgetJump) autoStopLightReason = `قفزة ميزانية كبيرة (+${maxJump}%) - تجميد 48-72 ساعة لاستقرار المزاد.`;
    else if (isLosingMoney) autoStopLightReason = 'هامش المساهمة بالسالب (خسارة مباشرة) - تفعيل قاطع التجميد.';
    else autoStopLightReason = 'يوم عطلة أو أزمة خارجية - ممنوع الحكم على أداء اليوم.';
  } else if (isLowSampleSize || roasDiscrepancy) {
    autoStopLightStatus = 'YELLOW';
    if (isLowSampleSize) autoStopLightReason = `حجم العينة صغير (${confirmedOrders} طلبات مؤكدة < 10) - انتظار وتجميع داتا.`;
    else autoStopLightReason = 'تضارب بين ROAS المنصات و ROAS الشيت الفعلي - يجب تجميع داتا إضافية.';
  }

  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#20123a] font-sans flex flex-col antialiased">
      {/* Top Navigation & App Header */}
      <Header
        storeName={currentPayload.store_name || 'متجر التجارة الإلكترونية'}
        systemStatus={auditResult.system_status}
        statusReason={auditResult.status_reason}
        onRefreshAudit={() => executeAudit(currentPayload)}
        onOpenFileUpload={() => setActiveTab('upload_files')}
        onSelectPreset={handleSelectPreset}
        presets={PRESET_PAYLOADS}
        isAuditing={isAuditing}
        isDemoData={!hasLiveData}
        isSharedReport={Boolean(sharedReport)}
        onShareReport={hasLiveData ? handleShareReport : undefined}
      />

      {shareFeedback && <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-xs font-bold text-emerald-900" dir="rtl">{shareFeedback}</div>}

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Navigation */}
        <SidebarNav 
          activeTab={activeTab} 
          onSelectTab={setActiveTab} 
          autoStopLightStatus={autoStopLightStatus}
          autoStopLightReason={autoStopLightReason}
        />

        {/* Center Dashboard View Area */}
        <main className="flex-1 p-4 lg:p-7 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-6">
          {activeTab === 'overview' && (
            <>
              {!hasLiveData && (
                <section className="rounded-[1.5rem] border border-[#ddd5ff] bg-gradient-to-l from-[#ede9ff] to-white p-6 shadow-[0_12px_32px_rgba(57,36,100,0.07)]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-[#6340d8] mb-1">ابدأ من بياناتك، وليس من الأرقام التجريبية</p>
                      <h2 className="text-base font-black font-headline text-[#20123a]">من الداتا إلى قرار واضح في دقائق</h2>
                      <p className="text-xs text-[#716b7d] mt-1">ارفع تقرير الإعلانات وشيت الـCRM، راجع الفترة، ثم احصل على التشخيص وخطة العمل.</p>
                    </div>
                    <button onClick={() => setActiveTab('upload_files')} className="mp-primary shrink-0 rounded-xl px-5 py-3 text-xs font-bold transition-colors">
                      ابدأ رفع البيانات ←
                    </button>
                  </div>
                </section>
              )}
              {/* Top KPI Summary Row */}
              <TopKpiCards financials={auditResult?.financial_economics} />

              <CommercialOutputsBoard payload={currentPayload} auditResult={auditResult} />

              {/* SMART LANDING STATION: FINAL DECISION MATRIX CTA */}
              <div 
                onClick={() => setActiveTab('decisions')}
                className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-4 md:p-5 shadow-lg cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group relative overflow-hidden"
              >
                <div className="flex items-center gap-3.5 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform shadow-md">
                    ⚡
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs md:text-sm font-black font-headline text-white">
                        محطة الهبوط الذكية: مصفوفة القرارات النهائية (Final Decision Matrix)
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                        خطة العمل الفورية (Action Plan)
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 font-sans">
                      جدول تنفيذي مركز من 6 أعمدة يترجم نتائج كافة الطبقات لقرارات فورية: سكيل، إيقاف هدر، حماية مبيعات، أو استبدال زاوية إعلانية.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-black font-headline text-slate-950 bg-emerald-400 px-5 py-2.5 rounded-xl border border-emerald-300 shrink-0 group-hover:bg-emerald-300 transition-all shadow-md relative z-10">
                  <span>فتح مصفوفة القرارات</span>
                  <span>←</span>
                </div>
              </div>

              {/* Layer 3 Quick Alert & Ad-Kill Ban Banner */}
              <div 
                onClick={() => setActiveTab('layer3_diagnostic')}
                className="bg-white border border-slate-200 hover:border-indigo-400 rounded-2xl p-4 md:p-5 shadow-2xs cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-mono font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                    L3
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs md:text-sm font-extrabold font-headline text-slate-900">
                        LAYER 3: محرك تشخيص الأداء والربط التنفيذي بين الإعلانات والإنبوكس
                      </span>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        حظر إيقاف الإعلانات (Ad-Kill Ban Enforced)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-sans">
                      تحليل أثر العوامل الخارجية على مؤشرات الأداء، وتوليد تعديلات فورية لكابشن الإعلان (Layer 1) وسكريبتات الإنبوكس مع الـ CRM Tags (Layer 2).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold font-headline text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-200 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <span>فتح محرك التشخيص Layer 3</span>
                  <span>←</span>
                </div>
              </div>

              {/* Health Diagnostic Scores Row */}
              <HealthScoresGrid
                scores={auditResult?.health_scores || { signal_integrity: 0, creative_diagnosis: 0, cro_audit: 0, scaling_guardrails: 0 }}
                overclaimPct={auditResult?.financial_economics?.overclaim_percentage ?? 0}
                funnelLeakLocation={auditResult?.funnel_leak_location || 'PRE_CLICK_HOOK'}
              />

              {/* Core Chat Qualification & Conversion Metrics with Historical Charts */}
              <ChatConversionMetricsDashboard
                payload={currentPayload}
                auditResult={auditResult}
              />

              {/* Guardrails, Decisions & Action Queue Grid */}
              <GuardrailsAndActions
                scalingGuardrailsScore={auditResult?.health_scores?.scaling_guardrails ?? 0}
                statusReason={auditResult?.status_reason || ''}
                diagnosisSummary={auditResult?.diagnosis_summary || ''}
                funnelLeakLocation={auditResult?.funnel_leak_location || 'PRE_CLICK_HOOK'}
                actionQueue={auditResult?.action_queue || []}
              />

              {/* Bottom Closed-Loop Performance Workflow Bar */}
              <PerformanceWorkflowBar
                onStepClick={(stepIdx) => {
                  if (stepIdx === 0) setActiveTab('signals');
                  else if (stepIdx === 1) setActiveTab('diagnosis');
                  else if (stepIdx === 2) setActiveTab('overview');
                  else if (stepIdx === 3) setActiveTab('playbooks');
                  else if (stepIdx === 4) setActiveTab('decisions');
                  else if (stepIdx === 5) setActiveTab('guardrails');
                }}
              />
            </>
          )}

          {activeTab === 'upload_files' && (
            <FileUploadTab
              currentPayload={currentPayload}
              onAuditExecute={handleWebhookAuditExecute}
              onNavigateToOverview={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'signals' && (
            <SignalsTab payload={currentPayload} auditResult={auditResult} />
          )}

          {activeTab === 'diagnosis' && (
            <DiagnosisTab payload={currentPayload} auditResult={auditResult} />
          )}

          {activeTab === 'layer3_diagnostic' && (
            <Layer3DiagnosticEngineTab payload={currentPayload} auditResult={auditResult} />
          )}

          {activeTab === 'guardrails' && (
            <GuardrailsTab payload={currentPayload} auditResult={auditResult} />
          )}

          {activeTab === 'playbooks' && <PlaybooksTab />}

          {activeTab === 'snapshot_vault' && (
            <SnapshotVaultTab payload={currentPayload} auditResult={auditResult} />
          )}

          {activeTab === 'benchmark' && (
            <MarketBenchmarkTab payload={currentPayload} auditResult={auditResult} />
          )}

          {(activeTab === 'decisions' || activeTab === 'workflows') && (
            <DecisionMatrixTab payload={currentPayload} auditResult={auditResult} />
          )}

        </main>
      </div>
    </div>
  );
}
