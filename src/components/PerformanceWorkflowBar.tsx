import React from 'react';
import { Database, Brain, Target, Zap, BarChart2, Award, ChevronLeft } from 'lucide-react';

interface PerformanceWorkflowBarProps {
  onStepClick?: (stepIndex: number) => void;
}

export const PerformanceWorkflowBar: React.FC<PerformanceWorkflowBarProps> = ({ onStepClick }) => {
  const steps = [
    { label: 'سحب شيت البيانات والصور', icon: <Database className="w-4 h-4" />, desc: 'الشيت والبيانات' },
    { label: 'التشخيص متعدد الطبقات', icon: <Brain className="w-4 h-4" />, desc: 'تحليل 5 مستويات' },
    { label: 'تحديد موقع التسريب', icon: <Target className="w-4 h-4" />, desc: 'نقاط التسريب' },
    { label: 'خطوات وإجراءات العلاج', icon: <Zap className="w-4 h-4" />, desc: 'إصلاح الخلل' },
    { label: 'حساب التكلفة الحقيقية (True CPA)', icon: <BarChart2 className="w-4 h-4" />, desc: 'الطلبات المؤكدة' },
    { label: 'قرار التكبير والسكيل', icon: <Award className="w-4 h-4" />, desc: 'زيادة الميزانية' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase font-headline flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>محرك دورة قياس وتحسين الأداء الإعلاني المستمر</span>
        </h4>
        <span className="text-xs text-slate-500 font-sans font-medium">دورة فحص متكاملة</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative">
        {steps.map((step, idx) => (
          <div
            key={idx}
            onClick={() => onStepClick && onStepClick(idx)}
            className="group bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 p-3.5 rounded-xl transition-all cursor-pointer flex flex-col items-center text-center relative hover:scale-[1.02] shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              {step.icon}
            </div>
            <span className="text-xs font-bold font-headline text-slate-900 group-hover:text-emerald-900 transition-colors">
              {step.label}
            </span>
            <span className="text-[11px] text-slate-500 font-sans mt-0.5">{step.desc}</span>

            {idx < steps.length - 1 && (
              <ChevronLeft className="w-4 h-4 text-slate-300 absolute -left-3 top-1/2 -translate-y-1/2 hidden lg:block z-10" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

