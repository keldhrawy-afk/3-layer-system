import React, { useState } from 'react';
import { ActionItem, FunnelLeakLocation } from '../types';
import { ShieldCheck, FileText, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

interface GuardrailsAndActionsProps {
  scalingGuardrailsScore: number;
  statusReason: string;
  diagnosisSummary: string;
  funnelLeakLocation: FunnelLeakLocation;
  actionQueue: ActionItem[];
  onToggleAction?: (index: number) => void;
}

export const GuardrailsAndActions: React.FC<GuardrailsAndActionsProps> = ({
  scalingGuardrailsScore,
  statusReason,
  diagnosisSummary,
  funnelLeakLocation,
  actionQueue,
  onToggleAction
}) => {
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCompletedMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
    if (onToggleAction) onToggleAction(idx);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">عالية جداً</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">متوسطة</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">عادية</span>;
    }
  };

  const pendingCount = actionQueue.filter((_, idx) => !completedMap[idx]).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-slate-900">
      {/* 1. Scaling Guardrails Card */}
      <div className="md:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h4 className="text-xs font-bold text-slate-900 font-headline uppercase tracking-wide">حواجز أمان السكيل (Guardrails)</h4>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700">{scalingGuardrailsScore}% نشط</span>
          </div>

          <div className="flex items-center justify-center my-4 relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="36" stroke="#e2e8f0" strokeWidth="7" fill="transparent" />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke={scalingGuardrailsScore >= 70 ? '#059669' : scalingGuardrailsScore >= 50 ? '#d97706' : '#e11d48'}
                strokeWidth="7"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={2 * Math.PI * 36 - (scalingGuardrailsScore / 100) * 2 * Math.PI * 36}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold font-mono text-slate-900">{scalingGuardrailsScore}%</span>
              <span className="text-[10px] font-headline font-bold text-emerald-700">ناجح PASSED</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 text-xs font-sans text-slate-700 space-y-1">
          <span className="text-slate-500 font-headline font-bold uppercase block text-[11px]">القاعدة الفعالة الحالية:</span>
          <p className="text-slate-800 font-medium text-xs leading-relaxed">{statusReason}</p>
        </div>
      </div>

      {/* 2. Diagnosis Summary Card & Action Queue */}
      <div className="md:col-span-8 flex flex-col gap-4">
        {/* Executive Summary in Arabic */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-emerald-900 uppercase font-headline flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>الملخص التنفيذي للتشخيص (Executive Summary)</span>
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">
              تسريب: {funnelLeakLocation.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-sans font-medium">
            "{diagnosisSummary || 'الحملات تعمل بكفاءة مستهدفة للطلب الفعلي. حافظ على تسلسل التأكيدات الفورية قبل إجراء سكيل الميزانية.'}"
          </p>
        </div>

        {/* Live Action Queue Table in Arabic */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-headline">قائمة المهام والتوصيات المطلوبة (Action Queue)</h3>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full">
              متبقي {pendingCount} مهمة معلقة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-headline font-bold text-slate-700 border-b border-slate-200">
                  <th className="px-3 py-2.5">المهمة المطلوبة</th>
                  <th className="px-3 py-2.5">القسم</th>
                  <th className="px-3 py-2.5">الأولوية</th>
                  <th className="px-3 py-2.5 text-left">الحالة</th>
                </tr>
              </thead>
              <tbody className="text-xs font-sans">
                {actionQueue.map((item, idx) => {
                  const isDone = !!completedMap[idx];
                  return (
                    <tr
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className={`px-3 py-3 font-medium leading-relaxed ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {item.action}
                      </td>
                      <td className="px-3 py-3 text-emerald-700 font-bold font-headline text-[11px]">
                        {item.category === 'Creative' ? 'المحتوى الإبداعي' : item.category === 'CRO' ? 'تحسين التحويل' : item.category === 'Budget' ? 'الميزانية' : 'الكول سنتر/الشيت'}
                      </td>
                      <td className="px-3 py-3">
                        {getPriorityBadge(item.priority)}
                      </td>
                      <td className="px-3 py-3 text-left font-bold">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            مكتملة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            معلقة
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

