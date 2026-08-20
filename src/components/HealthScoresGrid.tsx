import React from 'react';
import { HealthScores } from '../types';
import { Radio, Eye, Filter, GitBranch } from 'lucide-react';

interface HealthScoresGridProps {
  scores: HealthScores;
  overclaimPct?: number;
  funnelLeakLocation?: string;
}

export const HealthScoresGrid: React.FC<HealthScoresGridProps> = ({
  scores,
  overclaimPct = 0,
  funnelLeakLocation = 'POST_CLICK_CONFIRMATION_LEAK'
}) => {
  const getStatusLabel = (score: number) => {
    if (score >= 85) return { label: 'ممتاز', color: 'text-emerald-700', stroke: '#059669', bg: 'bg-emerald-100' };
    if (score >= 70) return { label: 'جيد', color: 'text-blue-700', stroke: '#2563eb', bg: 'bg-blue-100' };
    if (score >= 50) return { label: 'تحذير', color: 'text-amber-800', stroke: '#d97706', bg: 'bg-amber-100' };
    return { label: 'حرج جداً', color: 'text-rose-800', stroke: '#e11d48', bg: 'bg-rose-100' };
  };

  const scoreItems = [
    {
      title: 'تشخيص المحتوى الإعلاني',
      subtitle: 'نسب الخطاف والإرهاق الإعلاني',
      score: scores.creative_diagnosis,
      icon: <Eye className="w-4 h-4 text-emerald-700" />,
      detail: funnelLeakLocation.startsWith('PRE_CLICK') ? 'انخفاض في نسبة الخطاف/المشاهدة' : 'أداء الكرييتف ممتاز ومستقر'
    },
    {
      title: 'فحص تجربة الشراء (CRO)',
      subtitle: 'سلاسة صفحة الهبوط وتأكيد الطلب',
      score: scores.cro_audit,
      icon: <Filter className="w-4 h-4 text-emerald-700" />,
      detail: funnelLeakLocation === 'POST_CLICK_CONFIRMATION_LEAK' ? 'تسريب في تأكيد أوردرات الكول سنتر' : 'معدل تحويل الصفحة منتظم'
    },
    {
      title: 'سلامة وتطابق البيانات',
      subtitle: 'دقة الـ Pixel و CAPI وتطابق الشيت',
      score: scores.signal_integrity,
      icon: <Radio className="w-4 h-4 text-emerald-700" />,
      detail: Math.abs(overclaimPct) > 20 ? `مبالغة المنصات بنسبة ${overclaimPct.toFixed(1)}%` : 'مزامنة الـ Pixel والشيت متطابقة'
    },
    {
      title: 'إسناد المبيعات المباشر',
      subtitle: 'مطابقة المبيعات الفعلية للحملات',
      score: scores.attribution_check ?? Math.round((scores.signal_integrity + scores.scaling_guardrails) / 2),
      icon: <GitBranch className="w-4 h-4 text-emerald-700" />,
      detail: 'مؤكد مع شيت الأوردرات'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-slate-900">
      {scoreItems.map((item, idx) => {
        const status = getStatusLabel(item.score);
        const radius = 32;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (item.score / 100) * circumference;

        return (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-tight font-headline">{item.title}</h4>
                <p className="text-[11px] text-slate-500 font-sans">{item.subtitle}</p>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="flex items-center justify-center my-3 relative">
              <svg className="w-22 h-22 transform -rotate-90">
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  stroke={status.stroke}
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold font-mono text-slate-900">{item.score}%</span>
                <span className={`text-[10px] font-bold font-headline ${status.color}`}>{status.label}</span>
              </div>
            </div>

            {/* Progress bar fallback visual */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3 border border-slate-200">
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${item.score}%`, backgroundColor: status.stroke }}
              />
            </div>

            {/* Bottom Mini Metric Bar */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
              <span className="text-slate-500 font-bold font-headline">النتيجة:</span>
              <span className="text-slate-800 font-bold">{item.detail}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

