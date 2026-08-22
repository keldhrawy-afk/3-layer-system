import React, { useMemo } from 'react';
import { Award, PackageCheck, Tag, Megaphone, Database } from 'lucide-react';
import { AuditPayload, AuditResult } from '../types';

interface CommercialOutputsBoardProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export const CommercialOutputsBoard: React.FC<CommercialOutputsBoardProps> = ({ payload, auditResult }) => {
  const products = useMemo(() => [...(payload.backend_sheet.product_performance || [])]
    .sort((a, b) => b.confirmed_orders - a.confirmed_orders)
    .slice(0, 3), [payload.backend_sheet.product_performance]);
  const topSources = useMemo(() => [...(payload.backend_sheet.operations?.sources || [])]
    .sort((a, b) => b.delivered_orders - a.delivered_orders || b.revenue - a.revenue)
    .slice(0, 3), [payload.backend_sheet.operations?.sources]);

  const offers = (payload.content_offers || []).filter((offer) => offer.status === 'ACTIVE');
  const winningAngle = auditResult.layer1_diagnostic?.winning_angle;

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-5" dir="rtl">
      <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0"><PackageCheck className="w-4 h-4" /></div>
            <div>
              <p className="text-[10px] font-bold text-emerald-700">مخرجات المبيعات القابلة للتنفيذ</p>
              <h2 className="text-sm font-black font-headline text-slate-900">الأكثر مبيعاً والأكثر ربحية</h2>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">CRM Ground Truth</span>
        </header>

        {products.length > 0 ? (
          <div className="space-y-2.5">
            {products.map((product, index) => {
              const revenue = product.revenue ?? product.confirmed_orders * payload.backend_sheet.average_order_value;
              const deliveredRate = product.delivered_orders === undefined ? null : (product.delivered_orders / Math.max(1, product.confirmed_orders)) * 100;
              return <div key={`${product.product_name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-800 flex items-center justify-center text-xs font-black shrink-0">{index + 1}</span>
                  <div className="min-w-0"><strong className="block text-xs text-slate-900 truncate">{product.product_name}</strong><span className="text-[10px] text-slate-500">{product.confirmed_orders.toLocaleString()} أوردر مؤكد</span></div>
                </div>
                <div className="text-left shrink-0"><strong className="block text-xs font-mono text-emerald-700">{revenue.toLocaleString()} ج.م</strong><span className="text-[10px] text-slate-500">{deliveredRate === null ? 'التسليم: غير مرفوع' : `التسليم: ${deliveredRate.toFixed(0)}%`}</span></div>
              </div>;
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 leading-relaxed flex gap-2.5"><Database className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" /><span>ارفع في شيت الـCRM أعمدة <strong>Product Name</strong> و<strong>Confirmed Orders</strong> و<strong>Revenue</strong> ليظهر ترتيب المنتجات الحقيقي؛ لن نعرض ترتيباً تخمينياً.</span></div>
        )}

        {topSources.length > 0 && <div className="border-t border-slate-100 pt-3"><div className="flex items-center justify-between mb-2"><strong className="text-xs text-slate-900">أفضل المصادر بعد التسليم</strong><span className="text-[10px] text-slate-500">ERP Export</span></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-2">{topSources.map((source) => <div key={source.name} className="rounded-lg bg-emerald-50/70 border border-emerald-100 p-2"><strong className="block truncate text-[11px] text-emerald-900">{source.name}</strong><span className="text-[10px] text-slate-600">{source.delivered_orders} مُسلّم / {source.orders} أوردر</span><span className="block mt-1 text-[10px] font-mono text-emerald-700">{source.revenue.toLocaleString()} ج.م</span></div>)}</div></div>}
      </article>

      <article className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex gap-2.5"><div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center shrink-0"><Megaphone className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-violet-700">مخرجات التسويق والمحتوى</p><h2 className="text-sm font-black font-headline text-slate-900">العروض الحالية داخل المحتوى</h2></div></div>
          <span className="text-[10px] text-slate-500 font-mono">Live Content Offers</span>
        </header>

        {offers.length > 0 ? <div className="space-y-2.5">{offers.map((offer) => <div key={offer.id} className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-1.5"><div className="flex justify-between gap-2"><strong className="text-xs text-slate-900">{offer.title}</strong><span className="px-2 py-0.5 rounded-full bg-white border border-violet-200 text-[10px] text-violet-800">{offer.channel}</span></div><p className="text-[11px] text-slate-700 leading-relaxed">{offer.offer_text}</p>{offer.ends_at && <span className="text-[10px] text-violet-700">ينتهي: {offer.ends_at}</span>}</div>)}</div> : <div className="rounded-xl border border-dashed border-violet-200 bg-violet-50/60 p-4 text-xs text-violet-950 leading-relaxed flex gap-2.5"><Tag className="w-4 h-4 shrink-0 mt-0.5 text-violet-700" /><span>لا يوجد عرض نشط مسجل. أضف <strong>content_offers</strong> في ملف الـJSON ليظهر العرض نفسه، القناة، وتاريخ انتهائه بدون تخمين.</span></div>}

        {winningAngle && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-950 leading-relaxed"><Award className="w-4 h-4 shrink-0 text-amber-700" /><span><strong>توجيه المحتوى الحالي:</strong> اربط أي عرض نشط بالزاوية الرابحة «{winningAngle.label_ar}» لأنها تحقق CVR {winningAngle.cvr}% وBlended CPA {winningAngle.blended_cpa} ج.م، ولا تغيّر العرض قبل اختبار نسخة واحدة جديدة.</span></div>}
      </article>
    </section>
  );
};
