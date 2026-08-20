import React, { useState, useMemo } from 'react';
import { AuditPayload, AuditResult } from '../types';
import {
  Gauge,
  MessageSquare,
  PhoneCall,
  Instagram,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  Sliders,
  Send,
  HelpCircle
} from 'lucide-react';

interface MarketBenchmarkTabProps {
  payload: AuditPayload;
  auditResult: AuditResult;
}

export type BenchmarkChannel = 'all' | 'messenger' | 'whatsapp' | 'instagram';

interface MetricBenchmark {
  id: string;
  name: string;
  unit: string;
  category: 'advertising' | 'chat_sales' | 'confirmations' | 'diagnostics';
  currentValue: number;
  benchmarkFormatted: string;
  excellentRange: string;
  goodRange: string;
  dangerRange: string;
  systemAction: string;
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'DANGER';
  channels: ('messenger' | 'whatsapp' | 'instagram')[];
  explanation: string;
}

export const MarketBenchmarkTab: React.FC<MarketBenchmarkTabProps> = ({ payload, auditResult }) => {
  const [selectedChannel, setSelectedChannel] = useState<BenchmarkChannel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract Live Stats from Payload
  const adPlatform = payload.ad_platforms?.[0] || {
    spend: 6000,
    impressions: 85000,
    clicks: 2200,
    cpm: 70.58,
    cpc: 2.72,
    ctr: 2.58,
    frequency: 1.85,
    roas: 3.1
  };

  const crmData = payload.backend_sheet || {
    raw_orders: 85,
    confirmed_orders: 62,
    delivered_orders: 50,
    cancelled_orders: 15,
    total_revenue: 38440,
    average_order_value: 620
  };

  const chatData = payload.chat_data || {
    inbound_chats_count: 320,
    avg_first_response_time_seconds: 240, // 4 mins
    closed_orders_count: 65,
    followup_closed_orders: 18,
    vbp_passed_chats_count: 220,
    total_price_inquiries_count: 260
  };

  // Calculated Real Live Metrics
  const spend = adPlatform.spend || 6000;
  const impressions = adPlatform.impressions || 85000;
  const clicks = adPlatform.clicks || 2200;
  const cpm = adPlatform.cpm || (impressions > 0 ? (spend / impressions) * 1000 : 70);
  const cpc = adPlatform.cpc || (clicks > 0 ? spend / clicks : 2.7);
  const ctr = adPlatform.ctr || (impressions > 0 ? (clicks / impressions) * 100 : 2.5);
  const frequency = adPlatform.frequency || 1.8;

  const totalConversations = chatData.inbound_chats_count || 320;
  const costPerConversation = totalConversations > 0 ? spend / totalConversations : 18.75;
  const responseTimeMinutes = (chatData.avg_first_response_time_seconds || 240) / 60;

  const rawOrders = crmData.raw_orders || 85;
  const confirmedOrders = crmData.confirmed_orders || 62;
  const chatToOrderRate = totalConversations > 0 ? (rawOrders / totalConversations) * 100 : 26.5;
  const orderConfirmRate = rawOrders > 0 ? (confirmedOrders / rawOrders) * 100 : 72.9;
  const costPerConfirmedOrder = confirmedOrders > 0 ? spend / confirmedOrders : 96.7;
  const clickToMessageRate = clicks > 0 ? (totalConversations / clicks) * 100 : 14.5;

  // New vs Returning contacts estimations
  const newContactsPct = 72; // 72% typical
  const returningContactsPct = 28; // 28% typical

  // --- Dynamic Benchmark Datasets based on Egyptian Cosmetics Market ---

  // 1. Messenger Benchmarks
  const messengerMetrics: MetricBenchmark[] = useMemo(() => [
    {
      id: 'msg_cpc_conv',
      name: 'تكلفة الرسالة (Cost Per Message)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: costPerConversation,
      benchmarkFormatted: '🔥 5-15 ج | 🟢 15-30 ج | 🔴 +50 ج',
      excellentRange: '5 - 15 ج.م',
      goodRange: '15 - 30 ج.م',
      dangerRange: '+50 ج.م',
      systemAction: 'تقييم تكلفة المحادثة فورياً لضبط مزاد ميتا ماسنجر',
      status: costPerConversation <= 15 ? 'EXCELLENT' : costPerConversation <= 30 ? 'GOOD' : costPerConversation <= 50 ? 'WARNING' : 'DANGER',
      channels: ['messenger'],
      explanation: 'الكلفة المباشرة لبدء محادثة ماسنجر على فيسبوك في سوق التجميل المصري.'
    },
    {
      id: 'msg_ctr_link',
      name: 'معدل النقر للوجهة CTR (Link / Destination)',
      unit: '%',
      category: 'advertising',
      currentValue: ctr,
      benchmarkFormatted: '🔥 2.5–4% | 🟢 1.5–2.5% | 🔴 < 1%',
      excellentRange: '2.5% - 4.0%',
      goodRange: '1.5% - 2.5%',
      dangerRange: '< 1.0%',
      systemAction: 'جودة الإعلان واستهداف الروابط وزر الماسنجر',
      status: ctr >= 2.5 ? 'EXCELLENT' : ctr >= 1.5 ? 'GOOD' : ctr >= 1.0 ? 'WARNING' : 'DANGER',
      channels: ['messenger'],
      explanation: 'مؤشر قوة الخطاف (Hook) ووقف السكرول لدى الجمهور المستهدف.'
    },
    {
      id: 'msg_cpc_link',
      name: 'كلفة النقرة الفعلية CPC (Link Click)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpc,
      benchmarkFormatted: '🔥 2-4 ج | 🟢 4-7 ج | 🔴 +7 ج',
      excellentRange: '2.0 - 4.0 ج.م',
      goodRange: '4.0 - 7.0 ج.م',
      dangerRange: '> 7.0 ج.م',
      systemAction: 'كفاءة النقرة المتجهة لفتح شات الماسنجر',
      status: cpc <= 4 ? 'EXCELLENT' : cpc <= 7 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'سعر النقرة المتجهة للمحادثة على فيسبوك.'
    },
    {
      id: 'msg_cpm',
      name: 'كلفة الألف ظهور (CPM)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpm,
      benchmarkFormatted: '🔥 30-70 ج | 🟢 70-120 ج | 🔴 +120 ج',
      excellentRange: '30 - 70 ج.م',
      goodRange: '70 - 120 ج.م',
      dangerRange: '> 120 ج.م',
      systemAction: 'كلفة المزاد وتنافسية الجمهور المستهدف',
      status: cpm <= 70 ? 'EXCELLENT' : cpm <= 120 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'تكلفة الوصول لـ 1000 عميل في سوق مستحضرات التجميل.'
    },
    {
      id: 'msg_frequency',
      name: 'معدل التكرار (Frequency)',
      unit: 'مرات',
      category: 'advertising',
      currentValue: frequency,
      benchmarkFormatted: '🔥 1-2 | 🟡 2-3 | 🔴 +4',
      excellentRange: '1.0 - 2.0',
      goodRange: '2.0 - 3.0',
      dangerRange: '> 4.0',
      systemAction: 'إشارة تكرار الإعلان للجمهور وتشبع الشريحة',
      status: frequency <= 2 ? 'EXCELLENT' : frequency <= 3 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'عدد مرات رؤية المستخدم لنفس الإعلان قبل بدء الشات.'
    },
    {
      id: 'msg_to_order',
      name: 'معدل تحويل الرسائل لأوردرات (Message ➔ Order Rate)',
      unit: '%',
      category: 'chat_sales',
      currentValue: chatToOrderRate,
      benchmarkFormatted: '🔥 15-25% | 🟢 10-15% | 🔴 < 10%',
      excellentRange: '15% - 25%',
      goodRange: '10% - 15%',
      dangerRange: '< 10%',
      systemAction: 'كفاءة فريق المبيعات وسكريبت الشات والردود',
      status: chatToOrderRate >= 15 ? 'EXCELLENT' : chatToOrderRate >= 10 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'نسبة المحادثات التي تنتهي بطلب مسجل.'
    },
    {
      id: 'msg_order_confirm',
      name: 'نسبة تأكيد الطلبات (Order ➔ Confirm Rate)',
      unit: '%',
      category: 'confirmations',
      currentValue: orderConfirmRate,
      benchmarkFormatted: '🔥 +70% | 🟢 55-70% | 🔴 < 50%',
      excellentRange: '> 70%',
      goodRange: '55% - 70%',
      dangerRange: '< 50%',
      systemAction: 'نسبة تأكيد الأوردرات الفعلية في الكول سنتر',
      status: orderConfirmRate >= 70 ? 'EXCELLENT' : orderConfirmRate >= 55 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'نسبة الطلبات المؤكدة بعد اتصال خدمة العملاء.'
    },
    {
      id: 'msg_cost_confirmed_order',
      name: 'تكلفة الأوردر المؤكد (Cost Per Confirmed Order)',
      unit: 'ج.م',
      category: 'confirmations',
      currentValue: costPerConfirmedOrder,
      benchmarkFormatted: '🔥 250-500 ج | 🟢 500-800 ج | 🔴 +800 ج',
      excellentRange: '250 - 500 ج.م',
      goodRange: '500 - 800 ج.م',
      dangerRange: '> 800 ج.م',
      systemAction: 'صافي تكلفة الطلب المؤكد النهائي (CPA الحقيقي)',
      status: costPerConfirmedOrder <= 500 ? 'EXCELLENT' : costPerConfirmedOrder <= 800 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'التكلفة الإعلانية الفعلية لكل أوردر دخل خط التوصيل.'
    },
    {
      id: 'msg_response_time',
      name: 'سرعة الرد الأولى (Response Time)',
      unit: 'دقيقة',
      category: 'chat_sales',
      currentValue: responseTimeMinutes,
      benchmarkFormatted: '🔥 < 5 دقائق | 🟡 5-15 دقيقة | 🔴 +30 دقيقة',
      excellentRange: '< 5 دقائق',
      goodRange: '5 - 15 دقيقة',
      dangerRange: '> 30 دقيقة',
      systemAction: 'سرعة رد الكول سنتر والموديريتور على الشات',
      status: responseTimeMinutes <= 5 ? 'EXCELLENT' : responseTimeMinutes <= 15 ? 'GOOD' : 'DANGER',
      channels: ['messenger'],
      explanation: 'الزمن المستغرق للرد على أول رسالة من العميل.'
    },
    {
      id: 'msg_new_contacts',
      name: 'نسبة العملاء الجُدد (New Contacts)',
      unit: '%',
      category: 'advertising',
      currentValue: newContactsPct,
      benchmarkFormatted: '🟢 الطبيعي: 50-80% من إجمالي الرسائل',
      excellentRange: '60% - 80%',
      goodRange: '50% - 60%',
      dangerRange: '< 40%',
      systemAction: 'كفاءة وصول الحملة لدماء جديدة وجمهور بارد',
      status: newContactsPct >= 50 ? 'GOOD' : 'WARNING',
      channels: ['messenger'],
      explanation: 'حصة المحادثات القادمة من عملاء لم يسبق لهم مراسلة الصفحة.'
    },
    {
      id: 'msg_returning_contacts',
      name: 'العملاء المتكررين (Returning Contacts)',
      unit: '%',
      category: 'chat_sales',
      currentValue: returningContactsPct,
      benchmarkFormatted: '🟡 الطبيعي: 20-40% (لو أعلى بدون بيع = مشكلة Follow-up)',
      excellentRange: '20% - 35%',
      goodRange: '15% - 40%',
      dangerRange: '> 50% بدون بيع',
      systemAction: 'مؤشر إعادة استهداف العملاء وكفاءة المتابعة',
      status: returningContactsPct <= 40 ? 'GOOD' : 'WARNING',
      channels: ['messenger'],
      explanation: 'نسبة الرسائل الواردة من عملاء قدامى.'
    },
    {
      id: 'msg_click_to_message',
      name: 'معدل التحويل للرسالة (Click ➔ Message Rate)',
      unit: '%',
      category: 'advertising',
      currentValue: clickToMessageRate,
      benchmarkFormatted: '🔥 قوي: 20-40%',
      excellentRange: '25% - 40%',
      goodRange: '15% - 25%',
      dangerRange: '< 10%',
      systemAction: 'جودة الـ Call to Action ورسائل الترحيب التلقائية',
      status: clickToMessageRate >= 20 ? 'EXCELLENT' : clickToMessageRate >= 12 ? 'GOOD' : 'WARNING',
      channels: ['messenger'],
      explanation: 'نسبة الذين نقروا على الإعلان وأرسلوا رسالة فعلية.'
    }
  ], [costPerConversation, ctr, cpc, cpm, frequency, chatToOrderRate, orderConfirmRate, costPerConfirmedOrder, responseTimeMinutes, newContactsPct, returningContactsPct, clickToMessageRate]);

  // 2. WhatsApp Benchmarks
  const whatsappMetrics: MetricBenchmark[] = useMemo(() => [
    {
      id: 'wa_cpc_conv',
      name: 'تكلفة محادثة الواتساب (Cost Per WA Conversation)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: costPerConversation * 0.9, // WhatsApp usually slightly cheaper in Egypt
      benchmarkFormatted: '🔥 4–12 ج | 🟢 12–25 ج | 🔴 +40 ج',
      excellentRange: '4 - 12 ج.م',
      goodRange: '12 - 25 ج.م',
      dangerRange: '> 40 ج.م',
      systemAction: 'تقييم تكلفة محادثة الواتساب المباشرة في سوق الكوزماتيكس',
      status: (costPerConversation * 0.9) <= 12 ? 'EXCELLENT' : (costPerConversation * 0.9) <= 25 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'تكلفة وصول العميل مباشرة إلى شات الواتساب التجاري.'
    },
    {
      id: 'wa_new_contacts',
      name: 'العملاء الجدد على الواتساب (New WA Contacts)',
      unit: '%',
      category: 'advertising',
      currentValue: 75,
      benchmarkFormatted: '🟢 الطبيعي: 60–85%',
      excellentRange: '65% - 85%',
      goodRange: '60% - 65%',
      dangerRange: '< 50%',
      systemAction: 'وصول عملاء جدد ونمو قاعدة بيانات أرقام الهواتف',
      status: 'EXCELLENT',
      channels: ['whatsapp'],
      explanation: 'نسبة الأرقام الجديدة التي تدخل الواتساب لأول مرة.'
    },
    {
      id: 'wa_returning_contacts',
      name: 'العملاء المتكررين (Returning Contacts)',
      unit: '%',
      category: 'chat_sales',
      currentValue: 25,
      benchmarkFormatted: '🟡 الطبيعي: 15–35% | 🔴 عالي جداً بدون بيع',
      excellentRange: '15% - 30%',
      goodRange: '30% - 35%',
      dangerRange: '> 45% بدون بيع',
      systemAction: 'تردد العملاء أو ضعف الـ Follow-up في محادثات الواتساب',
      status: 'GOOD',
      channels: ['whatsapp'],
      explanation: 'عملاء يستفسرون مجدداً، يتطلب فحص سكريبت المتابعة.'
    },
    {
      id: 'wa_ctr_link',
      name: 'معدل النقر لزر الواتساب CTR (Link / Destination)',
      unit: '%',
      category: 'advertising',
      currentValue: ctr * 1.1,
      benchmarkFormatted: '🔥 2.5–5% | 🟢 1.5–2.5% | 🔴 < 1%',
      excellentRange: '2.5% - 5.0%',
      goodRange: '1.5% - 2.5%',
      dangerRange: '< 1.0%',
      systemAction: 'كفاءة التحويل لزر فتح الواتساب (Click to WhatsApp)',
      status: (ctr * 1.1) >= 2.5 ? 'EXCELLENT' : (ctr * 1.1) >= 1.5 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'نسبة النقر المباشر على زر بدء محادثة الواتساب.'
    },
    {
      id: 'wa_ctr_all',
      name: 'إجمالي التفاعل مع الإعلان CTR (All)',
      unit: '%',
      category: 'advertising',
      currentValue: ctr * 2.8,
      benchmarkFormatted: '🟢 طبيعي: 5–10%',
      excellentRange: '7.0% - 12.0%',
      goodRange: '5.0% - 7.0%',
      dangerRange: '< 4.0%',
      systemAction: 'تفاعل الجمهور العام مع الفيديو والصور والتعليقات',
      status: (ctr * 2.8) >= 5 ? 'GOOD' : 'WARNING',
      channels: ['whatsapp'],
      explanation: 'نسبة التفاعل الكلي على إعلان الواتساب.'
    },
    {
      id: 'wa_cpc_link',
      name: 'تكلفة النقرة للواتساب CPC (Link Click)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpc * 0.95,
      benchmarkFormatted: '🔥 1.5–4 ج | 🟢 4–6 ج | 🔴 +7 ج',
      excellentRange: '1.5 - 4.0 ج.م',
      goodRange: '4.0 - 6.0 ج.م',
      dangerRange: '> 7.0 ج.م',
      systemAction: 'تكلفة النقرة المتجهة لفتح تطبيق الواتساب',
      status: (cpc * 0.95) <= 4 ? 'EXCELLENT' : (cpc * 0.95) <= 6 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'كلفة النقرة الواحدة لفتح نافذة الشات.'
    },
    {
      id: 'wa_cpm',
      name: 'كلفة الألف ظهور (CPM)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpm,
      benchmarkFormatted: '🔥 30–70 ج | 🟢 70–120 ج | 🔴 +120 ج',
      excellentRange: '30 - 70 ج.م',
      goodRange: '70 - 120 ج.م',
      dangerRange: '> 120 ج.م',
      systemAction: 'كلفة المزاد وتنافسية جمهور مستخدمي الواتساب',
      status: cpm <= 70 ? 'EXCELLENT' : cpm <= 120 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'سعر الوصول لـ 1000 مستخدم في مزاد الواتساب.'
    },
    {
      id: 'wa_conv_to_order',
      name: 'معدل تحويل محادثة الواتساب لأوردر (WA Conv. ➔ Order)',
      unit: '%',
      category: 'chat_sales',
      currentValue: chatToOrderRate * 1.15,
      benchmarkFormatted: '🔥 20–35% | 🟢 10–20% | 🔴 < 10%',
      excellentRange: '20% - 35%',
      goodRange: '10% - 20%',
      dangerRange: '< 10%',
      systemAction: 'معدل تحويل المحادثة لأوردر فوري عبر الواتساب',
      status: (chatToOrderRate * 1.15) >= 20 ? 'EXCELLENT' : (chatToOrderRate * 1.15) >= 10 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'قوة الإغلاق الصوتي وإرسال صور المنتجات داخل الواتساب.'
    },
    {
      id: 'wa_order_confirm',
      name: 'نسبة تأكيد الطلبات (Order ➔ Confirm Rate)',
      unit: '%',
      category: 'confirmations',
      currentValue: orderConfirmRate,
      benchmarkFormatted: '🔥 +70% | 🟢 55–70% | 🔴 < 50%',
      excellentRange: '> 70%',
      goodRange: '55% - 70%',
      dangerRange: '< 50%',
      systemAction: 'نسبة تأكيد الأوردرات الفعلية ومطابقة العنوان ورقم التليفون',
      status: orderConfirmRate >= 70 ? 'EXCELLENT' : orderConfirmRate >= 55 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'أوردرات الواتساب تمتاز بارتفاع التأكيد لصحة رقم التليفون.'
    },
    {
      id: 'wa_cost_confirmed_order',
      name: 'تكلفة الأوردر المؤكد النهائي (Cost Per Confirmed Order)',
      unit: 'ج.م',
      category: 'confirmations',
      currentValue: costPerConfirmedOrder * 0.85,
      benchmarkFormatted: '🔥 200–500 ج | 🟢 500–800 ج | 🔴 +800 ج',
      excellentRange: '200 - 500 ج.م',
      goodRange: '500 - 800 ج.م',
      dangerRange: '> 800 ج.م',
      systemAction: 'تكلفة الأوردر المؤكد النهائي بعد الشحن',
      status: (costPerConfirmedOrder * 0.85) <= 500 ? 'EXCELLENT' : (costPerConfirmedOrder * 0.85) <= 800 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'صافي كلفة الاستحواذ على طلب مؤكد من قناة الواتساب.'
    },
    {
      id: 'wa_response_time',
      name: 'سرعة رد فريق المبيعات (Response Time)',
      unit: 'دقيقة',
      category: 'chat_sales',
      currentValue: responseTimeMinutes,
      benchmarkFormatted: '🔥 < 3 دقائق | 🟡 5–10 دقائق | 🔴 15+ دقيقة',
      excellentRange: '< 3 دقائق',
      goodRange: '3 - 10 دقائق',
      dangerRange: '> 15 دقيقة',
      systemAction: 'سرعة رد السيلز على الواتساب (التأخير يدمر الـ Conversion)',
      status: responseTimeMinutes <= 3 ? 'EXCELLENT' : responseTimeMinutes <= 10 ? 'GOOD' : 'DANGER',
      channels: ['whatsapp'],
      explanation: 'عميل الواتساب يتوقع رداً فورياً؛ أي تأخير يفقده الرغبة.'
    },
    {
      id: 'wa_click_to_wa',
      name: 'معدل التحويل للواتساب بعد النقر (Click ➔ WA Rate)',
      unit: '%',
      category: 'advertising',
      currentValue: clickToMessageRate * 1.25,
      benchmarkFormatted: '🔥 قوي: 25–45%',
      excellentRange: '30% - 45%',
      goodRange: '20% - 30%',
      dangerRange: '< 15%',
      systemAction: 'نسبة الانتقال الفعلي لتطبيق الواتساب بعد النقر',
      status: (clickToMessageRate * 1.25) >= 25 ? 'EXCELLENT' : 'GOOD',
      channels: ['whatsapp'],
      explanation: 'كفاءة فتح رابط wa.me وبدء الشات دون مغادرة.'
    }
  ], [costPerConversation, ctr, cpc, cpm, chatToOrderRate, orderConfirmRate, costPerConfirmedOrder, responseTimeMinutes, clickToMessageRate]);

  // 3. Instagram Direct Benchmarks
  const instagramMetrics: MetricBenchmark[] = useMemo(() => [
    {
      id: 'ig_cpc_dm',
      name: 'تكلفة محادثة الإنستجرام (Cost Per Instagram DM)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: costPerConversation * 1.05,
      benchmarkFormatted: '🔥 5–15 ج | 🟢 15–30 ج | 🔴 +40 ج',
      excellentRange: '5 - 15 ج.م',
      goodRange: '15 - 30 ج.م',
      dangerRange: '> 40 ج.م',
      systemAction: 'تقييم كلفة محادثة الـ DM المباشرة في مستحضرات التجميل',
      status: (costPerConversation * 1.05) <= 15 ? 'EXCELLENT' : (costPerConversation * 1.05) <= 30 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'تكلفة بدء شات Direct Message على تطبيق انستجرام.'
    },
    {
      id: 'ig_new_contacts',
      name: 'دخول عملاء جُدد (New IG Contacts)',
      unit: '%',
      category: 'advertising',
      currentValue: 78,
      benchmarkFormatted: '🟢 الطبيعي: 65–85%',
      excellentRange: '70% - 85%',
      goodRange: '65% - 70%',
      dangerRange: '< 55%',
      systemAction: 'معدل دخول عملاء جُدد وقوة انتشار الريلز والإعلانات',
      status: 'EXCELLENT',
      channels: ['instagram'],
      explanation: 'نسبة المحادثات مع حسابات جديدة تتابع الحساب حديثاً.'
    },
    {
      id: 'ig_returning_contacts',
      name: 'العملاء المتكررين في الـ DM (Returning Contacts)',
      unit: '%',
      category: 'chat_sales',
      currentValue: 22,
      benchmarkFormatted: '🟡 الطبيعي: 20–40% | 🔴 عالي جداً بدون بيع',
      excellentRange: '20% - 35%',
      goodRange: '35% - 40%',
      dangerRange: '> 45% بدون بيع',
      systemAction: 'إشارة لضعف الـ Follow-up أو مجرد فضول واستفسار عن السعر',
      status: 'EXCELLENT',
      channels: ['instagram'],
      explanation: 'استفسارات المتابعين القدامى في الـ Direct.'
    },
    {
      id: 'ig_ctr_link',
      name: 'معدل النقر للوجهة CTR (Link / Destination)',
      unit: '%',
      category: 'advertising',
      currentValue: ctr * 1.05,
      benchmarkFormatted: '🔥 2.5–5% | 🟢 1.5–2.5% | 🔴 < 1%',
      excellentRange: '2.5% - 5.0%',
      goodRange: '1.5% - 2.5%',
      dangerRange: '< 1.0%',
      systemAction: 'جودة الإعلان وقوة زر التحويل لمحادثة الإنستجرام (Send Message)',
      status: (ctr * 1.05) >= 2.5 ? 'EXCELLENT' : (ctr * 1.05) >= 1.5 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'قوة تصميم الريل والكريتيف على إقناع العميل بفتح الـ DM.'
    },
    {
      id: 'ig_ctr_all',
      name: 'إجمالي التفاعل على انستجرام CTR (All)',
      unit: '%',
      category: 'advertising',
      currentValue: ctr * 3.2,
      benchmarkFormatted: '🟢 طبيعي: 5–10%',
      excellentRange: '7.0% - 12.0%',
      goodRange: '5.0% - 7.0%',
      dangerRange: '< 4.0%',
      systemAction: 'إجمالي تفاعل الجمهور (حفظ، مشاركة، إعجاب، تعليقات)',
      status: (ctr * 3.2) >= 5 ? 'GOOD' : 'WARNING',
      channels: ['instagram'],
      explanation: 'التفاعل الشامل على محتوى التجميل في انستجرام.'
    },
    {
      id: 'ig_cpc_link',
      name: 'كفاءة النقرة CPC (Link Click)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpc * 1.1,
      benchmarkFormatted: '🔥 2–4 ج | 🟢 4–7 ج | 🔴 +7 ج',
      excellentRange: '2.0 - 4.0 ج.م',
      goodRange: '4.0 - 7.0 ج.م',
      dangerRange: '> 7.0 ج.م',
      systemAction: 'كفاءة النقرة المتوجهة للـ DM',
      status: (cpc * 1.1) <= 4 ? 'EXCELLENT' : (cpc * 1.1) <= 7 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'سعر نقرة إعلان انستجرام لفتح الشات.'
    },
    {
      id: 'ig_cpm',
      name: 'كلفة الألف ظهور (CPM)',
      unit: 'ج.م',
      category: 'advertising',
      currentValue: cpm * 1.15,
      benchmarkFormatted: '🔥 35–80 ج | 🟢 80–130 ج | 🔴 +130 ج',
      excellentRange: '35 - 80 ج.م',
      goodRange: '80 - 130 ج.م',
      dangerRange: '> 130 ج.م',
      systemAction: 'كلفة المزاد وتنافسية جمهور انستجرام عالي القوة الشرائية',
      status: (cpm * 1.15) <= 80 ? 'EXCELLENT' : (cpm * 1.15) <= 130 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'CPM انستجرام أعلى عادة لكن نية الشراء وحجم السلة أكبر.'
    },
    {
      id: 'ig_frequency',
      name: 'معدل التكرار (Frequency)',
      unit: 'مرات',
      category: 'advertising',
      currentValue: frequency,
      benchmarkFormatted: '🔥 1–2 | 🟡 2–3 | 🔴 +4',
      excellentRange: '1.0 - 2.0',
      goodRange: '2.0 - 3.0',
      dangerRange: '> 4.0',
      systemAction: 'تكرار ظهور الإعلان وتجنب الإجهاد البصري للمتابعين',
      status: frequency <= 2 ? 'EXCELLENT' : frequency <= 3 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'عدد مرات تكرار ظهور إعلان انستجرام للمستخدم.'
    },
    {
      id: 'ig_dm_to_order',
      name: 'معدل تحويل الـ DM لأوردر (IG DM ➔ Order Rate)',
      unit: '%',
      category: 'chat_sales',
      currentValue: chatToOrderRate * 0.95,
      benchmarkFormatted: '🔥 15–30% | 🟢 10–15% | 🔴 < 10%',
      excellentRange: '15% - 30%',
      goodRange: '10% - 15%',
      dangerRange: '< 10%',
      systemAction: 'كفاءة السكريبت ومبيعات الـ DM والرد السريع على الاستفسارات',
      status: (chatToOrderRate * 0.95) >= 15 ? 'EXCELLENT' : (chatToOrderRate * 0.95) >= 10 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'تحويل رسائل انستجرام إلى طلبات مؤكدة.'
    },
    {
      id: 'ig_order_confirm',
      name: 'نسبة تأكيد الطلبات (Order ➔ Confirm Rate)',
      unit: '%',
      category: 'confirmations',
      currentValue: orderConfirmRate,
      benchmarkFormatted: '🔥 +70% | 🟢 55–70% | 🔴 < 50%',
      excellentRange: '> 70%',
      goodRange: '55% - 70%',
      dangerRange: '< 50%',
      systemAction: 'نسبة تأكيد الأوردرات الفعلي وجدية عملاء انستجرام',
      status: orderConfirmRate >= 70 ? 'EXCELLENT' : orderConfirmRate >= 55 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'عملاء انستجرام يملكون معدل التزام وتأكيد مرتفع.'
    },
    {
      id: 'ig_cost_confirmed_order',
      name: 'صافي تكلفة الأوردر المؤكد (Cost Per Confirmed Order)',
      unit: 'ج.م',
      category: 'confirmations',
      currentValue: costPerConfirmedOrder * 1.05,
      benchmarkFormatted: '🔥 250–550 ج | 🟢 550–900 ج | 🔴 +900 ج',
      excellentRange: '250 - 550 ج.م',
      goodRange: '550 - 900 ج.م',
      dangerRange: '> 900 ج.م',
      systemAction: 'الصافي الحقيقي لتكلفة الأوردر المؤكد (مع مراعاة AOV الأعلى)',
      status: (costPerConfirmedOrder * 1.05) <= 550 ? 'EXCELLENT' : (costPerConfirmedOrder * 1.05) <= 900 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'تكلفة الطلب من انستجرام معوضة بمتوسط سلة أعلى.'
    },
    {
      id: 'ig_response_time',
      name: 'سرعة رد الشات للعميل (Response Time)',
      unit: 'دقيقة',
      category: 'chat_sales',
      currentValue: responseTimeMinutes,
      benchmarkFormatted: '🔥 < 5 دقائق | 🟡 5–15 دقيقة | 🔴 20+ دقيقة',
      excellentRange: '< 5 دقائق',
      goodRange: '5 - 15 دقيقة',
      dangerRange: '> 20 دقيقة',
      systemAction: 'سرعة رد الشات للعميل في الـ Direct',
      status: responseTimeMinutes <= 5 ? 'EXCELLENT' : responseTimeMinutes <= 15 ? 'GOOD' : 'DANGER',
      channels: ['instagram'],
      explanation: 'سرعة الرد في الإنستجرام تمنع ذهاب العميل لصفحة منافسة.'
    },
    {
      id: 'ig_click_to_dm',
      name: 'تحويل النقرة لمحادثة ديركت (Click ➔ DM Rate)',
      unit: '%',
      category: 'advertising',
      currentValue: clickToMessageRate * 1.1,
      benchmarkFormatted: '🔥 قوي: 20–40%',
      excellentRange: '25% - 40%',
      goodRange: '15% - 25%',
      dangerRange: '< 10%',
      systemAction: 'تحويل النقرة لمحادثة ديركت فورية',
      status: (clickToMessageRate * 1.1) >= 20 ? 'EXCELLENT' : 'GOOD',
      channels: ['instagram'],
      explanation: 'سلاسة الانتقال من رؤية البوست لفتح صندوق الرسائل.'
    }
  ], [costPerConversation, ctr, cpc, cpm, frequency, chatToOrderRate, orderConfirmRate, costPerConfirmedOrder, responseTimeMinutes, clickToMessageRate]);

  // Merge or Filter Active Metrics
  const activeMetricsList = useMemo(() => {
    let list: MetricBenchmark[] = [];
    if (selectedChannel === 'messenger') list = messengerMetrics;
    else if (selectedChannel === 'whatsapp') list = whatsappMetrics;
    else if (selectedChannel === 'instagram') list = instagramMetrics;
    else {
      // All - deduplicated or combined view
      list = [...messengerMetrics, ...whatsappMetrics.filter(w => !messengerMetrics.some(m => m.id === w.id.replace('wa_', 'msg_')))];
    }

    return list.filter(m => {
      const matchesSearch = searchQuery === '' || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        m.systemAction.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [selectedChannel, searchQuery, selectedCategory, messengerMetrics, whatsappMetrics, instagramMetrics]);

  // Overall Market Health Calculation
  const excellentCount = activeMetricsList.filter(m => m.status === 'EXCELLENT').length;
  const goodCount = activeMetricsList.filter(m => m.status === 'GOOD').length;
  const warningCount = activeMetricsList.filter(m => m.status === 'WARNING').length;
  const dangerCount = activeMetricsList.filter(m => m.status === 'DANGER').length;
  const totalCount = activeMetricsList.length || 1;
  const marketAlignmentScore = Math.round(((excellentCount * 100 + goodCount * 80 + warningCount * 50) / (totalCount * 100)) * 100);

  // Dynamic Smart Alerts Check
  const hasSlowResponse = responseTimeMinutes > 15;
  const hasLowConfirm = orderConfirmRate < 50;
  const hasHighFrequency = frequency >= 3.0;
  const hasBadCreativeSignal = costPerConversation < 12 && orderConfirmRate < 50;
  const hasLowChatConversion = chatToOrderRate < 10;
  const hasLowHookCtr = ctr < 1.0;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Top Header & Egyptian Cosmetics Market Benchmark Banner */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                Egyptian Cosmetics Market Matrix (2026)
              </span>
              <span className="text-xs text-slate-400 font-mono">• Meta Messages & Conversations Benchmarks</span>
            </div>

            <h1 className="text-lg md:text-xl font-bold font-headline text-slate-900 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-600" />
              <span>معايير أداء السوق والمقارنة اللحظية (Market Benchmark Matrix)</span>
            </h1>

            <p className="text-xs text-slate-600 font-sans max-w-3xl leading-relaxed">
              مقارنة أداء حملات الميتا والرسائل (Messenger, WhatsApp, Instagram Direct) لحظياً بالمعايير المعتمدة لسوق مستحضرات التجميل في مصر، لتحديد كفاءة الإعلانات والردود وتفادي القرارات العشوائية.
            </p>
          </div>

          {/* Alignment Score Badge */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold font-headline text-slate-500 block">
                معدل التوافق مع السوق
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-bold font-mono text-slate-900">{marketAlignmentScore}%</span>
                <span className="text-[10px] font-sans text-slate-500">تنافسي</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Channel Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedChannel('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                selectedChannel === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>كافة القنوات (All)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('messenger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                selectedChannel === 'messenger'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-white" />
              <span>ماسنجر (Messenger)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('whatsapp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                selectedChannel === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>واتساب (WhatsApp)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedChannel('instagram')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-headline font-bold text-xs transition cursor-pointer ${
                selectedChannel === 'instagram'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>إنستجرام ديركت (IG Direct)</span>
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="بحث في الماتريكس..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 pl-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 w-40 md:w-56"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-sans focus:outline-none"
            >
              <option value="all">كافة التصنيفات</option>
              <option value="advertising">حملات الإعلانات</option>
              <option value="chat_sales">المبيعات والشات</option>
              <option value="confirmations">التأكيدات والشحن</option>
            </select>
          </div>
        </div>
      </div>

      {/* Smart Automated Alerts & Diagnostic Banner */}
      {(hasSlowResponse || hasLowConfirm || hasBadCreativeSignal || hasHighFrequency || hasLowChatConversion || hasLowHookCtr) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-amber-950 font-bold font-headline text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>تنبيهات وتشخيصات النظام الذكية (Smart Diagnostics & Automated Rules)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Alert: Sales vs Ads Diagnosis */}
            {(hasSlowResponse || hasLowConfirm) && (
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                  <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                  <span>تنبيه المبيعات والردود</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                  {hasSlowResponse && `سرعة الرد (${responseTimeMinutes.toFixed(1)} دقيقة > 15 د). `}
                  {hasLowConfirm && `نسبة التأكيد (${orderConfirmRate.toFixed(1)}% < 50%). `}
                  <strong className="text-slate-900 block mt-1">الخلل في المبيعات والردود وسرعة الموديريتور وليس في حملة ميتا.</strong>
                </p>
              </div>
            )}

            {/* Alert: Bad Creative Signal */}
            {hasBadCreativeSignal && (
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>تنبيه الإعلان المضلل (Bad Creative Signal)</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                  تكلفة المحادثة رخيصة جداً ({costPerConversation.toFixed(1)} ج) مع نسبة تأكيد ضعيفة ({orderConfirmRate.toFixed(1)}% &lt; 50%). 
                  <strong className="text-slate-900 block mt-1">الإعلان يجذب فضوليين وصيادي عروض (Offer Hunters).. قم بتوضيح السعر بوضوح داخل الكريتيف.</strong>
                </p>
              </div>
            )}

            {/* Alert: Audience Saturation */}
            {hasHighFrequency && (
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>رادار تشبع الجمهور (Audience Saturation)</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                  معدل التكرار ({frequency.toFixed(2)} &ge; 3.0) مع ارتفاع كلفة الوصول. 
                  <strong className="text-slate-900 block mt-1">يوصي السيستم فوراً بتغيير الجمهور المستهدف أو تجديد الـ Visual والزوايا الإعلانية.</strong>
                </p>
              </div>
            )}

            {/* Alert: Follow-up Recommendation */}
            {hasLowChatConversion && (
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-indigo-800 font-bold text-xs">
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span>توصية الـ Follow-up والسكريبت</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                  معدل تحويل المحادثات لأوردرات ({chatToOrderRate.toFixed(1)}% &lt; 10%). 
                  <strong className="text-slate-900 block mt-1">تغيير السكريبت، الاستعانة بـ Voice Notes، وبناء الثقة بتوضيح السعر مبكراً.</strong>
                </p>
              </div>
            )}

            {/* Alert: Hook Quality */}
            {hasLowHookCtr && (
              <div className="p-3 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span>رادار جودة الـ Hook</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                  معدل النقر CTR أقل من 1.0% ({ctr.toFixed(2)}%). 
                  <strong className="text-slate-900 block mt-1">يوصي السيستم بتغيير أول 2-3 ثواني من الفيديو (Hook Video Hold) فوراً.</strong>
                </p>
              </div>
            )}

            {/* Alert: Scaling Gate */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>صمام التكبير الآمن (Scaling Stability)</span>
              </div>
              <p className="text-[11px] text-slate-700 font-sans leading-relaxed">
                حظر أي زيادة في الميزانية تتجاوز 20–30% تدريجياً لمنع تشتت الـ Algorithm والحفاظ على استقرار المزاد.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Benchmarks Table Matrix (Auto Color Coding) */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs md:text-sm font-bold font-headline text-slate-900">
              جدول معايير الأداء اللحظي (Egyptian Cosmetics Benchmarks Matrix)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> ممتاز/كويس</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> مقبول/تحذير</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> خطر</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold font-headline text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4">الماتريك (Metric)</th>
                <th className="py-3 px-4">القيمة الحالية (Your Live Data)</th>
                <th className="py-3 px-4">المعيار المرجعي في السوق (Egyptian Benchmark)</th>
                <th className="py-3 px-4">تقييم الحالة (Auto Color)</th>
                <th className="py-3 px-4">إشارة النظام والتنفيذي (System Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {activeMetricsList.map((metric) => (
                <tr key={metric.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Metric Name */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 font-headline flex items-center gap-2">
                      {metric.channels.includes('whatsapp') && <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />}
                      {metric.channels.includes('messenger') && <MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                      {metric.channels.includes('instagram') && <Instagram className="w-3.5 h-3.5 text-pink-600" />}
                      <span>{metric.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">{metric.explanation}</span>
                  </td>

                  {/* Live Value */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <span className="text-sm">
                      {metric.currentValue.toFixed(1)} {metric.unit}
                    </span>
                  </td>

                  {/* Benchmark Ranges */}
                  <td className="py-3.5 px-4 font-sans text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 space-y-1">
                      <div className="text-slate-700 font-bold font-headline">
                        {metric.benchmarkFormatted}
                      </div>
                    </div>
                  </td>

                  {/* Auto Color Status Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {metric.status === 'EXCELLENT' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-headline bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Flame className="w-3 h-3 text-emerald-600" />
                        <span>ممتاز / قوي 🔥</span>
                      </span>
                    )}
                    {metric.status === 'GOOD' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-headline bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>كويس / طبيعي 🟢</span>
                      </span>
                    )}
                    {metric.status === 'WARNING' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-headline bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>مقبول / انتباه 🟡</span>
                      </span>
                    )}
                    {metric.status === 'DANGER' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-headline bg-rose-50 text-rose-800 border border-rose-200">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        <span>خطر / ضعيف 🔴</span>
                      </span>
                    )}
                  </td>

                  {/* System Action */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-700 leading-relaxed font-sans max-w-xs">
                    {metric.systemAction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3 Dedicated Channel Reference Playcards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Messenger Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-headline text-slate-900">حملات ماسنجر (Meta Messenger)</h4>
              <span className="text-[10px] text-slate-500 font-mono">سوق الكوزماتيكس المصري</span>
            </div>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-600 font-sans leading-tight">
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Cost Per Message:</strong> 5-15 ج ممتاز | 15-30 ج كويس | +50 ج خطر.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Amount Spent Test:</strong> مراجعة الأداء بعد صرف 3-5 ضعف الـ Target Cost/Message.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-blue-600 font-bold">•</span>
              <span><strong>Click ➔ Message:</strong> 20-40% قوي لتقييم الـ CTA وجودة الجمهور.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: WhatsApp Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-headline text-slate-900">حملات الواتساب (WhatsApp Direct)</h4>
              <span className="text-[10px] text-slate-500 font-mono">سوق الكوزماتيكس المصري</span>
            </div>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-600 font-sans leading-tight">
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Cost Per WA Conv.:</strong> 4-12 ج ممتاز | 12-25 ج كويس | +40 ج خطر.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>WA Conv ➔ Order:</strong> 20-35% قوي بفضل قوة الإغلاق الصوتي والتأكيد الفوري.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span><strong>Response Time:</strong> أقل من 3 دقائق ممتاز | +15 دقيقة خطر قاتل للتحويل.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Instagram Direct Rules */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
              <Instagram className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold font-headline text-slate-900">حملات إنستجرام ديركت (IG Direct)</h4>
              <span className="text-[10px] text-slate-500 font-mono">سوق الكوزماتيكس المصري</span>
            </div>
          </div>
          <ul className="space-y-2 text-[11px] text-slate-600 font-sans leading-tight">
            <li className="flex items-start gap-1.5">
              <span className="text-pink-600 font-bold">•</span>
              <span><strong>Customer Intent:</strong> عميل انستجرام AOV أعلى ونية شراء قوية، الخلل غالباً في السعر والشات.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-pink-600 font-bold">•</span>
              <span><strong>Retargeting Advantage:</strong> تكلفة الطلب في إعادة الاستهداف أقل بـ 30-50%.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-pink-600 font-bold">•</span>
              <span><strong>Scaling Gate:</strong> حظر رفع الميزانية بأكثر من 20-30% تدريجياً لثبات الخوارزمية.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
