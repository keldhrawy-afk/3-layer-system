import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { AuditPayload, AuditResult, AdPlatformData, BackendSheetData } from '../types';
import { run5LayerAudit } from '../lib/auditEngine';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Download, 
  Zap,
  BarChart2,
  FileCode,
  Image as ImageIcon,
  Eye,
  Trash2,
  MessageSquare,
  Type,
  Copy,
  RotateCcw
} from 'lucide-react';

interface FileUploadTabProps {
  currentPayload: AuditPayload;
  onAuditExecute: (updatedPayload: AuditPayload, newResult: AuditResult) => void;
  onNavigateToOverview?: () => void;
}

export const FileUploadTab: React.FC<FileUploadTabProps> = ({
  currentPayload,
  onAuditExecute,
  onNavigateToOverview
}) => {
  const [activeUploadType, setActiveUploadType] = useState<'ad_platform' | 'backend_sheet' | 'image_creative' | 'chat_screenshots' | 'full_json' | 'direct_text'>('ad_platform');
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileStatus, setFileStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Direct text input state
  const [directTextInput, setDirectTextInput] = useState<string>(
`تاريخ اليوم: 19
مؤشرات الإعلان:
- الصرف: 48,500 ج.م
- الظهور: 450,000
- الكليكات: 9,500 (CTR: 2.4%)
- تكلفة الكليك CPC: 1.80 ج.م
- CPA السابق: 88 ج.م
- CPA الحالي: 155 ج.م

شيت الكول سنتر والطلبات:
- إجمالي الطلبات (Raw Leads): 233
- الطلبات المؤكدة (Confirmed): 121
- المرتجعات والملغية: 58
- المسلمة: 98
- تكلفة القطعة COGS: 350 ج.م
- سعر البيع AOV: 1,200 ج.م

حالة العوامل الخارجية:
- المنافسين: مستقر في Meta Ad Library
- سرعة رد السيلز FRT: 3 دقائق
- حالة المخزون: الروتين مكتمل`
  );
  
  // Image creative upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ name: string; size: string } | null>(null);

  // Chat evaluation screenshots (5-10 images)
  const [chatScreenshots, setChatScreenshots] = useState<{ id: string; name: string; url: string; note: string }[]>([]);

  // Staging payload state before applying audit
  const [stagedPayload, setStagedPayload] = useState<AuditPayload>(currentPayload);
  const [parsedRowsPreview, setParsedRowsPreview] = useState<Record<string, any>[] | null>(null);
  const [uploadedSources, setUploadedSources] = useState({ adPlatform: false, backend: false });
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [auditCompleted, setAuditCompleted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Detect numeric columns from CSV/Excel row
  const extractNum = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  // Process uploaded file (CSV, XLSX, Image, or JSON)
  const handleFileProcess = (file: File) => {
    setFileName(file.name);
    setFileStatus({ type: 'info', message: 'جاري قراءة ومعالجة الملف...' });

    const ext = file.name.split('.').pop()?.toLowerCase();

    // Image File upload handler
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext || '')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultUrl = e.target?.result as string;
        if (activeUploadType === 'chat_screenshots') {
          const newScreenshot = {
            id: String(Date.now()),
            name: `نموذج ${chatScreenshots.length + 1}: ${file.name}`,
            url: resultUrl,
            note: 'صورة شات مرفوعة مخصصة لتقييم الـ FRT والسكريبت.'
          };
          setChatScreenshots(prev => [...prev, newScreenshot]);
          setFileStatus({
            type: 'success',
            message: `تم إضافة صورة الشات (${file.name}) إلى قائمة نماذج التقييم (الإجمالي: ${chatScreenshots.length + 1} صور).`
          });
        } else {
          setImagePreview(resultUrl);
          setImageInfo({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB'
          });
          setFileStatus({
            type: 'success',
            message: `تم رفع صورة الإعلان (${file.name}) بنجاح! جاهزة لتحليل المحتوى الإبداعي والـ Hook البصري.`
          });
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          if (json.ad_platforms && json.backend_sheet) {
            setStagedPayload(json);
            setFileStatus({ type: 'success', message: 'تم فتح ملف الـ JSON المكتمل واستخراج البيانات بنجاح!' });
          } else if (Array.isArray(json)) {
            processParsedData(json);
          } else {
            processParsedData([json]);
          }
        } catch (err) {
          setFileStatus({ type: 'error', message: 'ملف JSON غير صالح. يرجى التأكد من التنسيق.' });
        }
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);
          
          if (jsonRows.length === 0) {
            setFileStatus({ type: 'error', message: 'الملف المرفوع فارغ لا يحتوي على صفوف بيانات.' });
            return;
          }

          processParsedData(jsonRows);
        } catch (err) {
          setFileStatus({ type: 'error', message: 'حدث خطأ أثناء قراءة ملف Excel.' });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Default CSV parse
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0 && results.data.length === 0) {
            setFileStatus({ type: 'error', message: 'خطأ في قراءة ملف الـ CSV.' });
            return;
          }
          const rows = results.data as Record<string, any>[];
          processParsedData(rows);
        },
        error: () => {
          setFileStatus({ type: 'error', message: 'فشل تحليل ملف الـ CSV.' });
        }
      });
    }
  };

  // Map parsed rows into ad platform data or backend sheet data
  const processParsedData = (rows: Record<string, any>[]) => {
    setParsedRowsPreview(rows.slice(0, 5));

    if (activeUploadType === 'ad_platform' || activeUploadType === 'image_creative') {
      let totalImpressions = 0;
      let totalSpend = 0;
      let totalClicks = 0;
      let total3Sec = 0;
      let total75Pct = 0;
      let totalOrders = 0;
      let totalRev = 0;
      let totalReach = 0;
      let totalMessages = 0;
      let totalNewMessages = 0;
      let totalReturningMessages = 0;
      let totalWelcomeMessages = 0;
      let totalEngagement = 0;
      let totalReactions = 0;
      let totalComments = 0;
      let totalSaves = 0;
      let totalShares = 0;
      let totalPhotoClicks = 0;

      rows.forEach((row) => {
        const findVal = (...keys: string[]) => {
          for (const key of Object.keys(row)) {
            const lowerKey = key.toLowerCase().trim();
            if (keys.some(k => lowerKey.includes(k.toLowerCase()))) {
              return extractNum(row[key]);
            }
          }
          return 0;
        };

        totalImpressions += findVal('impression', 'ظهور', 'الظهور', 'views');
        totalSpend += findVal('spend', 'amount spent', 'الصرف', 'المبلغ المنفق', 'cost');
        totalClicks += findVal('click', 'كليك', 'الضغطات', 'النقرات');
        total3Sec += findVal('3sec', '3-sec', '3 second', 'ثواني', 'hook');
        total75Pct += findVal('75%', '75 percent', 'hold', 'احتفاظ');
        totalOrders += findVal('order', 'conversion', 'purchase', 'طلب', 'المبيعات', 'raw');
        totalRev += findVal('revenue', 'value', 'إيرادات', 'القيمة');
        totalReach += findVal('reach', 'الوصول');
        totalMessages += findVal('messaging conversations', 'results', 'conversation started', 'بدء المحادثات');
        totalNewMessages += findVal('new messaging', 'جهات اتصال جديدة');
        totalReturningMessages += findVal('returning messaging', 'جهات اتصال عائدة');
        totalWelcomeMessages += findVal('welcome message', 'رسالة ترحيب');
        totalEngagement += findVal('post engagement', 'تفاعل المنشور');
        totalReactions += findVal('post reactions', 'تفاعلات المنشور');
        totalComments += findVal('post comments', 'تعليقات المنشور');
        totalSaves += findVal('post saves', 'حفظ المنشور');
        totalShares += findVal('post shares', 'مشاركات المنشور');
        totalPhotoClicks += findVal('photo clicks', 'نقرات الصورة');
      });

      const updatedAdPlatform: AdPlatformData = {
        platform: 'Meta',
        impressions: totalImpressions,
        spend: totalSpend,
        clicks: totalClicks,
        three_sec_views: total3Sec,
        seventy_five_percent_views: total75Pct,
        reported_orders: totalOrders,
        reported_revenue: totalRev,
        reach: totalReach || undefined,
        messaging_conversations_started: totalMessages || undefined,
        new_messaging_contacts: totalNewMessages || undefined,
        returning_messaging_contacts: totalReturningMessages || undefined,
        welcome_messages: totalWelcomeMessages || undefined,
        post_engagement: totalEngagement || undefined,
        post_reactions: totalReactions || undefined,
        post_comments: totalComments || undefined,
        post_saves: totalSaves || undefined,
        post_shares: totalShares || undefined,
        photo_clicks: totalPhotoClicks || undefined,
        campaign_age_hours: 120,
        budget_scaled_24h_pct: 10
      };

      setStagedPayload(prev => ({
        ...prev,
        ad_platforms: [updatedAdPlatform]
      }));

      setUploadedSources(prev => ({ ...prev, adPlatform: totalSpend > 0 && totalImpressions > 0 && totalClicks > 0 }));

      setFileStatus({
        type: totalSpend > 0 && totalImpressions > 0 && totalClicks > 0 ? 'success' : 'error',
        message: totalSpend > 0 && totalImpressions > 0 && totalClicks > 0
          ? `تم تحليل ${rows.length} صف من تقرير المنصات بنجاح! الصرف: ${totalSpend.toLocaleString()} ج.م | الظهور: ${totalImpressions.toLocaleString()}`
          : 'لم نجد الصرف أو الظهور أو الكليكات في الأعمدة. راجع أسماء الأعمدة قبل المتابعة؛ لن يستخدم النظام قيماً افتراضية.'
      });
    } else if (activeUploadType === 'backend_sheet') {
      let rawLeads = 0;
      let confirmed = 0;
      let cancelled = 0;
      let delivered = 0;
      let cogs = 0;
      let aov = 0;
      let detailedRevenue = 0;
      const products = new Map<string, { confirmed_orders: number; revenue: number; delivered_orders: number; cancelled_orders: number }>();
      const dimensions = {
        sources: new Map<string, { orders: number; confirmed_orders: number; delivered_orders: number; cancelled_orders: number; revenue: number }>(),
        sales_reps: new Map<string, { orders: number; confirmed_orders: number; delivered_orders: number; cancelled_orders: number; revenue: number }>(),
        governorates: new Map<string, { orders: number; confirmed_orders: number; delivered_orders: number; cancelled_orders: number; revenue: number }>(),
        couriers: new Map<string, { orders: number; confirmed_orders: number; delivered_orders: number; cancelled_orders: number; revenue: number }>()
      };
      const isDetailedOrdersExport = rows.some((row) => Object.keys(row).some((key) => /order\s*(id|no|number)?|invoice|رقم.*(اوردر|طلب|فاتورة)/i.test(key)));

      rows.forEach((row) => {
        const findVal = (...keys: string[]) => {
          for (const key of Object.keys(row)) {
            const lowerKey = key.toLowerCase().trim();
            if (keys.some(k => lowerKey.includes(k.toLowerCase()))) {
              return extractNum(row[key]);
            }
          }
          return 0;
        };
        const findText = (...keys: string[]) => {
          const field = Object.keys(row).find((key) => keys.some((item) => key.toLowerCase().trim().includes(item.toLowerCase())));
          return field ? String(row[field] || '').trim() : '';
        };

        if (isDetailedOrdersExport) {
          const status = findText('status', 'حالة الطلب', 'الحالة').toLowerCase();
          const isCancelled = /cancel|ملغي|مرتجع|رفض|لا يرد|لايرد/.test(status);
          const isDelivered = /delivered|تم التسليم|تم التوصيل|مسلمات|مسلم/.test(status);
          const isConfirmed = !isCancelled && /confirm|تأكيد|تم الشحن|قيد الشحن|جاري التجهيز|قيد التوصيل|تم التسليم|تم التوصيل/.test(status);
          const revenue = findVal('order value', 'total', 'amount', 'revenue', 'sales', 'قيمة الطلب', 'إجمالي', 'المبيعات');
          rawLeads += 1;
          confirmed += isConfirmed ? 1 : 0;
          delivered += isDelivered ? 1 : 0;
          cancelled += isCancelled ? 1 : 0;
          detailedRevenue += revenue;
          if (!cogs) cogs = findVal('cogs', 'cost per order', 'تكلفة القطعة', 'سعر الجملة');

          const productName = findText('product name', 'product', 'item', 'sku', 'اسم المنتج', 'المنتج');
          if (productName) {
            const product = products.get(productName) || { confirmed_orders: 0, revenue: 0, delivered_orders: 0, cancelled_orders: 0 };
            product.confirmed_orders += isConfirmed ? 1 : 0;
            product.revenue += revenue;
            product.delivered_orders += isDelivered ? 1 : 0;
            product.cancelled_orders += isCancelled ? 1 : 0;
            products.set(productName, product);
          }
          const track = (map: Map<string, { orders: number; confirmed_orders: number; delivered_orders: number; cancelled_orders: number; revenue: number }>, name: string) => {
            if (!name) return;
            const item = map.get(name) || { orders: 0, confirmed_orders: 0, delivered_orders: 0, cancelled_orders: 0, revenue: 0 };
            item.orders += 1; item.confirmed_orders += isConfirmed ? 1 : 0; item.delivered_orders += isDelivered ? 1 : 0; item.cancelled_orders += isCancelled ? 1 : 0; item.revenue += revenue;
            map.set(name, item);
          };
          track(dimensions.sources, findText('source', 'المصدر'));
          track(dimensions.sales_reps, findText('sales rep', 'salesperson', 'اسم السيلز', 'السيلز'));
          track(dimensions.governorates, findText('governorate', 'province', 'المحافظة'));
          track(dimensions.couriers, findText('courier', 'مندوب', 'شركة الشحن'));
          return;
        }

        rawLeads += findVal('raw', 'total orders', 'leads', 'إجمالي الطلبات', 'الأوردرات');
        confirmed += findVal('confirm', 'مؤكد', 'التأكيدات', 'valid');
        cancelled += findVal('cancel', 'fake', 'ملغي', 'فيك', 'مرتجع');
        delivered += findVal('deliver', 'مسلم', 'تم التسليم', 'shipped');
        if (!cogs) cogs = findVal('cogs', 'cost per order', 'تكلفة القطعة', 'سعر الجملة');
        if (!aov) aov = findVal('aov', 'average order', 'سعر البيع', 'قيمة الأوردر');

        const productKey = Object.keys(row).find((key) => /product( name)?|item|sku|اسم المنتج|المنتج/i.test(key));
        const productName = productKey ? String(row[productKey] || '').trim() : '';
        if (productName) {
          const product = products.get(productName) || { confirmed_orders: 0, revenue: 0, delivered_orders: 0, cancelled_orders: 0 };
          product.confirmed_orders += findVal('confirm', 'مؤكد', 'التأكيدات', 'valid');
          product.revenue += findVal('revenue', 'sales', 'إيراد', 'مبيعات', 'قيمة الطلب');
          product.delivered_orders += findVal('deliver', 'مسلم', 'تم التسليم', 'shipped');
          product.cancelled_orders += findVal('cancel', 'fake', 'ملغي', 'فيك', 'مرتجع');
          products.set(productName, product);
        }
      });

      if (isDetailedOrdersExport && detailedRevenue > 0) aov = detailedRevenue / Math.max(1, rawLeads);

      const updatedBackendSheet: BackendSheetData = {
        raw_orders: rawLeads,
        confirmed_orders: confirmed,
        cancelled_fake_orders: cancelled,
        delivered_orders: delivered,
        cogs_per_order: cogs,
        average_order_value: aov,
        shipping_cost_per_order: 80,
        cod_fee_per_order: 25,
        confirmation_fee_per_order: 15,
        product_performance: Array.from(products.entries()).map(([product_name, stats]) => ({ product_name, ...stats })),
        operations: {
          detailed_orders_count: isDetailedOrdersExport ? rawLeads : 0,
          sources: Array.from(dimensions.sources.entries()).map(([name, stats]) => ({ name, ...stats })),
          sales_reps: Array.from(dimensions.sales_reps.entries()).map(([name, stats]) => ({ name, ...stats })),
          governorates: Array.from(dimensions.governorates.entries()).map(([name, stats]) => ({ name, ...stats })),
          couriers: Array.from(dimensions.couriers.entries()).map(([name, stats]) => ({ name, ...stats }))
        }
      };

      setStagedPayload(prev => ({
        ...prev,
        backend_sheet: updatedBackendSheet
      }));
      const hasBackendMetrics = rawLeads > 0 && confirmed > 0 && cogs > 0 && aov > 0;
      setUploadedSources(prev => ({ ...prev, backend: hasBackendMetrics }));

      setFileStatus({
        type: hasBackendMetrics ? 'success' : 'error',
        message: hasBackendMetrics
          ? `تم تحليل ${isDetailedOrdersExport ? 'Export أوردرات تفصيلي' : 'شيت الكول سنتر والطلبات'} بنجاح! الطلبات: ${rawLeads} | المؤكدة: ${confirmed} | المسلمة: ${delivered} | المصادر: ${dimensions.sources.size}`
          : 'شيت الـCRM يحتاج: إجمالي الطلبات، المؤكد، تكلفة المنتج (COGS)، ومتوسط قيمة الطلب (AOV). لم يتم استبدالها بأرقام افتراضية.'
      });
    }
  };

  // Parse Direct Text Input (extract metrics, numbers, and signals from plain text)
  const handleParseDirectText = () => {
    if (!directTextInput.trim()) {
      setFileStatus({ type: 'error', message: 'يرجى كتابة أو لصق النص أولاً ليتم تحليله.' });
      return;
    }

    try {
      // 1. Try checking if it's pure JSON
      if (directTextInput.trim().startsWith('{') && directTextInput.trim().endsWith('}')) {
        const parsedJson = JSON.parse(directTextInput.trim());
        if (parsedJson.ad_platforms && parsedJson.backend_sheet) {
          setStagedPayload(parsedJson);
          setUploadedSources({ adPlatform: true, backend: true });
          setFileStatus({ type: 'success', message: 'تم استخراج بيانات الـ JSON النصية بنجاح وتحديث كافة المؤشرات!' });
          return;
        }
      }

      // 2. Extract numeric values using flexible regex patterns
      const text = directTextInput;

      const extractRegex = (regexList: RegExp[]): number | null => {
        for (const re of regexList) {
          const match = text.match(re);
          if (match && match[1]) {
            const val = extractNum(match[1]);
            if (val > 0) return val;
          }
        }
        return null;
      };

      const spend = extractRegex([
        /(?:صرف|إنفاق|ميزانية|spend|budget)[^\d]*([\d,.]+)/i,
        /([\d,.]+)\s*(?:ج\.م|جنيه|EGP|LE)\s*(?:صرف|إنفاق|spend)/i
      ]);

      const impressions = extractRegex([
        /(?:ظهور|مرات الظهور|impressions)[^\d]*([\d,.]+)/i
      ]);

      const clicks = extractRegex([
        /(?:كليكات|نقرات|clicks|clicks count)[^\d]*([\d,.]+)/i
      ]);

      const threeSec = extractRegex([
        /(?:3sec|3 ثوان|hook|ثواني)[^\d]*([\d,.]+)/i
      ]);

      const seventyFivePct = extractRegex([
        /(?:75%|retention|احتفاظ)[^\d]*([\d,.]+)/i
      ]);

      const reportedOrders = extractRegex([
        /(?:reported orders|طلبات ميتا|أوردرات ميتا|purchase meta)[^\d]*([\d,.]+)/i
      ]);

      const rawOrders = extractRegex([
        /(?:raw|إجمالي الطلبات|الطلبات الأولية|leads|أوردرات الشيت)[^\d]*([\d,.]+)/i
      ]);

      const confirmedOrders = extractRegex([
        /(?:confirmed|المؤكدة|تأكيدات|طلبات مؤكدة|valid)[^\d]*([\d,.]+)/i
      ]);

      const cancelledOrders = extractRegex([
        /(?:cancelled|ملغي|مرتجع|فيك|fake)[^\d]*([\d,.]+)/i
      ]);

      const deliveredOrders = extractRegex([
        /(?:delivered|مسلمة|تم التسليم|shipped)[^\d]*([\d,.]+)/i
      ]);

      const cogs = extractRegex([
        /(?:cogs|تكلفة القطعة|سعر الجملة|تكلفة المنتج)[^\d]*([\d,.]+)/i
      ]);

      const aov = extractRegex([
        /(?:aov|سعر البيع|متوسط سعر البيع|قيمة الأوردر)[^\d]*([\d,.]+)/i
      ]);

      // Update Staged Payload with parsed metrics or keep safe defaults
      setStagedPayload(prev => {
        const prevPlatform = prev.ad_platforms[0] || {
          platform: 'Meta Ads',
          campaign_name: 'Custom Text Campaign',
          impressions: 450000,
          spend: 48500,
          clicks: 9500,
          three_second_video_views: 125000,
          seventy_five_percent_video_views: 22000,
          reported_orders: 145,
          reported_revenue: 172500
        };

        const updatedAdPlatform: AdPlatformData = {
          ...prevPlatform,
          spend: spend || prevPlatform.spend,
          impressions: impressions || prevPlatform.impressions,
          clicks: clicks || prevPlatform.clicks,
          three_second_video_views: threeSec || prevPlatform.three_second_video_views,
          seventy_five_percent_video_views: seventyFivePct || prevPlatform.seventy_five_percent_video_views,
          reported_orders: reportedOrders || prevPlatform.reported_orders,
          reported_revenue: (reportedOrders || prevPlatform.reported_orders) * (aov || prev.backend_sheet.average_order_value)
        };

        const updatedBackendSheet: BackendSheetData = {
          ...prev.backend_sheet,
          raw_orders: rawOrders || prev.backend_sheet.raw_orders,
          confirmed_orders: confirmedOrders || prev.backend_sheet.confirmed_orders,
          cancelled_fake_orders: cancelledOrders || prev.backend_sheet.cancelled_fake_orders,
          delivered_orders: deliveredOrders || prev.backend_sheet.delivered_orders,
          cogs_per_order: cogs || prev.backend_sheet.cogs_per_order,
          average_order_value: aov || prev.backend_sheet.average_order_value
        };

        return {
          ...prev,
          ad_platforms: [updatedAdPlatform],
          backend_sheet: updatedBackendSheet
        };
      });

      setUploadedSources({
        adPlatform: Boolean(spend && impressions && clicks),
        backend: Boolean(rawOrders && confirmedOrders && cogs && aov)
      });

      setFileStatus({
        type: 'success',
        message: `تم تحليل النص واستخراج البيانات بنجاح! الصرف: ${spend ? spend.toLocaleString() + ' ج.م' : 'تم الاحتفاظ بالقيمة الحالية'} | الطلبات المؤكدة: ${confirmedOrders || 'محدثة'} | جاهز لتنفيذ التشخيص!`
      });

    } catch (err: any) {
      setFileStatus({
        type: 'error',
        message: `تعذر استخراج بعض البيانات من النص: ${err?.message || 'تأكد من صياغة الأرقام بوضوح'}`
      });
    }
  };

  // Trigger Audit with current staged payload
  const missingRequirements = [
    !uploadedSources.adPlatform && 'تقرير الإعلانات: الصرف والظهور والكليكات',
    !uploadedSources.backend && 'شيت الـCRM: الطلبات والمؤكد وCOGS وAOV',
    !periodStart && 'تاريخ بداية الفترة',
    !periodEnd && 'تاريخ نهاية الفترة',
    periodStart && periodEnd && periodStart > periodEnd && 'ترتيب تاريخ الفترة'
  ].filter(Boolean) as string[];
  const canRunAudit = missingRequirements.length === 0;

  const handleExecuteAudit = () => {
    if (!canRunAudit) {
      setFileStatus({ type: 'error', message: `لا يمكن تشغيل التشخيص قبل استكمال: ${missingRequirements.join('، ')}` });
      return;
    }
    const result = run5LayerAudit(stagedPayload);
    onAuditExecute(stagedPayload, result);
    setAuditCompleted(true);
  };

  // Download Sample Templates
  const handleDownloadSample = (type: 'csv_meta' | 'csv_sheet' | 'json_audit') => {
    let content = '';
    let mimeType = 'text/csv;charset=utf-8;';
    let filename = '';

    if (type === 'csv_meta') {
      content = `Platform,Campaign Name,Impressions,Spend,Clicks,3Sec Views,75Pct Views,Reported Orders,Reported Revenue\nMeta Ads,Summer Sale CBO,450000,48500,9500,125000,22000,145,172500`;
      filename = 'prepilot_ad_platforms_sample.csv';
    } else if (type === 'csv_sheet') {
      content = `Order ID,Date,Source,Campaign,Creative,Offer Code,Product Name,Order Value,Status,Sales Rep,Governorate,Courier,Delivery Type,Created At,First Contact At,Confirmed At,Shipped At,Delivered At,Follow-up Count,Final Rejection Reason,Return/Cancel Reason,COGS Per Order\nHG-1001,2026-08-22,WhatsApp Sara,Summer CBO,UGC Doctor 01,BUNDLE20,باكدج العناية الكاملة,1200,تم التسليم,سارة المهدي,القاهرة,Bosta,External,2026-08-22 10:00,2026-08-22 10:04,2026-08-22 10:15,2026-08-22 14:00,2026-08-23 12:30,2,,,350`;
      filename = 'prepilot_backend_sheet_sample.csv';
    } else {
      content = JSON.stringify(currentPayload, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      filename = 'prepilot_full_audit_payload.json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Tab Top Title Card */}
      <div className="mp-panel rounded-[1.5rem] p-6 md:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 font-headline">
              <UploadCloud className="w-5 h-5 text-[#6d45ff]" />
              <span className="mp-page-title">مركز البيانات والتشخيص</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 font-sans">
              بيانات موحّدة، مراجعة دقيقة، ثم قرار تنفيذي واحد واضح.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadSample('csv_meta')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>نموذج إعلانات (CSV)</span>
            </button>
            <button
              onClick={() => handleDownloadSample('csv_sheet')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>نموذج شيت (CSV)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" aria-label="خطوات رفع البيانات">
          <div className={`rounded-xl border p-3 ${uploadedSources.adPlatform ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <span className="text-[10px] font-mono font-bold text-slate-500">01 — مطلوب</span>
            <p className="text-xs font-bold text-slate-900 mt-1">تقرير الإعلانات</p>
            <p className="text-[11px] text-slate-600 mt-0.5">الصرف، الظهور، الكليكات</p>
            <span className={`text-[10px] font-bold ${uploadedSources.adPlatform ? 'text-emerald-700' : 'text-amber-700'}`}>{uploadedSources.adPlatform ? '✓ جاهز' : 'بانتظار الرفع'}</span>
          </div>
          <div className={`rounded-xl border p-3 ${uploadedSources.backend ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
            <span className="text-[10px] font-mono font-bold text-slate-500">02 — مطلوب</span>
            <p className="text-xs font-bold text-slate-900 mt-1">شيت المبيعات / CRM</p>
            <p className="text-[11px] text-slate-600 mt-0.5">الطلبات، COGS، وقيمة الطلب</p>
            <span className={`text-[10px] font-bold ${uploadedSources.backend ? 'text-emerald-700' : 'text-amber-700'}`}>{uploadedSources.backend ? '✓ جاهز' : 'بانتظار الرفع'}</span>
          </div>
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3">
            <span className="text-[10px] font-mono font-bold text-indigo-600">03 — اختياري</span>
            <p className="text-xs font-bold text-slate-900 mt-1">صور الإعلان والشات</p>
            <p className="text-[11px] text-slate-600 mt-0.5">مرجع بصري للمراجعة اليدوية، لا يدخل الحسابات تلقائياً.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="md:w-1/3">
              <p className="text-xs font-bold text-slate-900">الفترة التي تغطيها الملفات</p>
              <p className="text-[11px] text-slate-600 mt-1">استخدم نفس الفترة في تقرير الإعلانات وشيت الـCRM.</p>
            </div>
            <label className="flex-1 text-[11px] font-bold text-slate-700">من
              <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs" />
            </label>
            <label className="flex-1 text-[11px] font-bold text-slate-700">إلى
              <input type="date" value={periodEnd} min={periodStart || undefined} onChange={(e) => setPeriodEnd(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs" />
            </label>
          </div>
        </div>

        {/* Notice for Ground Truth Sheet Sales vs Delayed Meta Purchase */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2 font-sans">
          <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950 font-headline">قاعدة اعتماد مصدر الحقيقة المباشر (Ground Truth Rule):</span>
            <span>تم استبعاد الاعتماد على Purchase بكسل ميتا كمقياس حقيقي للمبيعات لتأخره المعتاد في التحديث والتأخير. نعتمد حصرياً على إجمالي أوردرات المبيعات التأكيدية المسجلة بالشيت المباشر لحساب الربحية الصافية والـ True CPA بدقة.</span>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2">
          <button
            onClick={() => setActiveUploadType('ad_platform')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'ad_platform'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold">1. تقرير الإعلانات</span>
              <span className="text-[10px] text-slate-500 font-mono">Meta Ads CSV/XLSX</span>
            </div>
            <FileSpreadsheet className={`w-4 h-4 ${activeUploadType === 'ad_platform' ? 'text-emerald-600' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={() => setActiveUploadType('backend_sheet')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'backend_sheet'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold">2. شيت الكول سنتر</span>
              <span className="text-[10px] text-slate-500 font-mono">الطلبات، COGS، والمنتج</span>
            </div>
            <FileText className={`w-4 h-4 ${activeUploadType === 'backend_sheet' ? 'text-emerald-600' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={() => setActiveUploadType('image_creative')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'image_creative'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold">3. رفع صورة إعلان</span>
              <span className="text-[10px] text-slate-500 font-mono">PNG, JPG, WEBP</span>
            </div>
            <ImageIcon className={`w-4 h-4 ${activeUploadType === 'image_creative' ? 'text-emerald-600' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={() => setActiveUploadType('chat_screenshots')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'chat_screenshots'
                ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold">4. نماذج الشات</span>
              <span className="text-[10px] text-purple-700 font-mono font-bold">صور محادثات CRM</span>
            </div>
            <MessageSquare className={`w-4 h-4 ${activeUploadType === 'chat_screenshots' ? 'text-purple-600' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={() => setActiveUploadType('full_json')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'full_json'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold">5. ملف JSON</span>
              <span className="text-[10px] text-slate-500 font-mono">AuditPayload JSON</span>
            </div>
            <FileCode className={`w-4 h-4 ${activeUploadType === 'full_json' ? 'text-emerald-600' : 'text-slate-400'}`} />
          </button>

          <button
            onClick={() => setActiveUploadType('direct_text')}
            className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer flex items-center justify-between ${
              activeUploadType === 'direct_text'
                ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-sm ring-1 ring-blue-400'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div>
              <span className="text-xs font-headline block font-bold text-blue-950">6. كتابة نص مباشر</span>
              <span className="text-[10px] text-blue-700 font-mono font-bold">تقرير / أرقام / شات</span>
            </div>
            <Type className={`w-4 h-4 ${activeUploadType === 'direct_text' ? 'text-blue-600' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Conditional Upload Zone: File Dropzone OR Direct Text Area */}
        {activeUploadType === 'direct_text' ? (
          <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                  <Type className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-950 font-headline">
                    محرر الإدخال النصي المباشر (Direct Text Input & NLP Parser)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    اكتب أو الصق تقريرك النصي، أرقام الإعلان، بيانات الشيت، أو سكريبت المحادثة وسيقوم النظام باستخراج الأرقام فوراً.
                  </p>
                </div>
              </div>

              {/* Quick Template Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500">قوالب جاهزة:</span>
                <button
                  type="button"
                  onClick={() => setDirectTextInput(
`تاريخ اليوم: 19
مؤشرات الإعلان:
- الصرف: 48,500 ج.م
- الظهور: 450,000
- الكليكات: 9,500 (CTR: 2.4%)
- تكلفة الكليك CPC: 1.80 ج.م
- CPA السابق: 88 ج.م
- CPA الحالي: 155 ج.م

شيت الكول سنتر:
- إجمالي الطلبات (Raw): 233
- الطلبات المؤكدة: 121
- المرتجعات والملغية: 58
- المسلمة: 98
- تكلفة القطعة COGS: 350 ج.م
- سعر البيع AOV: 1,200 ج.م

حالة العوامل الخارجية:
- المنافسين: مستقر في Meta Ad Library
- سرعة رد السيلز FRT: 3 دقائق
- حالة المخزون: الروتين مكتمل`
                  )}
                  className="px-2 py-1 rounded bg-white hover:bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-bold transition cursor-pointer"
                >
                  📋 تقرير Layer 3
                </button>
                <button
                  type="button"
                  onClick={() => setDirectTextInput(
`تقرير حملة ميتا (Meta Ads):
- Spend: 35,000 EGP
- Impressions: 320,000
- Clicks: 7,200
- 3Sec Hook Views: 85,000
- 75% Retention: 16,500
- Reported Orders: 110`
                  )}
                  className="px-2 py-1 rounded bg-white hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold transition cursor-pointer"
                >
                  📊 أرقام ميتا فقط
                </button>
                <button
                  type="button"
                  onClick={() => setDirectTextInput(
`شيت الكول سنتر والشحن:
- Raw Leads: 190
- Confirmed Orders: 105
- Cancelled Fake: 35
- Delivered: 85
- COGS: 320
- AOV: 1150`
                  )}
                  className="px-2 py-1 rounded bg-white hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-bold transition cursor-pointer"
                >
                  📑 شيت كول سنتر
                </button>
                <button
                  type="button"
                  onClick={() => setDirectTextInput(
`نموذج شات مع العميل (WhatsApp Chat):
العميل: السلام عليكم، بكام مجموعة النضارة؟
السيلز: وعليكم السلام، المجموعة بـ 750 جنيه شامل الشحن وفيديو استخدام هدية.
العميل: بس السعر غالي شوية، في منتج تاني بـ 500 جنيه.
السيلز: منتجنا معاه ضمان نضارة 14 يوم ومكوناته طبيعية 100% بدون أي مواد كيميائية.
العميل: تمام ابعتلي اللينك اطلب.`
                  )}
                  className="px-2 py-1 rounded bg-white hover:bg-purple-100 border border-purple-200 text-purple-800 text-[10px] font-bold transition cursor-pointer"
                >
                  💬 محادثة شات
                </button>
                <button
                  type="button"
                  onClick={() => setDirectTextInput('')}
                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition cursor-pointer"
                  title="تفريغ النص"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Textarea Box */}
            <div className="space-y-2">
              <textarea
                value={directTextInput}
                onChange={(e) => setDirectTextInput(e.target.value)}
                placeholder="اكتب هنا أي نص، أرقام إعلانية، شيت كول سنتر، أو محادثات واتساب..."
                rows={9}
                className="w-full bg-white border border-blue-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-inner leading-relaxed"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 text-[11px] text-slate-600 font-sans">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>يدعم الاستخراج الذكي للأرقام (Spend, Orders, Clicks, COGS, AOV) وصيغ JSON والنصوص الحرة.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleParseDirectText}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-headline font-bold text-xs transition shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>تحليل وتطبيق النص على البيانات (Parse & Apply)</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Drag and Drop Zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileProcess(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-300 bg-slate-50/70 hover:border-emerald-500 hover:bg-emerald-50/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              accept=".csv, .xlsx, .xls, .json, .png, .jpg, .jpeg, .webp, .gif"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
              <UploadCloud className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <span className="text-sm font-bold text-slate-900 font-headline block">
                اسحب واسقط الملف أو صورة الإعلان هنا، أو اضغط للتصفح
              </span>
              <span className="text-xs text-slate-600 font-mono mt-1 block">
                يدعم رفع ملفات Excel (.xlsx, .xls), CSV (.csv), JSON (.json), والصور (.png, .jpg, .webp)
              </span>
            </div>

            {fileName && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-100 border border-emerald-300 text-xs font-mono text-emerald-900 font-bold">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>تم اختيار الملف: {fileName}</span>
              </div>
            )}
          </div>
        )}

        {/* Uploaded Image Preview Box */}
        {imagePreview && (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Creative Preview"
                className="w-16 h-16 object-cover rounded-lg border border-emerald-300 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-900 font-headline">صورة الإعلان المرفوعة:</span>
                  <span className="text-xs font-mono text-emerald-800">{imageInfo?.name}</span>
                </div>
                <span className="text-[11px] text-emerald-700 block mt-0.5">
                  حجم الصورة: {imageInfo?.size} — محفوظة كمرجع بصري؛ لا تدخل في الحسابات تلقائياً.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setImagePreview(null);
                setImageInfo(null);
              }}
              className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
              title="حذف الصورة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Chat Evaluation Screenshots Box */}
        {chatScreenshots.length > 0 && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-700" />
                <h4 className="text-xs font-bold text-purple-950 font-headline">
                  نماذج صور الشات الجاهزة للتقييم ({chatScreenshots.length} صور)
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">
                WhatsApp Chat Evaluation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {chatScreenshots.map((item) => (
                <div key={item.id} className="relative group bg-white p-2 rounded-lg border border-purple-200 space-y-1 shadow-2xs">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-24 object-cover rounded border border-purple-100"
                  />
                  <p className="text-[10px] font-bold text-slate-900 truncate font-headline" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[9px] text-slate-500 line-clamp-2">
                    {item.note}
                  </p>
                  <button
                    onClick={() => setChatScreenshots(prev => prev.filter(x => x.id !== item.id))}
                    className="absolute top-1 left-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {fileStatus && (
          <div className={`p-3.5 rounded-lg border text-xs font-bold flex items-center gap-2.5 ${
            fileStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : fileStatus.type === 'error'
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-blue-50 border-blue-300 text-blue-900'
          }`}>
            {fileStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
            <span>{fileStatus.message}</span>
          </div>
        )}
      </div>

      {/* Staged Data Preview & Verification Form */}
      <div className="mp-panel rounded-[1.5rem] p-6 md:p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-headline flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#6d45ff]" />
              <span>مراجعة وتأكيد البيانات (Data Verification)</span>
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              راجع الأرقام المستخرجة أو عدلها يدوياً قبل حساب التشخيص التلقائي.
            </p>
          </div>

          <button
            onClick={handleExecuteAudit}
            disabled={!canRunAudit}
            title={!canRunAudit ? `استكمل: ${missingRequirements.join('، ')}` : undefined}
            className="mp-primary flex items-center gap-2 px-6 py-3 rounded-xl font-headline font-bold text-xs transition-all cursor-pointer active:scale-95 uppercase disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none"
          >
            <Zap className="w-4 h-4 fill-current text-white" />
            <span>تنفيذ التشخيص الآن (Run Audit)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!canRunAudit && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <strong>قبل تشغيل التشخيص:</strong> {missingRequirements.join('، ')}.
          </div>
        )}

        {auditCompleted && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-950">تم التشخيص باستخدام بياناتك للفترة {periodStart} إلى {periodEnd}.</p>
              <p className="text-[11px] text-emerald-800 mt-1">راجع النتيجة الآن أو عدّل البيانات وأعد التشغيل.</p>
            </div>
            <button onClick={onNavigateToOverview} className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white transition-colors">عرض النتيجة ←</button>
          </div>
        )}

        {/* Data Cards Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ad Platforms Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-headline uppercase flex items-center justify-between border-b border-slate-200 pb-2">
              <span>بيانات المنصة الإعلانية (Meta Ads)</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">نشط Active</span>
            </h4>

            <div className="space-y-2 text-xs font-sans">
              {stagedPayload.ad_platforms.map((p, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2 shadow-2xs">
                  <div className="flex justify-between text-slate-900 font-bold font-headline">
                    <span>منصة {p.platform}</span>
                    <span className="text-emerald-700 font-mono font-bold">{p.spend.toLocaleString()} ج.م مصروفات</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-mono">
                    <div>إجمالي الصرف: <strong className="text-slate-900">{p.spend.toLocaleString()}</strong></div>
                    <div>عدد Outbound Clicks: <strong className="text-slate-900">{(p.outbound_clicks || Math.round((p.clicks || 0) * 0.75)).toLocaleString()}</strong></div>
                    <div>عدد النقرات العادية: <strong className="text-slate-900">{p.clicks.toLocaleString()}</strong></div>
                    <div>عدد الظهور: <strong className="text-slate-900">{p.impressions.toLocaleString()}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CRM & Chat Data Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-headline uppercase flex items-center justify-between border-b border-slate-200 pb-2">
              <span>مدخلات الشات والسيلز (CRM Data)</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Layer 2 Inputs</span>
            </h4>

            {/* Dynamic Live Calculated Core Numbers */}
            {(() => {
              const liveChats = stagedPayload.chat_data?.actual_received_chats ?? 1308;
              const liveQual = stagedPayload.chat_data?.qualified_leads_count ?? 860;
              const liveClosed = stagedPayload.chat_data?.closed_orders_count ?? 145;
              const livePriceReqs = stagedPayload.chat_data?.total_price_inquiries_count ?? 1010;
              const liveVbpPassed = stagedPayload.chat_data?.vbp_passed_chats_count ?? 424;
              const liveSingleNoUpsell = stagedPayload.chat_data?.single_product_orders_no_upsell ?? 48;
              
              const liveQualRate = ((liveQual / Math.max(1, liveChats)) * 100).toFixed(1);
              const liveChatCvr = ((liveClosed / Math.max(1, liveChats)) * 100).toFixed(1);
              const liveVbpScore = ((liveVbpPassed / Math.max(1, livePriceReqs)) * 100).toFixed(1);
              const liveAov = Math.round(((stagedPayload.backend_sheet?.average_order_value || 650) * liveClosed) / Math.max(1, liveClosed));

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-purple-900/10 p-2 rounded-lg border border-purple-200 text-xs">
                    <div className="p-1.5 bg-white rounded border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-900 font-bold block">الرقم 1: Qualified Rate</span>
                      <strong className="text-emerald-700 font-mono text-xs">{liveQualRate}%</strong>
                      <span className="text-[9px] text-slate-500 block">افرز Inbox بالـ Tags</span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-purple-200 text-center">
                      <span className="text-[10px] text-purple-900 font-bold block">الرقم 2: Chat CVR</span>
                      <strong className="text-amber-700 font-mono text-xs">{liveChatCvr}%</strong>
                      <span className="text-[9px] text-slate-500 block">من شيت المبيعات</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-indigo-900/10 p-2 rounded-lg border border-indigo-200 text-xs">
                    <div className="p-1.5 bg-white rounded border border-indigo-200 text-center">
                      <span className="text-[10px] text-indigo-900 font-bold block">VBP Score (القيمة أولاً)</span>
                      <strong className={`font-mono text-xs ${Number(liveVbpScore) >= 80 ? 'text-emerald-700' : 'text-rose-700'}`}>{liveVbpScore}%</strong>
                      <span className="text-[9px] text-slate-500 block">الهدف $\ge 80\%$</span>
                    </div>
                    <div className="p-1.5 bg-white rounded border border-indigo-200 text-center">
                      <span className="text-[10px] text-indigo-900 font-bold block">AOV &amp; Upsell Flag</span>
                      <strong className="text-purple-700 font-mono text-xs">{liveAov} ج.م</strong>
                      <span className="text-[9px] text-rose-600 block font-bold">{liveSingleNoUpsell} أوردر بلا ترقية ⚠️</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium text-[11px]">Actual Received Chats:</span>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.actual_received_chats ?? 1308}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: val,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-emerald-800 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium text-[11px]">Average FRT (دقائق):</span>
                <input
                  type="number"
                  step="0.5"
                  value={stagedPayload.chat_data?.average_frt_minutes ?? 18.5}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: val,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-rose-700 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <div>
                  <span className="font-medium text-[11px] block">Qualified Leads Count:</span>
                  <span className="text-[9px] text-slate-500">من الـ Inbox Tags (شاتات جادة)</span>
                </div>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.qualified_leads_count ?? 860}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: val,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-emerald-800 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <div>
                  <span className="font-medium text-[11px] block">Closed Orders Count:</span>
                  <span className="text-[9px] text-slate-500">من شيت المبيعات / المتجر</span>
                </div>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.closed_orders_count ?? 145}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: val,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-emerald-800 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <div>
                  <span className="font-medium text-[11px] block">VBP Passed Chats Count:</span>
                  <span className="text-[9px] text-slate-500">شاتات طرحت أسئلة وشرحت القيمة قبل السعر</span>
                </div>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.vbp_passed_chats_count ?? 424}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3,
                        vbp_passed_chats_count: val
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-indigo-800 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <div>
                  <span className="font-medium text-[11px] block">Single Item Closed (No Upsell):</span>
                  <span className="text-[9px] text-slate-500">أوردرات منتج فردي أغلقت بدون عرض باكدج</span>
                </div>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.single_product_orders_no_upsell ?? 48}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: prev.chat_data?.followup_closed_orders ?? 3,
                        single_product_orders_no_upsell: val
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-rose-700 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium text-[11px]">Follow-up Closed Orders:</span>
                <input
                  type="number"
                  value={stagedPayload.chat_data?.followup_closed_orders ?? 3}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      chat_data: {
                        ...prev.chat_data,
                        actual_received_chats: prev.chat_data?.actual_received_chats ?? 1308,
                        average_frt_minutes: prev.chat_data?.average_frt_minutes ?? 18.5,
                        qualified_leads_count: prev.chat_data?.qualified_leads_count ?? 860,
                        closed_orders_count: prev.chat_data?.closed_orders_count ?? 145,
                        followup_closed_orders: val
                      }
                    }));
                  }}
                  className="w-20 bg-slate-100 border border-slate-300 text-amber-700 font-bold px-2 py-1 rounded text-right font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Backend Sheet Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 font-headline uppercase flex items-center justify-between border-b border-slate-200 pb-2">
              <span>بيانات شيت الكول سنتر (Backend Sheet)</span>
              <span className="text-[10px] font-mono text-slate-600 font-bold">مصدر الحقيقة الأول</span>
            </h4>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium">إجمالي الطلبات الأولية (Raw Leads):</span>
                <input
                  type="number"
                  value={stagedPayload.backend_sheet.raw_orders}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      backend_sheet: { ...prev.backend_sheet, raw_orders: val }
                    }));
                  }}
                  className="w-24 bg-slate-100 border border-slate-300 text-emerald-800 font-bold px-2 py-1 rounded text-right font-mono"
                />
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium">الطلبات المؤكدة (Confirmed):</span>
                <input
                  type="number"
                  value={stagedPayload.backend_sheet.confirmed_orders}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      backend_sheet: { ...prev.backend_sheet, confirmed_orders: val }
                    }));
                  }}
                  className="w-24 bg-slate-100 border border-slate-300 text-emerald-800 font-bold px-2 py-1 rounded text-right font-mono"
                />
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium">الطلبات الملغية / الفيك (Cancelled):</span>
                <input
                  type="number"
                  value={stagedPayload.backend_sheet.cancelled_fake_orders}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setStagedPayload(prev => ({
                      ...prev,
                      backend_sheet: { ...prev.backend_sheet, cancelled_fake_orders: val }
                    }));
                  }}
                  className="w-24 bg-slate-100 border border-slate-300 text-rose-700 font-bold px-2 py-1 rounded text-right font-mono"
                />
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium">تكلفة البضاعة للقطعة (COGS):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={stagedPayload.backend_sheet.cogs_per_order}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStagedPayload(prev => ({
                        ...prev,
                        backend_sheet: { ...prev.backend_sheet, cogs_per_order: val }
                      }));
                    }}
                    className="w-24 bg-slate-100 border border-slate-300 text-slate-900 font-bold px-2 py-1 rounded text-right font-mono"
                  />
                  <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200 text-slate-800">
                <span className="font-medium">متوسط سعر البيع (AOV):</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={stagedPayload.backend_sheet.average_order_value}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setStagedPayload(prev => ({
                        ...prev,
                        backend_sheet: { ...prev.backend_sheet, average_order_value: val }
                      }));
                    }}
                    className="w-24 bg-slate-100 border border-slate-300 text-slate-900 font-bold px-2 py-1 rounded text-right font-mono"
                  />
                  <span className="text-[10px] text-slate-500 font-bold">ج.م</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rows Raw Sample Table */}
        {parsedRowsPreview && parsedRowsPreview.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 font-headline uppercase">
              معاينة الصفوف المستخرجة من الملف المرفوع:
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-right text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <tr>
                    {Object.keys(parsedRowsPreview[0]).map((key, i) => (
                      <th key={i} className="p-2.5 border-r border-slate-200 uppercase">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {parsedRowsPreview.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      {Object.values(row).map((val: any, i) => (
                        <td key={i} className="p-2.5 border-r border-slate-100 text-slate-800">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
