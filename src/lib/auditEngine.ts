import {
  AuditPayload,
  AuditResult,
  SystemStatus,
  FunnelLeakLocation,
  ActionItem,
  AdPlatformData,
  BackendSheetData,
  ChatSalesData,
  CreativeAngleAnalysis,
  CreativeAngleCategory,
  CreativeBreakdown
} from '../types';

export function run5LayerAudit(payload: AuditPayload): AuditResult {
  const { ad_platforms, backend_sheet } = payload;

  // Aggregate Ad Platform Totals
  let totalSpend = 0;
  let totalClicks = 0;
  let totalImpressions = 0;
  let total3SecViews = 0;
  let total75SecViews = 0;
  let totalReportedOrders = 0;
  let totalReportedRevenue = 0;
  let minCampaignAgeHours = 999;
  let maxBudgetScaled24h = 0;

  ad_platforms.forEach((p) => {
    totalSpend += p.spend || 0;
    totalClicks += p.clicks || 0;
    totalImpressions += p.impressions || 0;
    total3SecViews += p.three_sec_views || 0;
    total75SecViews += p.seventy_five_percent_views || 0;
    totalReportedOrders += p.reported_orders || 0;
    totalReportedRevenue += p.reported_revenue || 0;
    if (p.campaign_age_hours !== undefined) {
      minCampaignAgeHours = Math.min(minCampaignAgeHours, p.campaign_age_hours);
    }
    if (p.budget_scaled_24h_pct !== undefined) {
      maxBudgetScaled24h = Math.max(maxBudgetScaled24h, p.budget_scaled_24h_pct);
    }
  });

  if (minCampaignAgeHours === 999) minCampaignAgeHours = 72; // default mature

  // Layer 1: Pre-Click Specialist (Meta Messaging Ads - Messenger / WhatsApp / Instagram)
  let totalReach = 0;
  let totalOutboundClicks = 0;
  let totalMessages = 0;
  let totalNewMessages = 0;
  let totalReturningMessages = 0;

  ad_platforms.forEach((p) => {
    totalReach += p.reach || Math.round((p.impressions || 0) / (p.frequency || 1.8));
    const obClicks = p.outbound_clicks || Math.round((p.clicks || 0) * 0.75);
    const msgs = p.messaging_conversations_started || Math.round((p.clicks || 0) * 0.18);
    const newMsgs = p.new_messaging_contacts || Math.round(msgs * 0.75);
    const retMsgs = p.returning_messaging_contacts || Math.max(0, msgs - newMsgs);

    totalOutboundClicks += obClicks;
    totalMessages += msgs;
    totalNewMessages += newMsgs;
    totalReturningMessages += retMsgs;
  });

  const hookRate = totalImpressions > 0 ? (total3SecViews / totalImpressions) * 100 : 0;
  const holdRate = total3SecViews > 0 ? (total75SecViews / total3SecViews) * 100 : 0;
  const blendedCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const outboundCtr = totalImpressions > 0 ? (totalOutboundClicks / totalImpressions) * 100 : blendedCtr;
  const blendedCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
  const frequency = totalReach > 0 ? totalImpressions / totalReach : 1.8;
  const costPerMessage = totalMessages > 0 ? totalSpend / totalMessages : 0;
  const costPerOutboundClick = totalOutboundClicks > 0 ? totalSpend / totalOutboundClicks : 0;
  const clickToMessageRate = totalOutboundClicks > 0 ? (totalMessages / totalOutboundClicks) * 100 : 0;
  const costPerNewContact = totalNewMessages > 0 ? totalSpend / totalNewMessages : costPerMessage;

  // Layer 1 Specific Rule Tests (Pre-Click Specialist)
  let hookLeak = hookRate < 15;
  let holdLeak = hookRate >= 20 && holdRate < 5;
  let offerCtaLeak = holdRate >= 8 && outboundCtr < 1.2;
  let bridgeLeak = outboundCtr >= 1.0 && clickToMessageRate < 35; // Click-to-Message Conversion Leak (< 35%)
  let creativeFatigueLeak = frequency >= 3.5 && blendedCpm >= 20 && outboundCtr < 1.0;
  let narrowAudienceLeak = blendedCpm >= 35 || (frequency >= 4.5 && minCampaignAgeHours <= 168);

  // Red Flags
  const redFlags: string[] = [];
  if (blendedCpm > 30) {
    redFlags.push('ارتفاع حاد في الـ CPM (تكلفة المزاد) بدون تغيير الاستهداف - ضغط منافسة أو مراجعة سياق الإعلان.');
  }
  if (outboundCtr < 1.0 && hookRate >= 20) {
    redFlags.push('هبوط الـ CTR رغم جودة بداية الفيديو (Creative Fatigue أو ضعف زر الرسالة).');
  }
  if (clickToMessageRate > 0 && clickToMessageRate < 35) {
    redFlags.push(`تسريب في مرحلة الجسر (Click-to-Message Rate = ${clickToMessageRate.toFixed(1)}%): أكثر من ${(100 - clickToMessageRate).toFixed(0)}% من الضغاطين لا يفتحون الشات!`);
  }
  if (frequency >= 4.5) {
    redFlags.push('التكرار (Frequency) تجاوز 4.5 على جمهور جديد خلال أول أسبوع - الاستهداف ضيق جداً.');
  }
  if (hookRate < 15) {
    redFlags.push('معدل الـ Hook أقل من 15% - خسارة أكثر من 85% من الجمهور في أول 3 ثواني.');
  }

  // Layer 1 Output Construction
  let layer1Light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP' = 'GREEN_SCALE';
  let layer1LeakLocation = 'أداء الإعلان قوي ولا يوجد تسريب في المرحلة الأولى (No Pre-Click Leak)';
  let layer1LeakCode = 'PRE_CLICK_OK';
  let layer1Details = 'الماتريكس البصرية ومعدلات التفاعل والتحويل المباشر للرسائل في نطاق ممتاز.';
  let layer1Action = 'الإعلان يعمل بكفاءة عالية، يمكنك استكمال السكيل التدريجي (+15% إلى 20% كل 48 ساعة).';

  if (hookLeak) {
    layer1Light = 'YELLOW_FIX';
    layer1LeakLocation = 'تسريب الهوك (Hook Leak) - ضعف أول 3 ثواني';
    layer1LeakCode = 'PRE_CLICK_HOOK_LEAK';
    layer1Details = `معدل الـ Hook واقف عند ${hookRate.toFixed(1)}% (أقل من الحد الأدنى 15%). الإعلان لا يلفت انتباه المستهدفين فورياً.`;
    layer1Action = 'تغيير أول 3 ثواني (Hook) أو الجملة الافتتاحية/التصميم بدون تعديل باقي جسم الفيديو.';
  } else if (holdLeak) {
    layer1Light = 'YELLOW_FIX';
    layer1LeakLocation = 'تسريب المحتوى (Hold Leak) - انصراف الجمهور من جسم الفيديو';
    layer1LeakCode = 'PRE_CLICK_HOLD_LEAK';
    layer1Details = `الـ Hook جذاب (${hookRate.toFixed(1)}%) ولكن الـ Hold Rate واقف عند ${holdRate.toFixed(1)}% (أقل من 5%). الجمهور يترك الفيديو قبل فهم العرض.`;
    layer1Action = 'اختصار مدة الفيديو، تسريع الإيقاع البصري كل ثانيتين، أو إعادة كتابة سكريبت العرض.';
  } else if (offerCtaLeak) {
    layer1Light = 'YELLOW_FIX';
    layer1LeakLocation = 'تسريب العرض والدعوة لاتخاذ إجراء (Offer & CTA Leak)';
    layer1LeakCode = 'PRE_CLICK_OFFER_CTA_LEAK';
    layer1Details = `معدل المشاهدة ممتازة (${holdRate.toFixed(1)}% Hold) ولكن الـ Outbound CTR ضعيف جداً (${outboundCtr.toFixed(2)}% < 1.2%). المشاهدون يكملون الفيديو دون رغبة في فتح الرسائل.`;
    layer1Action = 'تحديث العرض التسويقي (Offer)، تغيير السعر أو الباكدج، وجعل زر الدعوة للرسالة (CTA) صريحاً ومحفزاً في نهاية الفيديو.';
  } else if (bridgeLeak) {
    layer1Light = 'YELLOW_FIX';
    layer1LeakLocation = 'تسريب الجسر (Bridge Leak) - انقطاع بين ضغطة الإعلان وفتح المحادثة';
    layer1LeakCode = 'PRE_CLICK_BRIDGE_LEAK';
    layer1Details = `النقرات المباشرة عالية (${totalOutboundClicks.toLocaleString()} كليك) ولكن نسبة تحويل النقرة إلى محادثة واقفة عند ${clickToMessageRate.toFixed(1)}% فقط (تسريب أكثر من ${(100 - clickToMessageRate).toFixed(0)}% من المهتمين قبل بدء الشات).`;
    layer1Action = 'فحص رسالة الترحيب الأوتوماتيكية (Welcome Message Prompt)، تسريع رابط تحويل الشات، وتأكيد مطابقة العرض في الإعلان لأول نص يظهر للعميل.';
  } else if (creativeFatigueLeak) {
    layer1Light = 'RED_STOP';
    layer1LeakLocation = 'إجهاد الإعلان وتأكل الاستجابة (Creative Fatigue)';
    layer1LeakCode = 'PRE_CLICK_CREATIVE_FATIGUE';
    layer1Details = `التكرار عالي جداً (${frequency.toFixed(1)}) مع ارتفاع CPM (${blendedCpm.toFixed(1)} ج.م) وانخفاض CTR. الجمهور تشبع من الإعلان.`;
    layer1Action = 'إيقاف أو عمل Creative Refresh شامل وتدشين زوايا تسويقية وفيديوهات جديدة تماماً.';
  } else if (narrowAudienceLeak) {
    layer1Light = 'YELLOW_FIX';
    layer1LeakLocation = 'ضيق الاستهداف وشح المزاد (Auction Pressure / Narrow Audience)';
    layer1LeakCode = 'PRE_CLICK_AUCTION_NARROW_AUDIENCE';
    layer1Details = `الـ CPM مرتفع جداً (${blendedCpm.toFixed(1)} ج.م) والـ Frequency يرتفع بسرعة. الجمهور المستهدف ضيق للغاية أو المنافسة محتدمة.`;
    layer1Action = 'توسيع نطاق الاستهداف (Broadening Audience) إلى Broad أو تجربة زاوية إعلانية تناسب فئة أكبر.';
  }

  // Layer 1: Creative Angle & Hook Matrix Calculation
  const angleBuckets: Record<string, {
    category: CreativeAngleCategory;
    label_ar: string;
    spend: number;
    impressions: number;
    messages: number;
    orders: number;
    three_sec_views: number;
    seventy_five_views: number;
    outbound_clicks: number;
    creatives_count: number;
    directive: string;
  }> = {
    'DOCTOR_RECOMMENDATION': {
      category: 'DOCTOR_RECOMMENDATION',
      label_ar: 'ترشيح دكاترة ومتخصصين (Doctor Endorsement)',
      spend: 0,
      impressions: 0,
      messages: 0,
      orders: 0,
      three_sec_views: 0,
      seventy_five_views: 0,
      outbound_clicks: 0,
      creatives_count: 0,
      directive: 'زاوية بناء ثقة فائقة وسريعة الإغلاق: ضاعف الإنتاج بفيديوهات تبرز الشهادات العلمية وشرح المكونات بالتفصيل.'
    },
    'PROBLEM_SOLVING': {
      category: 'PROBLEM_SOLVING',
      label_ar: 'حل المشكلة (حب الشباب / التساقط / التصبغات)',
      spend: 0,
      impressions: 0,
      messages: 0,
      orders: 0,
      three_sec_views: 0,
      seventy_five_views: 0,
      outbound_clicks: 0,
      creatives_count: 0,
      directive: 'زاوية الألم المباشر (Pain-Point): ركز على أول ثانيتين في الهوك بإظهار المشكلة الصادمة لتحقيق أعلى Hook Rate.'
    },
    'BEFORE_AFTER': {
      category: 'BEFORE_AFTER',
      label_ar: 'نتائج وتجارب قبل وبعد (Before & After)',
      spend: 0,
      impressions: 0,
      messages: 0,
      orders: 0,
      three_sec_views: 0,
      seventy_five_views: 0,
      outbound_clicks: 0,
      creatives_count: 0,
      directive: 'زاوية الدليل البصري الحاسم (Social Proof): حقق أعلى معدل شراء مباشر، مع الالتزام بسياسات ميتا وتجنب الزووم المفرط.'
    },
    'UGC_CUSTOMER_REVIEW': {
      category: 'UGC_CUSTOMER_REVIEW',
      label_ar: 'تجارب عملاء حقيقيين (UGC Review)',
      spend: 0,
      impressions: 0,
      messages: 0,
      orders: 0,
      three_sec_views: 0,
      seventy_five_views: 0,
      outbound_clicks: 0,
      creatives_count: 0,
      directive: 'زاوية المحتوى العفوي (Relatability): زود تصوير العملاء بالموبايل بدون تكلف مع فتح العبوة والتجربة المباشرة.'
    },
    'OFFERS_DISCOUNTS': {
      category: 'OFFERS_DISCOUNTS',
      label_ar: 'عروض وتخفيضات وباكدجات (Offers & Deals)',
      spend: 0,
      impressions: 0,
      messages: 0,
      orders: 0,
      three_sec_views: 0,
      seventy_five_views: 0,
      outbound_clicks: 0,
      creatives_count: 0,
      directive: 'زاوية اصطياد الصفقات: توضح السعر داخل الكريتيف فوراً لتجنب جذب عملاء غير جادين أو صدمة السعر في الشات.'
    }
  };

  // Traverse creatives
  ad_platforms.forEach(p => {
    p.ad_sets?.forEach(as => {
      as.creatives?.forEach(c => {
        const cat = c.angle_category || 'UGC_CUSTOMER_REVIEW';
        if (!angleBuckets[cat]) {
          angleBuckets[cat] = {
            category: cat as CreativeAngleCategory,
            label_ar: c.angle_label_ar || 'زاوية عامة',
            spend: 0,
            impressions: 0,
            messages: 0,
            orders: 0,
            three_sec_views: 0,
            seventy_five_views: 0,
            outbound_clicks: 0,
            creatives_count: 0,
            directive: 'تطوير أفكار وهوكات جديدة لهذه الزاوية.'
          };
        }
        angleBuckets[cat].spend += c.spend || 0;
        angleBuckets[cat].impressions += c.impressions || 0;
        angleBuckets[cat].messages += c.messaging_conversations_started || 0;
        angleBuckets[cat].three_sec_views += c.three_sec_views || 0;
        angleBuckets[cat].seventy_five_views += c.seventy_five_percent_views || 0;
        angleBuckets[cat].outbound_clicks += c.outbound_clicks || 0;
        angleBuckets[cat].creatives_count += 1;
        angleBuckets[cat].orders += c.attributed_orders || Math.round((c.messaging_conversations_started || 0) * 0.12);
      });
    });
  });

  const creativeAngleList: CreativeAngleAnalysis[] = Object.values(angleBuckets)
    .filter(b => b.creatives_count > 0 || b.spend > 0)
    .map(b => {
      const cvr = b.messages > 0 ? Number(((b.orders / b.messages) * 100).toFixed(1)) : 0;
      const blendedCpa = b.orders > 0 ? Math.round(b.spend / b.orders) : 0;
      const costPerMsg = b.messages > 0 ? Number((b.spend / b.messages).toFixed(2)) : 0;
      const avgHook = b.impressions > 0 ? Number(((b.three_sec_views / b.impressions) * 100).toFixed(1)) : 0;
      const avgHold = b.three_sec_views > 0 ? Number(((b.seventy_five_views / b.three_sec_views) * 100).toFixed(1)) : 0;
      const avgCtr = b.impressions > 0 ? Number(((b.outbound_clicks / b.impressions) * 100).toFixed(2)) : 0;

      let status: CreativeAngleAnalysis['angle_status'] = 'SCALABLE';
      if (cvr >= 15 && blendedCpa <= 350) status = 'WINNING';
      else if (blendedCpa > 650 || cvr < 5) status = 'DRAINING_BUDGET';
      else if (avgHook < 15) status = 'PROMISING';

      return {
        angle_category: b.category,
        label_ar: b.label_ar,
        total_spend: b.spend,
        total_impressions: b.impressions,
        total_messages: b.messages,
        total_orders: b.orders,
        avg_hook_rate: avgHook,
        avg_hold_rate: avgHold,
        avg_outbound_ctr: avgCtr,
        cvr,
        blended_cpa: blendedCpa,
        cost_per_message: costPerMsg,
        is_winning_angle: false,
        angle_status: status,
        content_team_directive: b.directive,
        creatives_count: b.creatives_count
      };
    });

  // Sort angles by highest CVR and lowest Blended CPA
  creativeAngleList.sort((a, b) => {
    if (a.cvr !== b.cvr) return b.cvr - a.cvr;
    return a.blended_cpa - b.blended_cpa;
  });

  let winningAngle: CreativeAngleAnalysis | undefined = undefined;
  if (creativeAngleList.length > 0) {
    creativeAngleList[0].is_winning_angle = true;
    creativeAngleList[0].angle_status = 'WINNING';
    winningAngle = creativeAngleList[0];
  }

  // Layer 2: Post-Click & Funnel
  const rawOrders = backend_sheet.raw_orders || 0;
  const confirmedOrders = backend_sheet.confirmed_orders || 0;
  const cancelledFake = backend_sheet.cancelled_fake_orders || 0;

  const confirmationRate = rawOrders > 0 ? (confirmedOrders / rawOrders) * 100 : 0;
  const fakeRate = rawOrders > 0 ? (cancelledFake / rawOrders) * 100 : 0;
  
  // Funnel Leak % = ((Ad Clicks or Messages - Confirmed Backend Orders) / Ad Clicks or Messages) * 100
  const funnelLeakPct = totalClicks > 0 
    ? Math.max(0, ((totalClicks - confirmedOrders) / totalClicks) * 100) 
    : 0;

  let confirmationLeakIssue = confirmationRate < 70;
  let fakeOrdersIssue = fakeRate > 20;

  // Layer 3: Economics (Real Profitability)
  const trueCpa = confirmedOrders > 0 ? totalSpend / confirmedOrders : totalSpend;
  const aov = backend_sheet.average_order_value || 0;
  const grossRevenue = confirmedOrders * aov;

  const totalCogs = confirmedOrders * (backend_sheet.cogs_per_order || 0);
  const totalShipping = confirmedOrders * (backend_sheet.shipping_cost_per_order || 0);
  const totalCodFees = confirmedOrders * (backend_sheet.cod_fee_per_order || 0);
  const totalConfirmationFees = rawOrders * (backend_sheet.confirmation_fee_per_order || 0);

  const totalVariableCosts = totalShipping + totalCodFees + totalConfirmationFees;
  const contributionMargin = grossRevenue - totalCogs - totalVariableCosts - totalSpend;
  
  const netMarginPct = grossRevenue > 0 ? (contributionMargin / grossRevenue) * 100 : 0;
  const variableAndCogsPctPerOrder = aov > 0 
    ? ((backend_sheet.cogs_per_order + backend_sheet.shipping_cost_per_order + backend_sheet.cod_fee_per_order + backend_sheet.confirmation_fee_per_order) / aov) 
    : 0.6;
  
  const breakevenRoas = variableAndCogsPctPerOrder < 1 ? 1 / (1 - variableAndCogsPctPerOrder) : 2.5;

  // Layer 4: Attribution & Signal Integrity
  const overclaimPct = confirmedOrders > 0 
    ? ((totalReportedOrders - confirmedOrders) / confirmedOrders) * 100 
    : 0;

  let signalIntegrityScore = 100;
  if (Math.abs(overclaimPct) > 25) {
    signalIntegrityScore -= Math.min(40, (Math.abs(overclaimPct) - 25) * 1.2);
  }
  if (confirmationRate < 70) {
    signalIntegrityScore -= (70 - confirmationRate) * 0.5;
  }
  signalIntegrityScore = Math.max(10, Math.round(signalIntegrityScore));

  let creativeDiagnosisScore = 100;
  if (hookLeak) creativeDiagnosisScore -= 30;
  if (holdLeak) creativeDiagnosisScore -= 25;
  if (creativeFatigueLeak) creativeDiagnosisScore -= 25;
  creativeDiagnosisScore = Math.max(15, Math.round(creativeDiagnosisScore));

  let croAuditScore = 100;
  if (confirmationLeakIssue) croAuditScore -= 35;
  if (fakeOrdersIssue) croAuditScore -= 25;
  if (funnelLeakPct > 85) croAuditScore -= 20;
  croAuditScore = Math.max(10, Math.round(croAuditScore));

  let scalingGuardrailsScore = 100;
  if (minCampaignAgeHours < 48) scalingGuardrailsScore -= 40;
  if (maxBudgetScaled24h > 30) scalingGuardrailsScore -= 35;
  if (contributionMargin < 0) scalingGuardrailsScore -= 45;
  scalingGuardrailsScore = Math.max(10, Math.round(scalingGuardrailsScore));

  // Determine Leak Location
  let leakLocation: FunnelLeakLocation = 'POST_CLICK_CONFIRMATION_LEAK';
  if (contributionMargin < 0 && totalCogs > grossRevenue * 0.5) {
    leakLocation = 'ECONOMICS_HIGH_COGS';
  } else if (confirmationLeakIssue || fakeOrdersIssue) {
    leakLocation = 'POST_CLICK_CONFIRMATION_LEAK';
  } else if (hookLeak) {
    leakLocation = 'PRE_CLICK_HOOK_LEAK';
  } else if (holdLeak) {
    leakLocation = 'PRE_CLICK_HOLD_LEAK';
  } else if (offerCtaLeak) {
    leakLocation = 'PRE_CLICK_OFFER_CTA_LEAK';
  } else if (creativeFatigueLeak) {
    leakLocation = 'PRE_CLICK_CREATIVE_FATIGUE';
  } else if (narrowAudienceLeak) {
    leakLocation = 'PRE_CLICK_AUCTION_NARROW_AUDIENCE';
  } else if (Math.abs(overclaimPct) > 30) {
    leakLocation = 'ATTRIBUTION_MISMATCH';
  }

  // Layer 5: Traffic Light Rules
  let systemStatus: SystemStatus = 'GREEN_MOVE';
  let statusReason = 'مجموعة بيانات مكتملة مع هامش ربحي إيجابي ونسب تسريب مقبولة في القمع الإعلاني.';

  if (minCampaignAgeHours < 48) {
    systemStatus = 'RED_DONT_TOUCH';
    statusReason = `الحملة تم إطلاقها مؤخراً (${minCampaignAgeHours} ساعة < 48 ساعة فترة تعلم). اترك الخوارزميات تتعلم قبل إجراء أي تعديلات.`;
  } else if (maxBudgetScaled24h > 30) {
    systemStatus = 'RED_DONT_TOUCH';
    statusReason = `تم زيادة الميزانية بنسبة ${maxBudgetScaled24h.toFixed(0)}% خلال 24 ساعة الماضية (تجاوز حد 30%). جمد التعديلات لمنع إعادة ضبط المزاد.`;
  } else if (contributionMargin < 0) {
    systemStatus = 'RED_DONT_TOUCH';
    statusReason = `هامش ربح إجمالي بالسالب (${contributionMargin.toFixed(2)} ج.م). تم اكتشاف خسائر فعلية في الشيت رغم الأرباح الوهمية المسجلة في منصة الإعلانات.`;
  } else if (confirmedOrders < 10) {
    systemStatus = 'YELLOW_WAIT';
    statusReason = `حجم العينة صغير جداً (${confirmedOrders} طلب مؤكد < حد 10 طلبات). انتظر 24-48 ساعة للحصول على إشارة دقيقة.`;
  } else if (overclaimPct > 30) {
    systemStatus = 'YELLOW_WAIT';
    statusReason = `منصة الإعلانات تسجل طلبات زائدة بنسبة ${overclaimPct.toFixed(1)}% عن الشيت المؤكد. حافظ على الميزانية مع مراجعة التأكيدات.`;
  } else if (confirmationLeakIssue || hookLeak || holdLeak || offerCtaLeak) {
    systemStatus = 'YELLOW_WAIT';
    statusReason = `تم اكتشاف اختناق في الأداء في مرحلة ${layer1LeakLocation}. يتطلب إجراءً قبل زيادة الميزانية.`;
  }

  // Generate Action Queue (Arabic)
  const actionQueue: ActionItem[] = [];

  if (confirmationLeakIssue) {
    actionQueue.push({
      id: 'a1',
      action: `راجع سكريبت تأكيدات الكول سنتر وأوتوميشن الواتساب فورياً. معدل التأكيد الحالي ${confirmationRate.toFixed(1)}% (أقل من الحد الأدنى 70%).`,
      priority: 'HIGH',
      category: 'Backend'
    });
  }

  if (hookLeak) {
    actionQueue.push({
      id: 'a2',
      action: `جدد الـ Hook الخاص بالإعلانات فوراً. معدل الـ Hook الحالي ${hookRate.toFixed(1)}% (أقل من 15%). جرب 3 مقاطع بداية فيديو خاطفة للانتباه.`,
      priority: 'HIGH',
      category: 'Creative'
    });
  }

  if (holdLeak) {
    actionQueue.push({
      id: 'a3',
      action: `أعد مونتاج جسم الفيديو الإعلاني. البداية جذابة ولكن معدل الاحتفاظ ينخفض إلى ${holdRate.toFixed(1)}% (أقل من 5%).`,
      priority: 'MEDIUM',
      category: 'Creative'
    });
  }

  if (offerCtaLeak) {
    actionQueue.push({
      id: 'a3_offer',
      action: `حدث العرض التسويقي وزر الرسالة (CTA). معدل المشاهدة ممتازة ولكن الـ Outbound CTR واقف عند ${outboundCtr.toFixed(2)}% (< 1.2%).`,
      priority: 'HIGH',
      category: 'Creative'
    });
  }

  if (contributionMargin < 0) {
    actionQueue.push({
      id: 'a4',
      action: `أوقف الإعلانات غير المربحة أو ارفع سعر المنتج/العرض. التكلفة الحقيقية للطلب ${trueCpa.toFixed(2)} ج.م مقابل نقطة التعادل ${breakevenRoas.toFixed(2)}x.`,
      priority: 'HIGH',
      category: 'Budget'
    });
  }

  if (fakeOrdersIssue) {
    actionQueue.push({
      id: 'a5',
      action: `فعل خاصية تأكيد رقم الموبايل بكود OTP أو القوائم المنسدلة للعنوان. نسبة الطلبات الوهمية ${fakeRate.toFixed(1)}% (تجاوزت حد 20%).`,
      priority: 'HIGH',
      category: 'CRO'
    });
  }

  if (actionQueue.length === 0) {
    actionQueue.push({
      id: 'a6',
      action: 'قم بزيادة الميزانية اليومية على الإعلانات الرابحة بنسبة +15% إلى +20% كل 48 ساعة.',
      priority: 'MEDIUM',
      category: 'Budget'
    });
  }

  const summary = `حالة النظام الحالية هي ${systemStatus === 'GREEN_MOVE' ? 'انطلق (GREEN)' : systemStatus === 'YELLOW_WAIT' ? 'انتظر ومحص (YELLOW)' : 'لا تلمس الحملات (RED)'}. اجمالي الطلبات المؤكدة في الشيت هي ${confirmedOrders} طلب بتكلفة حقيقية ${trueCpa.toFixed(2)} ج.م للطلب وهامش ربح صافي ${contributionMargin.toFixed(2)} ج.م. الاختناق الرئيسي في القمع الإعلاني يقع في: ${layer1LeakLocation}. معدل تأكيد الكول سنتر هو ${confirmationRate.toFixed(1)}% ونسبة المبالغة في الإعلانات هي ${overclaimPct.toFixed(1)}%.`;

  // Layer 2 Core Dynamic Calculations & Rules
  const chatData: Partial<ChatSalesData> = payload.chat_data || {};
  const metaTotalSpend = totalSpend;
  const metaOutboundClicksCount = totalOutboundClicks;
  const actualReceivedChats = chatData.actual_received_chats ?? totalMessages;
  const avgFrtMinutes = chatData.average_frt_minutes ?? 0;
  const qualifiedLeadsCount = chatData.qualified_leads_count ?? 0;
  const closedOrdersCount = chatData.closed_orders_count ?? confirmedOrders;
  const followupClosedOrders = chatData.followup_closed_orders ?? 0;

  // 1. Click-to-Chat Rate = (Actual_CRM_Chats / Meta_Outbound_Clicks) * 100
  const calcClickToChatRate = Number(((actualReceivedChats / Math.max(1, metaOutboundClicksCount)) * 100).toFixed(1));

  // 2. Qualified Lead Rate = (Qualified_Leads / Actual_CRM_Chats) * 100
  const calcQualifiedRate = Number(((qualifiedLeadsCount / Math.max(1, actualReceivedChats)) * 100).toFixed(1));

  // 3. Chat CVR = (Closed_Orders / Actual_CRM_Chats) * 100
  const calcChatCvr = Number(((closedOrdersCount / Math.max(1, actualReceivedChats)) * 100).toFixed(1));
  const platformPurchaseCvr = Number(((totalReportedOrders / Math.max(1, totalClicks)) * 100).toFixed(2));
  const salesPurchaseCvr = Number(((confirmedOrders / Math.max(1, actualReceivedChats)) * 100).toFixed(2));

  // 4. Follow-up Close Rate = (Followup_Closed_Orders / Total_Closed_Orders) * 100
  const calcFollowupCloseRate = Number(((followupClosedOrders / Math.max(1, closedOrdersCount)) * 100).toFixed(1));

  // 5. True CPA = Meta_Total_Spend / Closed_Orders
  const calcTrueCpa = Number((metaTotalSpend / Math.max(1, closedOrdersCount)).toFixed(1));

  // 6. VBP Score (Value-Before-Price) Calculations
  const totalPriceInquiries = chatData.total_price_inquiries_count ?? Math.round(actualReceivedChats * 0.773);
  const vbpPassedChats = chatData.vbp_passed_chats_count ?? Math.round(totalPriceInquiries * 0.42);
  const vbpFailedChats = Math.max(0, totalPriceInquiries - vbpPassedChats);
  const vbpScorePct = Number(((vbpPassedChats / Math.max(1, totalPriceInquiries)) * 100).toFixed(1));
  const vbpStatus = vbpScorePct >= 80 ? 'OPTIMAL' : vbpScorePct >= 50 ? 'BELOW_BENCHMARK' : 'CRITICAL';

  // 7. AOV (Average Order Value) & Upselling / Cross-selling Calculations
  const totalSalesRevenue = (payload.backend_sheet?.average_order_value || 0) * closedOrdersCount;
  const calculatedAov = Number((totalSalesRevenue / Math.max(1, closedOrdersCount)).toFixed(0));
  const upsellAttemptsCount = chatData.upsell_attempts_count ?? Math.round(closedOrdersCount * 0.35);
  const upsellAttemptsRate = Number(((upsellAttemptsCount / Math.max(1, closedOrdersCount)) * 100).toFixed(1));
  const crossSellAttemptsCount = chatData.cross_sell_attempts_count ?? Math.round(closedOrdersCount * 0.28);
  const crossSellAttemptsRate = Number(((crossSellAttemptsCount / Math.max(1, closedOrdersCount)) * 100).toFixed(1));
  const singleProductOrdersWithoutUpsell = chatData.single_product_orders_no_upsell ?? 0;
  const singleProductNoUpsellFlag = singleProductOrdersWithoutUpsell > 0;

  // 8. FRT Status = Average_FRT_Minutes
  const calcFrt = avgFrtMinutes;

  // Diagnostic Tree Triggers (Strict user rules)
  const leakClickToChatTriggered = calcClickToChatRate < 60;
  const leakSpeedTriggered = calcFrt > 10;
  const leakLeadQualityTriggered = calcQualifiedRate < 40;
  const leakPriceShockTriggered = calcQualifiedRate > 50 && calcChatCvr < 10;
  const leakNoFollowupTriggered = calcFollowupCloseRate < 10;

  return {
    system_status: systemStatus,
    status_reason: statusReason,
    health_scores: {
      signal_integrity: signalIntegrityScore,
      creative_diagnosis: creativeDiagnosisScore,
      cro_audit: croAuditScore,
      scaling_guardrails: scalingGuardrailsScore
    },
    financial_economics: {
      true_cpa: Number(trueCpa.toFixed(2)),
      contribution_margin: Number(contributionMargin.toFixed(2)),
      overclaim_percentage: Number(overclaimPct.toFixed(2)),
      funnel_leak_percentage: Number(funnelLeakPct.toFixed(2)),
      gross_revenue: Number(grossRevenue.toFixed(2)),
      net_margin_percentage: Number(netMarginPct.toFixed(2)),
      breakeven_roas: Number(breakevenRoas.toFixed(2))
    },
    diagnosis_summary: summary,
    data_context_note: payload.data_context_note?.trim() || undefined,
    system_memory_notes: payload.system_memory_notes?.filter(Boolean) || [],
    analysis_inputs: payload.analysis_inputs,
    funnel_leak_location: leakLocation,
    layer1_diagnostic: {
      decision_light: layer1Light,
      leak_location: layer1LeakLocation,
      leak_code: layer1LeakCode,
      hook_rate: Number(hookRate.toFixed(1)),
      hold_rate: Number(holdRate.toFixed(1)),
      outbound_clicks: totalOutboundClicks,
      outbound_ctr: Number(outboundCtr.toFixed(2)),
      cost_per_outbound_click: Number(costPerOutboundClick.toFixed(2)),
      click_to_message_rate: Number(clickToMessageRate.toFixed(1)),
      messaging_conversations_started: totalMessages,
      messaging_contacts: totalMessages,
      new_messaging_contacts: totalNewMessages,
      returning_messaging_contacts: totalReturningMessages,
      cost_per_messaging_conversation: Number(costPerMessage.toFixed(2)),
      cost_per_result: Number(costPerMessage.toFixed(2)),
      cost_per_new_contact: Number(costPerNewContact.toFixed(2)),
      cpm: Number(blendedCpm.toFixed(2)),
      frequency: Number(frequency.toFixed(1)),
      cost_per_message: Number(costPerMessage.toFixed(2)),
      diagnosis_details: layer1Details,
      action_plan_24h: layer1Action,
      red_flags: redFlags,
      creative_angles: creativeAngleList,
      winning_angle: winningAngle
    },
    layer2_diagnostic: {
      decision_light: (leakSpeedTriggered || leakPriceShockTriggered || leakNoFollowupTriggered) ? 'YELLOW_FIX' : 'GREEN_SCALE',
      chat_kpis: [
        {
          id: 'kpi_click_to_chat',
          name: 'Click-to-Chat Rate',
          description: `نسبة الوصول للشات: (${actualReceivedChats.toLocaleString()} CRM Chats ÷ ${metaOutboundClicksCount.toLocaleString()} Meta Outbound Clicks) * 100`,
          value: calcClickToChatRate,
          unit: '%',
          healthy_range: 'أعلى من 70%',
          red_flag_threshold: 'أقل من 60%',
          status: calcClickToChatRate >= 70 ? 'HEALTHY' : calcClickToChatRate < 60 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_frt',
          name: 'First Response Time (FRT Status)',
          description: `متوسط وقت أول رد بالدقائق من السيلز: ${calcFrt} دقيقة (مقارنة بالبنشمارك).`,
          value: calcFrt,
          unit: 'دقيقة',
          healthy_range: 'أقل من 10 دقائق',
          red_flag_threshold: 'أكبر من 10 دقائق',
          status: calcFrt <= 10 ? 'HEALTHY' : 'RED_FLAG'
        },
        {
          id: 'kpi_qualified_rate',
          name: 'الرقم الأول: Qualified Rate %',
          description: `نسبة الليدات الجادة والمطابقة للجمهور: [افتح الـ Inbox أو CRM وافرز الـ Tags] = (${qualifiedLeadsCount.toLocaleString()} شات جاد ÷ ${actualReceivedChats.toLocaleString()} إجمالي شاتات مستقبلة) * 100`,
          value: calcQualifiedRate,
          unit: '%',
          healthy_range: 'أعلى من 50%',
          red_flag_threshold: 'أقل من 40%',
          status: calcQualifiedRate >= 50 ? 'HEALTHY' : calcQualifiedRate < 40 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_chat_cvr',
          name: 'الرقم الثاني: Chat CVR %',
          description: `معدل تحويل الشات لأوردرات: [من شيت المبيعات أو المتجر] = (${closedOrdersCount.toLocaleString()} أوردر مقفول ومؤكد ÷ ${actualReceivedChats.toLocaleString()} إجمالي شاتات مستقبلة) * 100`,
          value: calcChatCvr,
          unit: '%',
          healthy_range: 'من 15% لـ 25%+',
          red_flag_threshold: 'أقل من 10%',
          status: calcChatCvr >= 15 ? 'HEALTHY' : calcChatCvr < 10 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_vbp_score',
          name: 'VBP Score (Value-Before-Price)',
          description: `مؤشر بناء القيمة قبل السعر: (${vbpPassedChats.toLocaleString()} محادثة التزمت بالقيمة ÷ ${totalPriceInquiries.toLocaleString()} طلب سعر) * 100`,
          value: vbpScorePct,
          unit: '%',
          healthy_range: 'أعلى من 80%',
          red_flag_threshold: 'أقل من 50%',
          status: vbpScorePct >= 80 ? 'HEALTHY' : vbpScorePct < 50 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_aov_chat',
          name: 'AOV & Upsell Efficiency',
          description: `متوسط قيمة الأوردر المقفول: ${calculatedAov.toLocaleString()} ج.م (نسبة محاولات الترقية لباكدج: ${upsellAttemptsRate}% | منتجات مكملة: ${crossSellAttemptsRate}%)`,
          value: calculatedAov,
          unit: 'ج.م',
          healthy_range: 'أعلى من 600 ج.م',
          red_flag_threshold: 'أقل من 400 ج.م',
          status: calculatedAov >= 600 ? 'HEALTHY' : calculatedAov < 400 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_followup_cvr',
          name: 'Follow-up Close Rate',
          description: `معدل مبيعات المتابعة: (${followupClosedOrders.toLocaleString()} Follow-up Orders ÷ ${closedOrdersCount.toLocaleString()} Total Closed Orders) * 100`,
          value: calcFollowupCloseRate,
          unit: '%',
          healthy_range: 'من 15% لـ 20%+',
          red_flag_threshold: 'أقل من 10%',
          status: calcFollowupCloseRate >= 15 ? 'HEALTHY' : calcFollowupCloseRate < 10 ? 'RED_FLAG' : 'WARNING'
        },
        {
          id: 'kpi_cpa_closed',
          name: 'Cost Per Closed Order (True CPA)',
          description: `تكلفة الأوردر الحقيقية: ${metaTotalSpend.toLocaleString()} ج.م Meta Total Spend ÷ ${closedOrdersCount.toLocaleString()} Closed Orders`,
          value: calcTrueCpa,
          unit: 'ج.م',
          healthy_range: 'أقل من الـ Break-even CPA',
          red_flag_threshold: 'أعلى من سعر التكلفة المسموح به',
          status: calcTrueCpa <= 350 ? 'HEALTHY' : 'WARNING'
        }
      ],
      chat_leaks: [
        {
          id: 'leak_click_to_chat',
          leak_name: 'Click-to-Chat Leak',
          leak_name_ar: 'تسريب بين كليك الإعلان وفتح الواتساب (Click-to-Chat Leak)',
          cause: 'العميل بيدوس على الإعلان بس مش بيبعت رسالة الـ Start.',
          condition: `Click-to-Chat Rate = ${calcClickToChatRate}% (< 60%)`,
          is_triggered: leakClickToChatTriggered,
          diagnosis: leakClickToChatTriggered
            ? 'تسريب بين كليك الإعلان وفتح الواتساب (Click-to-Chat Leak).'
            : 'معدل وصول الشات ممتاز ولا يوجد تسريب تقني بين الضغطة والرسالة.',
          sales_action: 'الحفاظ على نموذج الرسالة التلقائية البسيطة بنقرة واحدة.',
          media_buyer_action: 'تبسيط الرسالة التلقائية (Pre-filled message) في ميتا.'
        },
        {
          id: 'leak_speed',
          leak_name: 'Speed Leak',
          leak_name_ar: 'بطء رد السيلز بيطير العملاء (Response Speed Leak)',
          cause: 'العميل بيبعت والرد بياخد وقت طويل.',
          condition: `Average FRT = ${calcFrt} دقيقة (> 10 دقائق)`,
          is_triggered: leakSpeedTriggered,
          diagnosis: leakSpeedTriggered
            ? 'بطء رد السيلز بيطير العملاء (Response Speed Leak).'
            : 'سرعة رد السيلز ممتازة وتضمن الحفاظ على رغبة الشراء لدى العميل.',
          sales_action: 'إعادة توزيع شفتات السيلز أو تشغيل أوتوميشن ترحيبي سريعة.',
          media_buyer_action: 'تعديل جدول أوقات عرض الإعلان (Ad Scheduling) ليطابق شفتات السيلز.'
        },
        {
          id: 'leak_lead_quality',
          leak_name: 'Lead Quality Leak',
          leak_name_ar: 'الجمهور غير مناسب والرسائل فضولية (Low Quality Leads)',
          cause: 'الرسائل كتير بس العميل بيكتب "بكام" ويختفي أول ما يعرف السعر.',
          condition: `Qualified Lead Rate = ${calcQualifiedRate}% (< 40%)`,
          is_triggered: leakLeadQualityTriggered,
          diagnosis: leakLeadQualityTriggered
            ? 'الجمهور غير مناسب والرسائل فضولية (Low Quality Leads).'
            : 'جودة الليدات جيدة جداً، الجمهور يستهدف الشراء ومناسب للمنتج.',
          sales_action: 'استغلال اهتمام الجمهور المستهدف للتعمق في الفوائد.',
          media_buyer_action: 'تصفية الجمهور في ميتا بتوضيح السعر أو الفئة داخل الإعلان.'
        },
        {
          id: 'leak_price_shock',
          leak_name: 'Price Shock / Script Leak',
          leak_name_ar: 'صدمة السعر في الشات أو ضعف سكريبت البيع (Price Shock / Script Leak)',
          cause: 'العميل مهتم وجاد، بس السيلز بيرمي السعر في أول المحادثة قبل ما يوضح قيمة المنتج.',
          condition: `Qualified Lead Rate (${calcQualifiedRate}% > 50%) & Chat CVR (${calcChatCvr}% < 10%)`,
          is_triggered: leakPriceShockTriggered,
          diagnosis: leakPriceShockTriggered
            ? 'صدمة السعر في الشات أو ضعف سكريبت البيع (Price Shock / Script Leak).'
            : 'طريقة تقديم السعر وبناء القيمة داخل الشات متزنة ولا تسبب صدمة للعميل.',
          sales_action: 'عدم تعديل الإعلان، وتعديل سكريبت الشات لإظهار قيمة المنتج قبل السعر.',
          media_buyer_action: 'تزويد فريق السيلز بمواد بصرية جديدة وفيديوهات معاينة لاستخدامها في إقناع الشات.'
        },
        {
          id: 'leak_no_followup',
          leak_name: 'No Follow-up Leak',
          leak_name_ar: 'إهمال العملاء المترددين (No Follow-up Leak)',
          cause: 'العميل قال "هفكر وأرد عليك" والسيلز نسي الموضوع.',
          condition: `Follow-up Close Rate = ${calcFollowupCloseRate}% (< 10%)`,
          is_triggered: leakNoFollowupTriggered,
          diagnosis: leakNoFollowupTriggered
            ? 'إهمال العملاء المترددين (No Follow-up Leak).'
            : 'سيستم المتابعة يعمل بفاعلية ويسترد المبيعات من العملاء المترددين.',
          sales_action: 'تفعيل رسائل المتابعة الإجبارية بعد 24 و 48 ساعة.',
          media_buyer_action: 'إنشاء حملات إعادة استهداف (Retargeting) مخصصة للعملاء الذين تواصلوا في الشات ولم يشتروا.'
        }
      ],
      chat_micro_funnel: {
        total_incoming_messages: actualReceivedChats,
        greeting_responded_customers: Math.round(actualReceivedChats * 0.772),
        greeting_engagement_rate: 77.2,
        interactive_customers: Math.round(actualReceivedChats * 0.772),
        price_inquiry_customers: Math.round(actualReceivedChats * 0.772 * 0.773),
        price_inquiry_rate: 77.3,
        serious_qualified_customers: Math.round(actualReceivedChats * 0.772 * 0.773 * 0.85),
        offer_reached_customers: Math.round(actualReceivedChats * 0.772 * 0.773 * 0.85 * 0.667),
        offer_dropped_rate: 66.7,
        shipping_info_provided_customers: Math.round(actualReceivedChats * 0.772 * 0.773 * 0.85 * 0.667 * 0.46),
        closed_orders: closedOrdersCount,
        checkout_intent_rate: 69.0,
        checkout_intent_drop: 31.0
      },
      time_decay_sla: {
        total_chats: actualReceivedChats,
        delayed_chats_over_15m: Math.round(actualReceivedChats * 0.24),
        sla_breach_rate: 24.0,
        avg_frt_minutes: avgFrtMinutes,
        decay_category: '50%_DECAY',
        potential_conversion_percentage: 50.0,
        dead_leads_count: Math.round(actualReceivedChats * 0.14)
      },
      sales_rep_variance: {
        reps: [
          { rep_id: 'REP-01', rep_name: 'أحمد مصطفى (Top Rep)', assigned_leads: 600, closed_orders: 132, cvr_percentage: 22.0, avg_frt_minutes: 2.8, status: 'TOP' },
          { rep_id: 'REP-02', rep_name: 'محمود طارق (Needs Training)', assigned_leads: 580, closed_orders: 23, cvr_percentage: 3.9, avg_frt_minutes: 22.4, status: 'NEEDS_TRAINING' },
          { rep_id: 'REP-03', rep_name: 'سارة علي (Avg Rep)', assigned_leads: 530, closed_orders: 68, cvr_percentage: 12.8, avg_frt_minutes: 8.1, status: 'AVERAGE' }
        ],
        top_rep_cvr: 22.0,
        lowest_rep_cvr: 3.9,
        rep_deviation: 18.1,
        is_high_variance: true,
        verdict: 'انحراف ضخم في أداء السيلز (18.1% > 15%). المشكلة ليست في الحملة أو الجمهور، بل في تفاوت تنفيذ سيلز محدد (محمود طارق: 3.9% CVR مقترن ببطء رد 22.4 دقيقة).'
      },
      objection_breakdown: [
        {
          objection_type: 'Price Objection',
          label_ar: 'اعتراض على السعر (Price Objection)',
          percentage: 52.0,
          threshold_percentage: 45.0,
          exceeded_threshold: true,
          diagnosis: 'صدمة سعر / استهداف فئة غير مناسبة أو إرسال الرقم قبل بناء القيمة.',
          executive_action: 'تعديل سكريبت الرد لتأخير إظهار السعر للرسالة الثالثة مع إبراز الفائدة الفورية.'
        },
        {
          objection_type: 'Shipping & Delivery',
          label_ar: 'مصاريف ومواعيد الشحن (Shipping & Delivery)',
          percentage: 28.0,
          threshold_percentage: 25.0,
          exceeded_threshold: true,
          diagnosis: 'مشكلة في تكلفة أو بطء وقت الشحن لدى العميل.',
          executive_action: 'إضافة عرض "شحن مجاني أو مخفض" عند الوصول لطلاَب أوردر محدد.'
        },
        {
          objection_type: 'Trust / Product Proof',
          label_ar: 'الخوف من الجودة والنصب (Trust / Product Proof)',
          percentage: 12.0,
          threshold_percentage: 20.0,
          exceeded_threshold: false,
          diagnosis: 'معدل طبيعي للمخاوف الاعتيادية.',
          executive_action: 'إلزام السيلز بإرسال صور وفيديوهات حقيقية من المعاينات.'
        },
        {
          objection_type: 'Competitor Match',
          label_ar: 'مقارنة مع منافس (Competitor Match)',
          percentage: 8.0,
          threshold_percentage: 15.0,
          exceeded_threshold: false,
          diagnosis: 'معدل متزن مقارنة بالسوق.',
          executive_action: 'تزويد السيلز بشيت مقارنة سريع (Comparison Sheet) لمميزاتنا.'
        }
      ],
      vbp_score: {
        total_price_inquiries: totalPriceInquiries,
        vbp_passed_chats: vbpPassedChats,
        vbp_failed_chats: vbpFailedChats,
        vbp_score_percentage: vbpScorePct,
        benchmark_target: 80.0,
        status: vbpStatus,
        diagnostic_steps: {
          step_1_diagnostic_question: true,
          step_2_value_benefit_explained: true,
          step_3_price_as_solution: true
        },
        trigger_keywords: ['بكام؟', 'السعر كام؟', 'بكام الباكدج؟', 'سعر المجموعة؟', 'التكلفة كام'],
        failure_reason: 'قام السيلز بإرسال السعر مباشرة أو إرسال قائمة الأسعار في الرد الأول دون طرح أسئلة تشخيصية أو شرح فوائد الروتين.',
        pass_example: 'العميلة: "بكام الباكدج؟" ➔ السيلز: "أهلاً بحضرتك يا فندم! عشان أرشحلك الباكدج الأنسب ونحل المشكلة من جذورها، ممكن أعرف طبيعة شعرك وهل المشكلة هيجان وتساقط ولا جفاف؟" ➔ توضيح الفائدة ➔ إعلان السعر كجزء من روتين متكامل.',
        fail_example: 'العميلة: "بكام؟" ➔ السيلز: "أهلاً بحضرتك، الباكدج بـ 650 جنيه والشحن مجاني!" (فشل فوري: صدمة سعر بدون بناء قيمة).'
      },
      aov_audit: {
        aov_value: calculatedAov,
        total_revenue: totalSalesRevenue,
        closed_orders: closedOrdersCount,
        upsell_attempts_rate: upsellAttemptsRate,
        cross_sell_attempts_rate: crossSellAttemptsRate,
        single_product_orders_without_upsell: singleProductOrdersWithoutUpsell,
        single_product_no_upsell_flag: singleProductNoUpsellFlag,
        benchmark_aov: 650,
        status: singleProductNoUpsellFlag ? 'WARNING' : 'EXCELLENT',
        warning_flag_message: singleProductNoUpsellFlag
          ? `تنبيه سيستم (AOV Flag): تم تسجيل ${singleProductOrdersWithoutUpsell} أوردر لمنتج فردي تم إغلاقها بدون أي محاولة ترقية لباكدج (Upsell) أو اقتراح منتج مكمل (Cross-sell).`
          : 'أداء الترقية وزيادة قيمة الفاتورة يعمل بكفاءة ممتازة.',
        upsell_example: {
          single_item: 'شامبو فردي',
          single_price: 250,
          upsell_target: 'باكدج الروتين الكامل (شامبو + بلسم + ماسك)',
          bundle_price: 650
        },
        cross_sell_example: {
          base_item: 'باكدج معالجة الهيجان',
          complementary_item: 'سيروم حماية الحرارة المعالج أو حمام كريم عميق',
          benefit: 'مضاعفة نتيجة الروتين وتثبيت الترطيب لفترة أطول'
        }
      },
      master_rules: [
        {
          rule_id: 'RULE_1_SLA',
          rule_name: 'خرق SLA الزمني (SLA Breach > 20%)',
          condition_text: 'SLA Breach Rate = 24.0% (> 20%)',
          condition_met: true,
          leak_label: 'Operational Delay Leak (تسريب بطء الاستجابة والخرق الزمني)',
          action_plan: 'إيقاف صرف الإعلانات في الساعات التي يزيد فيها الـ SLA Breach، أو إعادة توزيع الشفتات فوراً.'
        },
        {
          rule_id: 'RULE_2_REP_VARIANCE',
          rule_name: 'تشتت أداء فريق المبيعات (Rep Deviation > 15%)',
          condition_text: 'Rep Deviation = 18.1% (> 15%)',
          condition_met: true,
          leak_label: 'Sales Team Execution Variance (تشتت أداء فريق المبيعات)',
          action_plan: 'عدم تغيير إعلانات ميتا. تحويل 70% من الليدات للسيلز الأعلى أداءً (أحمد مصطفى)، وإعادة تدريب السيلز الضعيف.'
        },
        {
          rule_id: 'RULE_3_PRICE_VALUE',
          rule_name: 'فجوة السعر والقيمة (Price Objection > 50% & Qualified > 60%)',
          condition_text: 'Price Objection = 52.0% (> 50%) & Qualified Lead Rate = 65.7% (> 60%)',
          condition_met: true,
          leak_label: 'Value-to-Price Messaging Gap (فجوة القيمة مقابل السعر)',
          action_plan: 'السيلز يفشل في بناء القيمة قبل رمي الرقم. تعديل الهيكل العريض لسكريبت الرد لتأخير السعر للرسالة الثالثة.'
        },
        {
          rule_id: 'RULE_4_CLOSING_FRICTION',
          rule_name: 'عقبات إغلاق الأوردر (Checkout Intent Drop > 30%)',
          condition_text: 'Checkout Intent Drop = 31.0% (> 30%)',
          condition_met: true,
          leak_label: 'Friction at Closing Step (عقبات وتشتيت في خطوة إغلاق الأوردر)',
          action_plan: 'معالجة طريقة طلب بيانات الشحن (تقليل الأسئلة المطلوبة وتبسيط فورمة الشحن).'
        },
        {
          rule_id: 'RULE_5_VBP_COMPLIANCE',
          rule_name: 'مخالفة بروتوكول القيمة قبل السعر (VBP Score < 80%)',
          condition_text: `VBP Score = ${vbpScorePct}% (< 80% Benchmark)`,
          condition_met: vbpScorePct < 80,
          leak_label: 'Premature Price Quoting (إلقاء السعر المبكر دون تشخيص أو بناء قيمة)',
          action_plan: 'إلزام فريق السيلز بتطبيق قاعدة الـ 3 خطوات (سؤال تشخيصي ➔ شرح الفائدة المباشرة ➔ تقديم السعر كجزء من الحل الكامل).'
        },
        {
          rule_id: 'RULE_6_AOV_UPSELL_FLAG',
          rule_name: 'تنبيه إغلاق منتج فردي دون ترقية (Single Item Order Flag)',
          condition_text: `Single Item Closed Without Upsell = ${singleProductOrdersWithoutUpsell} أوردر`,
          condition_met: singleProductNoUpsellFlag,
          leak_label: 'Lost Revenue / Low AOV Leak (تسريب إيراد الفاتورة وإغلاق منتجات فردية)',
          action_plan: 'منع قبول إغلاق أي أوردر لمنتج فردي (250 ج.م) دون عرض باكدج الترقية (650 ج.م) أو اقتراح منتج مكمل (سيروم / ماسك).'
        }
      ],
      sales_team_tasks: [
        'تعديل سكريبت البيع فوراً: ممنوع رمي السعر في أول رسالة وإلزام السيلز ببناء القيمة أولاً.',
        'تفعيل سيستم المتابعة (Follow-up) بعد 24 ساعة وبعد 48 ساعة لاسترداد 15-20% من المبيعات المفقودة.',
        'تحويل 70% من المحادثات الجديدة فوراً إلى أحمد مصطفى (Top Rep)، وإعادة تدريب محمود طارق.',
        'إلزام السيلز بالرد خلال أقل من 10 دقائق لتجنب تآكل التحويل الزمني (Conversion Decay).'
      ],
      media_buyer_tasks: [
        'ضبط مواعيد تشغيل الإعلانات (Ad Scheduling) لتتوافق بدقة مع شفتات تفرغ السيلز.',
        'إنشاء حملة إعادة استهداف (Retargeting) مخصصة للعملاء الذين تواصلوا في الشات ولم يكملوا الطلب.',
        'تزويد السيلز بمواد بصرية وفيديوهات معاينة حقيقية لإرسالها أثناء الشات لزيادة الثقة.'
      ],
      summary_diagnosis: 'تسريب المبيعات ينحصر في عاملين رئيسيين: أ) تشتت تنفيذ السيلز (محمود طارق يحول 3.9% فقط بمتوسط رد 22.4 دقيقة مقابل أحمد مصطفى 22.0%)، ب) صدمة السعر المبكر (Price Objection 52%). الإعلانات تعمل بنجاح والحل إداري وتنفيذي داخل الشات.',
      action_plan_24h: '1) نقل 70% من الليدات فوراً لـ أحمد مصطفى. 2) تعديل سكريبت الرد لتأخير السعر للرسالة الثالثة. 3) معالجة بطء الشفتات للحد من الخرق الزمني SLA Breach < 15%.'
    },
    action_queue: actionQueue,
    raw_calculated_metrics: {
      platform_purchases: totalReportedOrders,
      platform_purchase_cvr: `${platformPurchaseCvr}%`,
      sales_confirmed_purchases: confirmedOrders,
      sales_purchase_cvr: `${salesPurchaseCvr}%`,
      hook_rate: `${hookRate.toFixed(1)}%`,
      hold_rate: `${holdRate.toFixed(1)}%`,
      confirmation_rate: `${confirmationRate.toFixed(1)}%`,
      fake_rate: `${fakeRate.toFixed(1)}%`,
      blended_ctr: `${blendedCtr.toFixed(2)}%`,
      outbound_ctr: `${outboundCtr.toFixed(2)}%`,
      blended_cpm: `${blendedCpm.toFixed(2)} ج.م`,
      frequency: `${frequency.toFixed(1)}`,
      cost_per_message: `${costPerMessage.toFixed(2)} ج.م`,
      min_campaign_age_hours: `${minCampaignAgeHours}h`,
      max_budget_scaled_24h: `${maxBudgetScaled24h}%`
    }
  };
}

