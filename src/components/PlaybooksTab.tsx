import React from 'react';
import { BookOpen, PhoneCall, Zap, ShieldCheck, Video } from 'lucide-react';

export const PlaybooksTab: React.FC = () => {
  const playbooks = [
    {
      title: 'علاج تسريب تأكيدات طلبات الدفع عند الاستلام (معدل التأكيد < 70%)',
      category: 'الكول سنتر وشيت المبيعات',
      icon: <PhoneCall className="w-4 h-4 text-emerald-700" />,
      steps: [
        'إرسال رسالة واتساب فورية خلال دقيقتين من تسجيل الطلب بالشيت تتضمن ملخص الطلب ورابط تأكيد مباشر.',
        'الاتصال الهاتفي بالعميل خلال 30 دقيقة في أوقات العمل الرسمية (10 صباحاً - 9 مساءً).',
        'تدريب فريق المتابعة على مراجعة تفاصيل العنوان بدقة، موعد التسليم المفضل، وإجمالي المبلغ المطلوب.',
        'فلترة الأرقام المكررة أو المشبوهة قبل تحويل الطلب لشركة الشحن.'
      ]
    },
    {
      title: 'تنشيط إعلانات الفيديوهات وتحديث أول 3 ثواني (معدل Hook < 25%)',
      category: 'تطوير وصناعة المحتوى الإعلاني',
      icon: <Video className="w-4 h-4 text-emerald-700" />,
      steps: [
        'استبدال أول 3 ثواني من الفيديو الحالي بـ 3 أفكار خطاف جديدة (سؤال مباشر، عرض المنتج الفوري، أو عرض السعر).',
        'إضافة نصوص توضيحية واضحة بخط عريض على الفيديو للمشاهدين بدون صوت.',
        'الالتزام بمدة إجمالية للفيديو بين 15 إلى 25 ثانية مع تنوع بصري سريع.',
        'تجربة فيديوهات UGC من صناع محتوى حقيقيين يستعرضون طريقة استخدام المنتج (Unboxing).'
      ]
    },
    {
      title: 'قواعد زيادة الميزانية والتوسع (قاعدة الـ 20% التدريجية)',
      category: 'الميزانيات والتوسع الإعلاني',
      icon: <Zap className="w-4 h-4 text-emerald-700" />,
      steps: [
        'بدء زيادة الميزانية فقط للحملات المستقرة ذات هامش الربح الصافي الإيجابي.',
        'زيادة الميزانية بنسبة 15% إلى 20% كل 48 ساعة بدلاً من المضاعفة الفجائية لتجنب إرباك الخوارزمية.',
        'نسخ أفضل الإعلانات نجاحاً في حملة سكيل منفصلة بجمهور واسع (Broad).',
        'إيقاف الإعلانات التي تتجاوز تكلفة الأوردر المؤكد فيها 1.5x من التكلفة المستهدفة.'
      ]
    },
    {
      title: 'منع الطلبات الوهمية وتأكيد جودة البيانات',
      category: 'حماية المبيعات وتأكيد الجودة',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
      steps: [
        'تفعيل التأكيد الهاتفي بكود SMS عند تسجيل الطلب إذا زادت نسبة الطلبات الوهمية.',
        'إضافة قائمة منسدلة اختيارية للمحافظات والمدن لمنع كتابة العناوين بشكل خاطئ.',
        'التأكد من صحة رقم الموبايل المدخل بالشيت وسريانه.',
        'تصفية طلبات الشيت المكررة بشكل تلقائي بناءً على رقم الموبايل أو العنوان.'
      ]
    }
  ];

  return (
    <div className="space-y-6 text-slate-900">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline uppercase">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <span>دليل ودليل خطط العمل الميدانية للتطبيق الفوري</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 font-sans">
            خطط تنفيذية مباشرة ومجربة للمسوقين وأصحاب المتاجر لرفع الأداء وحل المشكلات.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playbooks.map((pb, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-100 border border-emerald-300">
                  {pb.icon}
                </div>
                <div>
                  <span className="text-[10px] font-headline font-bold text-emerald-800 uppercase tracking-wide block">
                    {pb.category}
                  </span>
                  <h3 className="text-xs font-bold font-headline text-slate-900 leading-snug">{pb.title}</h3>
                </div>
              </div>

              <div className="space-y-2 font-sans">
                {pb.steps.map((step, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] text-emerald-800 font-bold font-mono shrink-0 mt-0.5 shadow-2xs">
                      {sIdx + 1}
                    </span>
                    <p className="leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

