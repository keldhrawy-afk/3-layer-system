import React, { useState } from 'react';
import { AuditPayload, AuditResult, AdSetBreakdown, CreativeBreakdown } from '../types';
import { Activity, AlertTriangle, CheckCircle2, ShieldAlert, Zap, MessageSquare, Target, Eye, DollarSign, Filter, Layers, Film, Users, ExternalLink } from 'lucide-react';
import { DiagnosticNoteCard } from './DiagnosticNoteCard';
import { CreativeAngleMatrix } from './CreativeAngleMatrix';

interface SignalsTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export const SignalsTab: React.FC<SignalsTabProps> = ({ payload, auditResult }) => {
  const { ad_platforms } = payload;
  const metrics = auditResult.raw_calculated_metrics || {};
  const layer1 = auditResult.layer1_diagnostic;

  const [levelMode, setLevelMode] = useState<'campaign' | 'adset' | 'creative'>('campaign');

  const getLightBadge = (light?: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP') => {
    switch (light) {
      case 'GREEN_SCALE':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800',
          dot: 'bg-emerald-500',
          label: '🟢 Green (Scale) - أداء الإعلان ممتاز وقابل للتوسع'
        };
      case 'YELLOW_FIX':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-900',
          dot: 'bg-amber-500',
          label: '🟡 Yellow (Fix) - يوجد تسريب في مرحلة محددة يحتاج علاج'
        };
      case 'RED_STOP':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-900',
          dot: 'bg-rose-500',
          label: '🔴 Red (Stop) - الإعلان مجهد أو يستنزف الميزانية بدون عائد'
        };
    }
  };

  const lightInfo = getLightBadge(layer1?.decision_light);

  // Extract all AdSets and Creatives across platforms
  const allAdSets: AdSetBreakdown[] = [];
  const allCreatives: CreativeBreakdown[] = [];

  ad_platforms.forEach((p) => {
    if (p.ad_sets && p.ad_sets.length > 0) {
      p.ad_sets.forEach((as) => {
        allAdSets.push(as);
        if (as.creatives && as.creatives.length > 0) {
          as.creatives.forEach((c) => allCreatives.push(c));
        }
      });
    }
  });

  return (
    <div className="space-y-6 text-slate-900 font-sans" dir="rtl">
      {/* LAYER 1 HEADER & SYSTEM ROLE */}
      <div className="mp-hero-surface rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6d45ff] via-[#a487ff] to-[#d4c6ff]" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e3ddf1] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#e7e0ff] text-[#4d2bc5] border border-[#cfc1ff]">
                Layer 1: Marketing / Meta Ads
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/80 text-[#635b70] border border-[#e1dbf2]">
                Messenger • WhatsApp • Instagram
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold font-headline tracking-tight text-[#20123a] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#6d45ff]" />
              <span>الطبقة الأولى: محلل أداء إعلانات الرسائل (Pre-Click Specialist)</span>
            </h1>
            <p className="text-xs text-[#716b7d] mt-1 max-w-3xl leading-relaxed">
              مهمة النظام: استقبال داتا الداشبورد من ميتا، تحليل العلاقة بين الماتريكس (ربط الأرقام ببعضها)، وتحديد مكان التسريب (Leak) بالضبط قبل ما العميل يفتح الشات، مع تقديم قرار تنفيذي واضح خلال 24 ساعة.
            </p>
          </div>

          <div className={`px-4 py-3 rounded-lg border flex items-center gap-3 shrink-0 ${lightInfo.bg}`}>
            <span className={`w-3.5 h-3.5 rounded-full ${lightInfo.dot} animate-pulse shrink-0`} />
            <div>
              <span className="text-[10px] text-[#716b7d] block font-headline">حالة الإعلان التنفيذية (Decision Light)</span>
              <span className="text-xs font-bold font-headline">{lightInfo.label}</span>
            </div>
          </div>
        </div>

        {/* 24-HOUR EXECUTIVE ACTION OUTPUT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mp-subtle-card rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-[#4b4356] font-headline uppercase flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#6d45ff]" />
              <span>مكان التسريب بالضبط (Leak Location)</span>
            </span>
            <div className="text-sm font-bold text-amber-300 font-headline bg-amber-500/10 p-2.5 rounded border border-amber-500/20">
              {layer1?.leak_location || 'لم يتم اكتشاف تسريب في مرحلة ما قبل النقرة'}
            </div>
            <p className="text-xs text-[#625b6d] leading-relaxed">
              {layer1?.diagnosis_details}
            </p>
          </div>

          <div className="mp-subtle-card rounded-xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-[#4b4356] font-headline uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#8a63ff]" />
              <span>التوصية المباشرة للميديا باير (24-Hour Action Plan)</span>
            </span>
            <div className="text-xs text-[#3f3750] font-medium bg-[#f0edff] p-2.5 rounded border border-[#ddd5ff] leading-relaxed">
              {layer1?.action_plan_24h}
            </div>
          </div>
        </div>
      </div>

      {/* 3-LINE EXECUTIVE DIAGNOSTIC NOTE CARD */}
      <DiagnosticNoteCard auditResult={auditResult} payload={payload} />

      {/* TOP METRIC CARDS WITH % SYMBOLS AND ACCURATE BENCHMARKS */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline uppercase">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>مؤشرات الأداء الرئيسية قبل فتح الشات (Pre-Click KPIs)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              تحليل مباشر للـ Hook Rate, Hold Rate, Outbound CTR, والـ Bridge Conversion بين النقرة والرسالة.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
            Layer 1 Metrics
          </span>
        </div>

        {/* Grid of 8 KPI Cards including Meta Messaging columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {/* Hook Rate Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Hook Rate (3s / Impr)</span>
            <span className={`text-base font-bold font-mono ${layer1 && layer1.hook_rate >= 15 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {layer1?.hook_rate ?? 0}%
            </span>
            <span className="text-[9px] text-slate-400 block">البنشمارك &ge; 15%</span>
          </div>

          {/* Hold Rate Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Hold Rate (75% / 3s)</span>
            <span className={`text-base font-bold font-mono ${layer1 && layer1.hold_rate >= 5 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {layer1?.hold_rate ?? 0}%
            </span>
            <span className="text-[9px] text-slate-400 block">البنشمارك &ge; 5%</span>
          </div>

          {/* Outbound CTR Card */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Outbound CTR (الرسائل)</span>
            <span className={`text-base font-bold font-mono ${layer1 && layer1.outbound_ctr >= 1.2 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {layer1?.outbound_ctr ?? 0}%
            </span>
            <span className="text-[9px] text-slate-400 block">البنشمارك &ge; 1.2%</span>
          </div>

          {/* Cost per result (Meta Column) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Cost per result (تكلفة النتيجة)</span>
            <span className="text-base font-bold font-mono text-emerald-800">
              {layer1?.cost_per_result ?? layer1?.cost_per_message ?? 0} ج.م
            </span>
            <span className="text-[9px] text-slate-400 block">لكل محادثة بالواتساب</span>
          </div>

          {/* Messaging Conversations Started (Meta Column) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Messaging Conversations Started</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {layer1?.messaging_conversations_started ?? 0}
            </span>
            <span className="text-[9px] text-slate-400 block">محادثات رسائل جديدة</span>
          </div>

          {/* Cost per messaging conversation (Meta Column) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Cost per Messaging Conv.</span>
            <span className="text-base font-bold font-mono text-blue-800">
              {layer1?.cost_per_messaging_conversation ?? layer1?.cost_per_message ?? 0} ج.م
            </span>
            <span className="text-[9px] text-slate-400 block">تكلفة محادثة الرسائل</span>
          </div>

          {/* New & Returning Contacts Breakdown (Meta Columns) */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">New vs Returning Contacts</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {layer1?.new_messaging_contacts ?? 0} <span className="text-xs text-slate-500 font-normal">جديد</span>
            </span>
            <span className="text-[9px] text-slate-500 block font-mono">
              {layer1?.returning_messaging_contacts ?? 0} عائد
            </span>
          </div>

          {/* Cost per New Contact */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="text-[10px] text-slate-500 block font-headline">Cost per New Contact</span>
            <span className="text-base font-bold font-mono text-purple-800">
              {layer1?.cost_per_new_contact ?? 0} ج.م
            </span>
            <span className="text-[9px] text-slate-400 block">تكلفة الاتصال الجديد</span>
          </div>
        </div>
      </div>

      {/* CREATIVE ANGLE & HOOK MATRIX (الزوايا الإعلانية ومؤشر الزاوية الرابحة) */}
      <CreativeAngleMatrix
        creativeAngles={layer1?.creative_angles || []}
        winningAngle={layer1?.winning_angle}
        allCreatives={allCreatives}
      />

      {/* LEVEL BREAKDOWN FILTER (Campaign / AdSet / Creative) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline uppercase">
              <Filter className="w-4 h-4 text-emerald-700" />
              <span>مستوى التحليل والتفاصيل (Breakdown Level Analysis)</span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              اختر مستوى العرض لاكتشاف المجموعات الإعلانية الإيجابية أو التصاميم التي تتسبب في ارتفاع تكلفة المزاد (High CPM).
            </p>
          </div>

          {/* Breakdown Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-headline">
            <button
              onClick={() => setLevelMode('campaign')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                levelMode === 'campaign'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>الحملة (Campaign)</span>
            </button>

            <button
              onClick={() => setLevelMode('adset')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                levelMode === 'adset'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>المجموعة (Ad Set)</span>
              {allAdSets.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {allAdSets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setLevelMode('creative')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
                levelMode === 'creative'
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-purple-600" />
              <span>الإعلان / الفيديو (Creative)</span>
              {allCreatives.length > 0 && (
                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  {allCreatives.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* CAMPAIGN LEVEL TABLE */}
        {levelMode === 'campaign' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold font-headline border-b border-slate-200">
                <tr>
                  <th className="p-2.5">المنصة / القناة</th>
                  <th className="p-2.5">الإنفاق (Spent)</th>
                  <th className="p-2.5">الظهور (Impressions)</th>
                  <th className="p-2.5">النقرات المباشرة (Outbound)</th>
                  <th className="p-2.5">Outbound CTR</th>
                  <th className="p-2.5">المحادثات (جدد / قدامى)</th>
                  <th className="p-2.5">تحويل لشات</th>
                  <th className="p-2.5">تكلفة الجديد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ad_platforms.map((p, idx) => {
                  const obClicks = p.outbound_clicks || Math.round((p.clicks || 0) * 0.75);
                  const obCtr = p.outbound_ctr || (p.impressions > 0 ? (obClicks / p.impressions) * 100 : 0);
                  const msgs = p.messaging_conversations_started || Math.round((p.clicks || 0) * 0.18);
                  const newMsgs = p.new_messaging_contacts || Math.round(msgs * 0.75);
                  const retMsgs = p.returning_messaging_contacts || Math.max(0, msgs - newMsgs);
                  const clickToMsg = obClicks > 0 ? (msgs / obClicks) * 100 : 0;
                  const costPerNew = newMsgs > 0 ? p.spend / newMsgs : p.spend / (msgs || 1);

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span>{p.platform} ({p.channel || 'Messaging'})</span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{p.spend.toFixed(2)} ج.م</td>
                      <td className="p-2.5 font-mono text-slate-700">{p.impressions.toLocaleString()}</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{obClicks.toLocaleString()}</td>
                      <td className="p-2.5 font-mono">
                        <span className={obCtr >= 1.2 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          {obCtr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-900 font-bold">
                        {msgs} <span className="text-[10px] text-slate-500 font-normal">({newMsgs} جديد / {retMsgs} قديم)</span>
                      </td>
                      <td className="p-2.5 font-mono">
                        <span className={clickToMsg >= 35 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                          {clickToMsg.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-blue-800 font-bold">{costPerNew.toFixed(2)} ج.م</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* AD SET LEVEL TABLE */}
        {levelMode === 'adset' && (
          <div className="overflow-x-auto space-y-3">
            {allAdSets.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center text-xs text-slate-500 rounded-lg">
                لا توجد بيانات تفصيلية على مستوى الـ AdSet في هذا الملف الحجمي.
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold font-headline border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">اسم المجموعة الإعلانية (Ad Set)</th>
                    <th className="p-2.5">الاستهداف</th>
                    <th className="p-2.5">الإنفاق</th>
                    <th className="p-2.5">CPM</th>
                    <th className="p-2.5">Frequency</th>
                    <th className="p-2.5">Outbound Clicks</th>
                    <th className="p-2.5">Outbound CTR</th>
                    <th className="p-2.5">المحادثات (جدد / قدامى)</th>
                    <th className="p-2.5">تكلفة الجديد</th>
                    <th className="p-2.5">حالة المجموعة والتشخيص</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allAdSets.map((as) => (
                    <tr key={as.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 font-headline">
                        {as.name}
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                          {as.targeting_type}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{as.spend.toLocaleString()} ج.م</td>
                      <td className="p-2.5 font-mono text-slate-700">{as.cpm} ج.م</td>
                      <td className="p-2.5 font-mono">
                        <span className={as.frequency >= 3.5 ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                          {as.frequency}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">{as.outbound_clicks.toLocaleString()}</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{as.outbound_ctr}%</td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {as.messaging_conversations_started} <span className="text-[10px] text-slate-500 font-normal">({as.new_messaging_contacts} جديد)</span>
                      </td>
                      <td className="p-2.5 font-mono text-blue-800 font-bold">{as.cost_per_new_contact} ج.م</td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            as.status_light === 'GREEN_SCALE' ? 'bg-emerald-500' :
                            as.status_light === 'YELLOW_FIX' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span className="text-[11px] font-medium text-slate-700">
                            {as.leak_reason || 'أداء مستقر'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* CREATIVE LEVEL TABLE */}
        {levelMode === 'creative' && (
          <div className="overflow-x-auto space-y-3">
            {allCreatives.length === 0 ? (
              <div className="p-6 bg-slate-50 text-center text-xs text-slate-500 rounded-lg">
                لا توجد بيانات تفصيلية على مستوى التصاميم والفيديوهات (Creatives) في هذا الملف الحجمي.
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold font-headline border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">اسم الإعلان / التصميم (Creative)</th>
                    <th className="p-2.5">النوع</th>
                    <th className="p-2.5">الإنفاق</th>
                    <th className="p-2.5">Hook Rate %</th>
                    <th className="p-2.5">Hold Rate %</th>
                    <th className="p-2.5">Outbound CTR %</th>
                    <th className="p-2.5">Click-to-Message %</th>
                    <th className="p-2.5">المحادثات</th>
                    <th className="p-2.5">الحالة والتوصية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allCreatives.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900 font-headline flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{c.name}</span>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {c.format}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{c.spend.toLocaleString()} ج.م</td>
                      <td className="p-2.5 font-mono font-bold">
                        <span className={c.hook_rate >= 15 ? 'text-emerald-700' : 'text-rose-700'}>
                          {c.hook_rate}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold">
                        <span className={c.hold_rate >= 5 ? 'text-emerald-700' : 'text-amber-700'}>
                          {c.hold_rate}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">{c.outbound_ctr}%</td>
                      <td className="p-2.5 font-mono font-bold">
                        <span className={c.click_to_message_rate >= 35 ? 'text-emerald-700' : 'text-amber-700'}>
                          {c.click_to_message_rate}%
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-slate-900">
                        {c.messaging_conversations_started}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            c.status_light === 'GREEN_SCALE' ? 'bg-emerald-500' :
                            c.status_light === 'YELLOW_FIX' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span className="text-[11px] font-medium text-slate-700">
                            {c.leak_reason || 'فيديو رابح'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* DIAGNOSTIC RULES & THRESHOLDS (شجرة القرارات والتشخيص) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rules Tree Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline uppercase">
            <Eye className="w-4 h-4 text-emerald-700" />
            <span>قواعد التشخيص وشجرة القرارات (Diagnostic Rules Tree)</span>
          </h3>

          <div className="space-y-2 text-xs">
            {/* Rule 1 */}
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${layer1?.leak_code === 'PRE_CLICK_HOOK_LEAK' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="shrink-0 mt-0.5">
                {layer1?.leak_code === 'PRE_CLICK_HOOK_LEAK' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block font-headline">قاعدة 1: فحص الـ Hook Rate (&lt; 15%)</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  النتيجة الحالية: {layer1?.hook_rate ?? 0}%. {layer1?.leak_code === 'PRE_CLICK_HOOK_LEAK' ? 'خلل في أول 3 ثواني من الفيديو.' : 'معدل خاطف الانتباه ممتاز.'}
                </span>
              </div>
            </div>

            {/* Rule 2 */}
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${layer1?.leak_code === 'PRE_CLICK_HOLD_LEAK' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="shrink-0 mt-0.5">
                {layer1?.leak_code === 'PRE_CLICK_HOLD_LEAK' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block font-headline">قاعدة 2: فحص جسم الفيديو Hold Rate (&lt; 5%)</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  النتيجة الحالية: {layer1?.hold_rate ?? 0}%. {layer1?.leak_code === 'PRE_CLICK_HOLD_LEAK' ? 'الانصراف من وسط الفيديو قبل فهم العرض.' : 'معدل الاحتفاظ بالمشاهدة جيد.'}
                </span>
              </div>
            </div>

            {/* Rule 3 */}
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${layer1?.leak_code === 'PRE_CLICK_OFFER_CTA_LEAK' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="shrink-0 mt-0.5">
                {layer1?.leak_code === 'PRE_CLICK_OFFER_CTA_LEAK' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block font-headline">قاعدة 3: فحص العرض ودعوة فتح الرسالة Outbound CTR (&lt; 1.2%)</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  النتيجة الحالية: {layer1?.outbound_ctr ?? 0}%. {layer1?.leak_code === 'PRE_CLICK_OFFER_CTA_LEAK' ? 'ضعف العرض أو عدم وضوح زر فتح الشات.' : 'النية المباشرة للرسالة صحية.'}
                </span>
              </div>
            </div>

            {/* Rule 3.5: Bridge Leak */}
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${layer1?.leak_code === 'PRE_CLICK_BRIDGE_LEAK' ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="shrink-0 mt-0.5">
                {layer1?.leak_code === 'PRE_CLICK_BRIDGE_LEAK' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block font-headline">قاعدة 3.5: فحص الجسر وتحويل الضغطة لشات Bridge Rate (&lt; 35%)</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  النتيجة الحالية: {layer1?.click_to_message_rate ?? 0}%. {layer1?.leak_code === 'PRE_CLICK_BRIDGE_LEAK' ? 'تسريب بين ضغطة الإعلان وبدء الشات فعلياً.' : 'نسبة فتح الواتساب/المسنجر بعد الكليك متناغمة.'}
                </span>
              </div>
            </div>

            {/* Rule 4 & 5 */}
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${layer1?.leak_code === 'PRE_CLICK_CREATIVE_FATIGUE' || layer1?.leak_code === 'PRE_CLICK_AUCTION_NARROW_AUDIENCE' ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
              <div className="shrink-0 mt-0.5">
                {layer1?.leak_code === 'PRE_CLICK_CREATIVE_FATIGUE' || layer1?.leak_code === 'PRE_CLICK_AUCTION_NARROW_AUDIENCE' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div>
                <span className="font-bold text-slate-900 block font-headline">قاعدة 4 و5: فحص الإجهاد وتكلفة المزاد (Fatigue & Auction)</span>
                <span className="text-slate-600 text-[11px] block mt-0.5">
                  Frequency: {layer1?.frequency ?? 1.8} | CPM: {layer1?.cpm ?? '0 ج.م'}. {layer1?.leak_code === 'PRE_CLICK_CREATIVE_FATIGUE' ? 'الإعلان مجهد والجمهور تشبع منه.' : layer1?.leak_code === 'PRE_CLICK_AUCTION_NARROW_AUDIENCE' ? 'ضغط منافسة في المزاد أو استهداف ضيق.' : 'تكلفة المزاد وتكرار الجمهور في نطاق طبيعي.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-Click Red Flags Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-700" />
            <span>علامات تحذيرية قبل النقرة (Pre-Click Red Flags)</span>
          </h3>

          {layer1?.red_flags && layer1.red_flags.length > 0 ? (
            <div className="space-y-2 text-xs">
              {layer1.red_flags.map((flag, i) => (
                <div key={i} className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>لا توجد مؤشرات خطر حرجة مسجلة في منصة إعلانات ميتا حالياً.</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed font-sans mt-2">
            <span className="font-bold text-slate-800 block mb-1 font-headline">تنبيه المساعد المالي (Ground Truth Rule):</span>
            البيانات أعلاه تُستخدم حصرياً لقياس أداء الجذب والإشعارات قبل فتح الشات. حساب الصافي المالي والـ True CPA يعتمد بصرامة على أوردرات الشيت المباشرة فقط.
          </div>
        </div>
      </div>
    </div>
  );
};