export const PRESET_PAYLOADS: { label: string; description: string; payload: AuditPayload }[] = [
  {
    label: 'متجر مصر COD - تسريب التأكيدات (الافتراضي)',
    description: 'صرف إعلاني مرتفع على ميتا، لكن نسبة تأكيدات الكول سنتر انخفضت إلى 52%.',
    payload: {
      store_name: 'متجر القليوبية والقاهرة للتجارة',
      currency: 'EGP',
      timeframe: 'آخر 7 أيام',
      ad_platforms: [
        {
          platform: 'Meta',
          channel: 'WhatsApp',
          impressions: 450000,
          three_sec_views: 125000,
          seventy_five_percent_views: 22000,
          clicks: 9500,
          outbound_clicks: 7110,
          outbound_ctr: 1.58,
          cost_per_outbound_click: 6.82,
          messaging_conversations_started: 1710,
          new_messaging_contacts: 1280,
          returning_messaging_contacts: 430,
          spend: 48500,
          reported_orders: 145,
          reported_revenue: 172500,
          campaign_age_hours: 120,
          budget_scaled_24h_pct: 10,
          ad_sets: [
            {
              id: 'adset_1',
              name: 'AdSet 01 - Broad Cairo & Giza (استهداف موسع)',
              targeting_type: 'Broad',
              budget: 25000,
              spend: 24200,
              impressions: 230000,
              reach: 125000,
              cpm: 105.2,
              frequency: 1.84,
              outbound_clicks: 3820,
              outbound_ctr: 1.66,
              cost_per_outbound_click: 6.33,
              messaging_conversations_started: 940,
              new_messaging_contacts: 720,
              returning_messaging_contacts: 220,
              click_to_message_rate: 24.6,
              cost_per_message: 25.74,
              cost_per_new_contact: 33.61,
              status_light: 'GREEN_SCALE',
              leak_reason: 'أداء مستقر - معدل رسائل ممتازة على نطاق واسع',
              creatives: [
                {
                  id: 'c1',
                  name: 'Creative 01 - د. نورهان استشاري الجلدية (Doctor Endorsement)',
                  format: 'Video',
                  angle_category: 'DOCTOR_RECOMMENDATION',
                  angle_label_ar: 'ترشيح دكاترة ومتخصصين',
                  hook_type_ar: 'سؤال علمي صريح من طبيبة',
                  spend: 14200,
                  impressions: 135000,
                  three_sec_views: 39100,
                  seventy_five_percent_views: 7200,
                  outbound_clicks: 2310,
                  outbound_ctr: 1.71,
                  cost_per_outbound_click: 6.14,
                  messaging_conversations_started: 580,
                  new_messaging_contacts: 450,
                  returning_messaging_contacts: 130,
                  click_to_message_rate: 25.1,
                  cpm: 105.1,
                  frequency: 1.82,
                  hook_rate: 28.9,
                  hold_rate: 18.4,
                  attributed_orders: 87, // 15.0% CVR
                  conversion_rate: 15.0,
                  blended_cpa: 163,
                  status_light: 'GREEN_SCALE',
                  leak_reason: 'الزاوية الرابحة 🔥 - أعلى معدل إغلاق وأقل تكلفة أوردر حقيقي'
                },
                {
                  id: 'c2',
                  name: 'Creative 02 - روتين القضاء على حب الشباب في 14 يوم (Problem-Solving)',
                  format: 'Video',
                  angle_category: 'PROBLEM_SOLVING',
                  angle_label_ar: 'حل مشكلة حب الشباب',
                  hook_type_ar: 'صدمة بصرية فورية لأثر الحبوب',
                  spend: 10000,
                  impressions: 95000,
                  three_sec_views: 24200,
                  seventy_five_percent_views: 3800,
                  outbound_clicks: 1510,
                  outbound_ctr: 1.58,
                  cost_per_outbound_click: 6.62,
                  messaging_conversations_started: 360,
                  new_messaging_contacts: 270,
                  returning_messaging_contacts: 90,
                  click_to_message_rate: 23.8,
                  cpm: 105.2,
                  frequency: 1.86,
                  hook_rate: 25.4,
                  hold_rate: 15.7,
                  attributed_orders: 43, // 11.9% CVR
                  conversion_rate: 11.9,
                  blended_cpa: 232,
                  status_light: 'GREEN_SCALE',
                  leak_reason: 'زاوية ألم قوية - استجابة عالية في الشات'
                }
              ]
            },
            {
              id: 'adset_2',
              name: 'AdSet 02 - Lookalike 1% Engagers (جمهور مشابه)',
              targeting_type: 'Lookalike',
              budget: 15000,
              spend: 16800,
              impressions: 140000,
              reach: 38000,
              cpm: 120.0,
              frequency: 3.68,
              outbound_clicks: 2100,
              outbound_ctr: 1.50,
              cost_per_outbound_click: 8.00,
              messaging_conversations_started: 510,
              new_messaging_contacts: 380,
              returning_messaging_contacts: 130,
              click_to_message_rate: 24.2,
              cost_per_message: 32.94,
              cost_per_new_contact: 44.21,
              status_light: 'YELLOW_FIX',
              leak_reason: 'تكرار عالي (Frequency 3.68) - بدايات إجهاد الجمهور الضيق',
              creatives: [
                {
                  id: 'c3',
                  name: 'Creative 03 - ريفيو وتجربة سلمى للباكدج (UGC Review)',
                  format: 'Video',
                  angle_category: 'UGC_CUSTOMER_REVIEW',
                  angle_label_ar: 'تجارب عملاء حقيقيين UGC',
                  hook_type_ar: 'تفاعل عفوي وفتح العبوة Unboxing',
                  spend: 16800,
                  impressions: 140000,
                  three_sec_views: 38000,
                  seventy_five_percent_views: 6500,
                  outbound_clicks: 2100,
                  outbound_ctr: 1.50,
                  cost_per_outbound_click: 8.00,
                  messaging_conversations_started: 510,
                  new_messaging_contacts: 380,
                  returning_messaging_contacts: 130,
                  click_to_message_rate: 24.2,
                  cpm: 120.0,
                  frequency: 3.68,
                  hook_rate: 27.1,
                  hold_rate: 17.1,
                  attributed_orders: 51, // 10.0% CVR
                  conversion_rate: 10.0,
                  blended_cpa: 329,
                  status_light: 'YELLOW_FIX',
                  leak_reason: 'Creative Fatigue - تكرار العرض على نفس الأفراد'
                }
              ]
            },
            {
              id: 'adset_3',
              name: 'AdSet 03 - Retargeting 30D (إعادة استهداف)',
              targeting_type: 'Retargeting',
              budget: 8000,
              spend: 7500,
              impressions: 80000,
              reach: 22000,
              cpm: 93.75,
              frequency: 3.63,
              outbound_clicks: 1190,
              outbound_ctr: 1.48,
              cost_per_outbound_click: 6.30,
              messaging_conversations_started: 260,
              new_messaging_contacts: 180,
              returning_messaging_contacts: 80,
              click_to_message_rate: 21.8,
              cost_per_message: 28.84,
              cost_per_new_contact: 41.66,
              status_light: 'YELLOW_FIX',
              leak_reason: 'تسريب في مرحلة الجسر بين الضغطة وفتح الشات (Bridge Leak)',
              creatives: [
                {
                  id: 'c4',
                  name: 'Creative 04 - عرض خصم 40% لفترة محدودة (Offers & Deals)',
                  format: 'Image',
                  angle_category: 'OFFERS_DISCOUNTS',
                  angle_label_ar: 'عروض وتخفيضات وباكدجات',
                  hook_type_ar: 'بانر عروض وخصومات مباشرة',
                  spend: 7500,
                  impressions: 80000,
                  three_sec_views: 23700,
                  seventy_five_percent_views: 4500,
                  outbound_clicks: 1190,
                  outbound_ctr: 1.48,
                  cost_per_outbound_click: 6.30,
                  messaging_conversations_started: 260,
                  new_messaging_contacts: 180,
                  returning_messaging_contacts: 80,
                  click_to_message_rate: 21.8,
                  cpm: 93.75,
                  frequency: 3.63,
                  hook_rate: 29.6,
                  hold_rate: 18.9,
                  attributed_orders: 18, // 6.9% CVR
                  conversion_rate: 6.9,
                  blended_cpa: 416,
                  status_light: 'YELLOW_FIX',
                  leak_reason: 'صدمة السعر وجذب صيادي العروض غير الجادين'
                }
              ]
            }
          ]
        }
      ],
      backend_sheet: {
        raw_orders: 233,
        confirmed_orders: 121,
        cancelled_fake_orders: 58,
        delivered_orders: 98,
        cogs_per_order: 350,
        average_order_value: 1200,
        shipping_cost_per_order: 80,
        cod_fee_per_order: 25,
        confirmation_fee_per_order: 15
      }
    }
  },
  {
    label: 'مبالغة إعلانات ميتا وتراجع هامش الربح',
    description: 'المنصة تسجل ROAS 3.8x ولكن الإلغاءات المرتفعة تسبب خسارة مالية حقيقية.',
    payload: {
      store_name: 'متجر الساعات والساعات الذكية',
      currency: 'EGP',
      timeframe: 'اليوم',
      ad_platforms: [
        {
          platform: 'Meta',
          impressions: 210000,
          three_sec_views: 62000,
          seventy_five_percent_views: 12000,
          clicks: 4800,
          spend: 28000,
          reported_orders: 85,
          reported_revenue: 168000,
          campaign_age_hours: 72,
          budget_scaled_24h_pct: 25
        }
      ],
      backend_sheet: {
        raw_orders: 85,
        confirmed_orders: 38,
        cancelled_fake_orders: 32,
        delivered_orders: 30,
        cogs_per_order: 650,
        average_order_value: 1800,
        shipping_cost_per_order: 90,
        cod_fee_per_order: 30,
        confirmation_fee_per_order: 20
      }
    }
  },
  {
    label: 'حملة جديدة لم تتجاوز الـ 48 ساعة (حاجز أمان أحمر)',
    description: 'تم إطلاق الإعلان منذ 18 ساعة فقط؛ النظام يفرض حالة عدم التعديل.',
    payload: {
      store_name: 'متجر الإلكترونيات والملحقات',
      currency: 'EGP',
      timeframe: 'آخر 24 ساعة',
      ad_platforms: [
        {
          platform: 'Meta',
          impressions: 80000,
          three_sec_views: 22000,
          seventy_five_percent_views: 4000,
          clicks: 1400,
          spend: 8500,
          reported_orders: 12,
          reported_revenue: 18000,
          campaign_age_hours: 18, // <48h trigger
          budget_scaled_24h_pct: 0
        }
      ],
      backend_sheet: {
        raw_orders: 12,
        confirmed_orders: 9,
        cancelled_fake_orders: 2,
        delivered_orders: 7,
        cogs_per_order: 450,
        average_order_value: 1500,
        shipping_cost_per_order: 75,
        cod_fee_per_order: 25,
        confirmation_fee_per_order: 15
      }
    }
  },
  {
    label: 'حملة رابحة ومستقرة - إشارة خضراء (GREEN MOVE)',
    description: 'تأكيدات مرتفعة، هامش ربح ممتاز، أداء بصري واحتفاظ عالي بالفيديو.',
    payload: {
      store_name: 'متجر الملابس والأحذية الرياضية',
      currency: 'EGP',
      timeframe: 'آخر 14 يوم',
      ad_platforms: [
        {
          platform: 'Meta',
          impressions: 600000,
          three_sec_views: 180000,
          seventy_five_percent_views: 36000,
          clicks: 14000,
          spend: 55000,
          reported_orders: 180,
          reported_revenue: 360000,
          campaign_age_hours: 168,
          budget_scaled_24h_pct: 12
        }
      ],
      backend_sheet: {
        raw_orders: 245,
        confirmed_orders: 215,
        cancelled_fake_orders: 12,
        delivered_orders: 195,
        cogs_per_order: 550,
        average_order_value: 2000,
        shipping_cost_per_order: 85,
        cod_fee_per_order: 30,
        confirmation_fee_per_order: 15
      }
    }
  }
];
