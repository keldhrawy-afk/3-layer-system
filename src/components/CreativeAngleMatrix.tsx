import React, { useState } from 'react';
import { CreativeAngleAnalysis, CreativeBreakdown } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  Award, 
  Target, 
  Stethoscope, 
  AlertCircle, 
  Flame, 
  Users, 
  Percent, 
  Tag, 
  BookOpen, 
  Film, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Compass
} from 'lucide-react';

interface CreativeAngleMatrixProps {
  creativeAngles: CreativeAngleAnalysis[];
  winningAngle?: CreativeAngleAnalysis;
  allCreatives: CreativeBreakdown[];
}

export const CreativeAngleMatrix: React.FC<CreativeAngleMatrixProps> = ({
  creativeAngles,
  winningAngle,
  allCreatives
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const getAngleIcon = (cat: string) => {
    switch (cat) {
      case 'DOCTOR_RECOMMENDATION':
        return <Stethoscope className="w-4 h-4 text-emerald-600" />;
      case 'PROBLEM_SOLVING':
        return <Target className="w-4 h-4 text-rose-600" />;
      case 'BEFORE_AFTER':
        return <Flame className="w-4 h-4 text-amber-600" />;
      case 'UGC_CUSTOMER_REVIEW':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'OFFERS_DISCOUNTS':
        return <Tag className="w-4 h-4 text-purple-600" />;
      case 'FOUNDER_STORY':
        return <BookOpen className="w-4 h-4 text-indigo-600" />;
      default:
        return <Film className="w-4 h-4 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: CreativeAngleAnalysis['angle_status']) => {
    switch (status) {
      case 'WINNING':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
          label: '🔥 الزاوية الرابحة (Top Scaler)'
        };
      case 'SCALABLE':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
          label: '🟢 قابلة للتكبير (Scalable)'
        };
      case 'PROMISING':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          label: '🟡 واعدة تحتاج تحسين الهوك'
        };
      case 'DRAINING_BUDGET':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
          label: '🔴 تستنزف الميزانية (توقف/تغيير)'
        };
    }
  };

  const filteredCreatives = selectedCategory === 'ALL'
    ? allCreatives
    : allCreatives.filter(c => c.angle_category === selectedCategory);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6" dir="rtl">
      {/* Header & Core Philosophy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 text-purple-800 border border-purple-200">
              Creative Strategy & Directives
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
              Layer 1 Deep Analytics
            </span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline">
            <Compass className="w-5 h-5 text-purple-600" />
            <span>مصفوفة الزوايا الإعلانية والهوك (Creative Angle & Hook Matrix)</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            بدل تقييم الإعلان باسم الـ Ad Set، يقوم السيستم تلقائياً بتصنيف الكريتيف حسب <span className="font-bold text-slate-900">الزاوية التسويقية (Angle)</span> وتحديد الزاوية الأكثر تحقيقاً للأوردرات الحقيقية (أعلى CVR وأقل Blended CPA) لتوجيه فريق المحتوى لإنتاج ما يدخل الأرباح فعلياً.
          </p>
        </div>

        {winningAngle && (
          <div className="bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-3.5 rounded-xl border border-emerald-200 shadow-sm shrink-0 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg border border-emerald-200 text-emerald-700">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                مؤشر الزاوية الرابحة (Winning Angle)
              </span>
              <span className="text-sm font-black font-headline text-slate-900 block">
                {winningAngle.label_ar}
              </span>
              <span className="text-[11px] text-emerald-800 font-mono block">
                CVR: {winningAngle.cvr}% • Blended CPA: {winningAngle.blended_cpa} ج.م
              </span>
            </div>
          </div>
        )}
      </div>

      {/* WINNING ANGLE BANNER & CONTENT TEAM DIRECTIVE */}
      {winningAngle && (
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50 border-2 border-emerald-300/80 rounded-xl p-4.5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-sm text-emerald-950 font-headline">
                توجيه فوري لفريق المحتوى والميديا باير (Content & Media Buying Directive):
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-emerald-600 text-white rounded-md shadow-2xs">
              توجيه الميزانية والإنتاج 🔥
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 font-headline block">الزاوية المحققة لأعلى مبيعات</span>
              <div className="font-black text-slate-900 text-sm font-headline flex items-center gap-1.5">
                {getAngleIcon(winningAngle.angle_category)}
                <span>{winningAngle.label_ar}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                حققت <span className="font-bold text-emerald-800">{winningAngle.total_orders} طلب مؤكد</span> من أصل {winningAngle.total_messages} محادثة.
              </p>
            </div>

            <div className="p-3 bg-white border border-emerald-200 rounded-lg space-y-1">
              <span className="text-[10px] text-slate-500 font-headline block">كفاءة التحويل المالي (Financial Efficiency)</span>
              <div className="font-black text-emerald-800 text-sm font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Blended CPA: {winningAngle.blended_cpa} ج.م</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                معدل تحويل المحادثات لأوردرات: <span className="font-bold text-emerald-700 font-mono">{winningAngle.cvr}% CVR</span>
              </p>
            </div>

            <div className="p-3 bg-violet-50 border border-violet-200 text-slate-900 rounded-lg space-y-1">
              <span className="text-[10px] text-violet-800 font-headline block">أمر التشغيل لـ Content Team</span>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                {winningAngle.content_team_directive}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ANGLES MATRIX GRID COMPARISON */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900 font-headline uppercase flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-600" />
            <span>مقارنة أداء الزوايا الإعلانية (Angle-by-Angle Breakdown)</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-sans">
            مرتبة حسب العائد الفعلي (CVR و Blended CPA)
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {creativeAngles.map((angle) => {
            const badge = getStatusBadge(angle.angle_status);
            return (
              <div 
                key={angle.angle_category}
                className={`rounded-xl border p-4.5 space-y-3.5 transition-all bg-white relative overflow-hidden ${
                  angle.is_winning_angle 
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {angle.is_winning_angle && (
                  <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-br-lg">
                    TOP WINNER
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                      {getAngleIcon(angle.angle_category)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-headline">
                        {angle.label_ar}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {angle.creatives_count} كريتيف / إعلانات في هذه الزاوية
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">معدل التحويل (CVR)</span>
                    <span className={`text-sm font-bold font-mono ${angle.cvr >= 12 ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {angle.cvr}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">Blended CPA (تكلفة الأوردر)</span>
                    <span className={`text-sm font-bold font-mono ${angle.blended_cpa <= 350 ? 'text-emerald-700' : angle.blended_cpa <= 500 ? 'text-blue-700' : 'text-rose-700'}`}>
                      {angle.blended_cpa > 0 ? `${angle.blended_cpa} ج.م` : 'N/A'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">الطلبات والمحادثات</span>
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {angle.total_orders} أوردر <span className="text-[10px] text-slate-500 font-normal">/ {angle.total_messages} شات</span>
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">الإنفاق الإجمالي</span>
                    <span className="text-xs font-bold font-mono text-slate-900">
                      {angle.total_spend.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">Hook Rate (3s)</span>
                    <span className={`text-xs font-bold font-mono ${angle.avg_hook_rate >= 20 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {angle.avg_hook_rate}%
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 block font-headline">Hold Rate (75%)</span>
                    <span className={`text-xs font-bold font-mono ${angle.avg_hold_rate >= 15 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {angle.avg_hold_rate}%
                    </span>
                  </div>
                </div>

                {/* Content Directive Box */}
                <div className="p-2.5 bg-violet-50 border border-violet-200 text-slate-700 rounded-lg text-[11px] leading-relaxed">
                  <span className="text-violet-800 font-bold block mb-0.5 flex items-center gap-1 font-headline">
                    <TrendingUp className="w-3 h-3 text-violet-600" />
                    <span>توجيه الإنتاج:</span>
                  </span>
                  <span className="text-slate-700">
                    {angle.content_team_directive}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CLASSIFIED CREATIVES DRILL-DOWN TABLE */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-headline uppercase flex items-center gap-1.5">
              <Film className="w-4 h-4 text-purple-600" />
              <span>تفاصيل الإعلانات والتصاميم مصنفة بالزوايا (Creatives Drill-down)</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              استعراض الإعلانات المرتبطة بكل زاوية إعلانية مع مؤشرات الجودة والطلبات المحققة
            </p>
          </div>

          {/* Angle Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-headline">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              جميع الزوايا ({allCreatives.length})
            </button>
            {creativeAngles.map((a) => (
              <button
                key={a.angle_category}
                onClick={() => setSelectedCategory(a.angle_category)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
                  selectedCategory === a.angle_category
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{a.label_ar}</span>
                <span className="text-[10px] font-mono opacity-80">({a.creatives_count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold font-headline border-b border-slate-200">
              <tr>
                <th className="p-2.5">الإعلان والكريتيف</th>
                <th className="p-2.5">الزاوية المصنفة (Angle)</th>
                <th className="p-2.5">نوع الهوك (Hook Type)</th>
                <th className="p-2.5">الإنفاق</th>
                <th className="p-2.5">Hook %</th>
                <th className="p-2.5">Hold %</th>
                <th className="p-2.5">المحادثات</th>
                <th className="p-2.5">الطلبات المؤكدة</th>
                <th className="p-2.5">معدل التحويل (CVR)</th>
                <th className="p-2.5">Blended CPA</th>
                <th className="p-2.5">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCreatives.map((c) => {
                const cvr = c.conversion_rate || (c.messaging_conversations_started > 0 && c.attributed_orders ? Math.round((c.attributed_orders / c.messaging_conversations_started) * 100) : 0);
                const cpa = c.blended_cpa || (c.attributed_orders && c.attributed_orders > 0 ? Math.round(c.spend / c.attributed_orders) : 0);

                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 font-headline">
                      <div className="flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mr-5">ID: {c.id} • {c.format}</span>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1 w-fit">
                        {getAngleIcon(c.angle_category || 'OTHER')}
                        <span>{c.angle_label_ar || 'زاوية عامة'}</span>
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-700 font-medium">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {c.hook_type_ar || 'هوك اعتيادي'}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">
                      {c.spend.toLocaleString()} ج.م
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      <span className={c.hook_rate >= 20 ? 'text-emerald-700' : 'text-amber-700'}>
                        {c.hook_rate}%
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      <span className={c.hold_rate >= 15 ? 'text-emerald-700' : 'text-amber-700'}>
                        {c.hold_rate}%
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">
                      {c.messaging_conversations_started}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-emerald-800">
                      {c.attributed_orders ?? '—'}
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      <span className={cvr >= 12 ? 'text-emerald-700' : 'text-slate-800'}>
                        {cvr > 0 ? `${cvr}%` : '—'}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      <span className={cpa > 0 && cpa <= 350 ? 'text-emerald-700' : cpa <= 500 ? 'text-blue-700' : 'text-rose-700'}>
                        {cpa > 0 ? `${cpa} ج.م` : '—'}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          c.status_light === 'GREEN_SCALE' ? 'bg-emerald-500' :
                          c.status_light === 'YELLOW_FIX' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        <span className="text-[11px] font-medium text-slate-700">
                          {c.leak_reason || (c.status_light === 'GREEN_SCALE' ? 'رابح وقابل للسكيل' : 'يحتاج مراجعة')}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
