import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';
import { run5LayerAudit, PRESET_PAYLOADS } from './src/lib/auditEngine.js';
import { AuditPayload, AuditResult } from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to instantiate Gemini AI client lazily
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/preset-payloads
app.get('/api/presets', (req, res) => {
  res.json({ presets: PRESET_PAYLOADS });
});

// MODE 1: Automated Live Audit Endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const payload: AuditPayload = req.body || PRESET_PAYLOADS[0].payload;
    const baseResult = run5LayerAudit(payload);

    const ai = getGenAIClient();
    if (!ai) {
      // Return exact Mode 1 structured output from local 5-Layer Engine
      return res.json(baseResult);
    }

    // Enhance diagnosis with Gemini 3.6 Flash while maintaining rigid JSON structure
    const promptText = `
You are PrePilot Live Copilot, an elite AI Performance Marketing Operating System.
Analyse this 5-Layer Performance Audit input and calculated metrics:

INPUT PAYLOAD:
${JSON.stringify(payload, null, 2)}

CALCULATED BASE AUDIT:
${JSON.stringify(baseResult, null, 2)}

Refine the diagnosis_summary and action_queue items based on performance marketing realities (e.g. COD, confirmation rates, fake leads, true contribution margin, hook/hold rates, platform overclaiming).
Return ONLY a valid JSON object matching this exact schema:
{
  "system_status": "${baseResult.system_status}",
  "status_reason": "${baseResult.status_reason}",
  "health_scores": ${JSON.stringify(baseResult.health_scores)},
  "financial_economics": ${JSON.stringify(baseResult.financial_economics)},
  "diagnosis_summary": "Concise executive breakdown of performance and primary leak",
  "funnel_leak_location": "${baseResult.funnel_leak_location}",
  "action_queue": [
    {
      "action": "Specific task to execute immediately",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "Creative" | "CRO" | "Budget" | "Backend"
    }
  ]
}
`;

    try {
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              system_status: { type: Type.STRING },
              status_reason: { type: Type.STRING },
              health_scores: {
                type: Type.OBJECT,
                properties: {
                  signal_integrity: { type: Type.NUMBER },
                  creative_diagnosis: { type: Type.NUMBER },
                  cro_audit: { type: Type.NUMBER },
                  scaling_guardrails: { type: Type.NUMBER },
                },
                required: ['signal_integrity', 'creative_diagnosis', 'cro_audit', 'scaling_guardrails'],
              },
              financial_economics: {
                type: Type.OBJECT,
                properties: {
                  true_cpa: { type: Type.NUMBER },
                  contribution_margin: { type: Type.NUMBER },
                  overclaim_percentage: { type: Type.NUMBER },
                  funnel_leak_percentage: { type: Type.NUMBER },
                },
                required: ['true_cpa', 'contribution_margin', 'overclaim_percentage', 'funnel_leak_percentage'],
              },
              diagnosis_summary: { type: Type.STRING },
              funnel_leak_location: { type: Type.STRING },
              action_queue: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    action: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ['action', 'priority', 'category'],
                },
              },
            },
            required: [
              'system_status',
              'status_reason',
              'health_scores',
              'financial_economics',
              'diagnosis_summary',
              'funnel_leak_location',
              'action_queue',
            ],
          },
        },
      });

      if (geminiResponse.text) {
        const parsed = JSON.parse(geminiResponse.text.trim());
        return res.json({
          ...baseResult,
          ...parsed,
          financial_economics: {
            ...baseResult.financial_economics,
            ...parsed.financial_economics,
          },
        });
      }
    } catch (aiErr) {
      console.warn('Gemini AI refinement skipped or error:', aiErr);
    }

    return res.json(baseResult);
  } catch (err: any) {
    console.error('Audit Endpoint Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process audit' });
  }
});

// MODE 2: Interactive Chat Copilot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], payload = PRESET_PAYLOADS[0].payload, auditResult = null, language = 'ar-EG' } = req.body;

    const baseAudit = auditResult || run5LayerAudit(payload);

    const systemInstruction = `
You are "PrePilot Live Copilot", an elite AI-powered Performance Marketing Operating System and real-time Pre-Click Specialist diagnostic engine for media buyers and e-commerce operators.

LAYER 1: PRE-CLICK SPECIALIST (META MESSAGING ADS - MESSENGER / WHATSAPP / INSTAGRAM):
System Role: Receive Meta dashboard metrics, analyze relationships between metrics (Hook Rate, Hold Rate, Outbound CTR, CPM, Frequency, Messaging Conversations Started, Cost Per Message), identify Pre-Click leaks before chat, and give a clear 24-hour executive action decision.

LAYER 1 DIAGNOSTIC DECISION TREE RULES:
1. Hook Leak: If Hook Rate (3s Plays / Impressions) < 15% -> Diagnosis: "الإعلان مش بيلفت الانتباه وأول 3 ثواني ضعيفة." Decision: Change first 3 seconds (Hook) or intro without changing body.
2. Hold Leak: If Hook Rate >= 20% BUT Hold Rate (75% Plays / 3s Plays) < 5% -> Diagnosis: "البداية جذبت الناس، بس الفيديو ممل أو طويل والناس بتخلع قبل ما تفهم العرض." Decision: Shorten video, speed up pacing, rewrite offer script.
3. Offer & CTA Leak: If Hold Rate >= 8% BUT Outbound CTR < 1.2% -> Diagnosis: "الناس بتشوف الإعلان للآخر، بس محدش عنده رغبة يدوس على زرار الرسالة." Decision: Offer isn't attractive or CTA is unclear. Update offer/package/CTA.
4. Creative Fatigue: If Frequency >= 3.5 + CPM rises >= 25% + Outbound CTR drops -> Diagnosis: "الجمهور شاف الإعلان كتير وزهق منه والمنصة رفعت التكلفة." Decision: Full Creative Refresh & launch new angles.
5. Auction Pressure / Narrow Audience: High CPM (> 35) + Frequency rising fast with small budget -> Diagnosis: "الاستهداف ضيق جداً أو منافسة شرسة في المزاد." Decision: Broaden audience to Broad or expand angle.

CRITICAL FINANCIAL & SALES RULE:
- NEVER rely on Meta Purchases / reported conversions as actual ground-truth sales because Meta pixel reporting is delayed, inaccurate, or overclaiming.
- ALWAYS use Confirmed Backend Sheet Orders (أوردرات الشيت المؤكدة الفعلية) as the sole source of truth for sales, gross revenue, True CPA, and Contribution Margin.
- Compare Meta's reported numbers against backend sheet sales only to measure Platform Overclaiming (مبالغة مدير الإعلانات).

FULL APPLICATION CONTEXT:
Store Name: ${payload.store_name || 'E-Commerce Store'}
Currency: ${payload.currency || 'EGP'}
Timeframe: ${payload.timeframe || 'Active Period'}

BACKEND SHEET GROUND TRUTH SALES:
- Raw Orders (إجمالي الطلبات المستلمة): ${payload.backend_sheet?.raw_orders || 0}
- Confirmed Orders (الأوردرات المؤكدة الفعلية): ${payload.backend_sheet?.confirmed_orders || 0}
- Cancelled/Fake Orders: ${payload.backend_sheet?.cancelled_fake_orders || 0}
- Delivered Orders: ${payload.backend_sheet?.delivered_orders || 0}
- Average Order Value (AOV): ${payload.backend_sheet?.average_order_value || 0}
- COGS Per Order: ${payload.backend_sheet?.cogs_per_order || 0}

AD PLATFORMS METRICS & MESSAGING DATA:
${(payload.ad_platforms || []).map(p => `- Platform: ${p.platform} (${p.channel || 'Messaging'}), Spend: ${p.spend}, Impressions: ${p.impressions}, Clicks: ${p.clicks}, 3s Views: ${p.three_sec_views}, 75% Views: ${p.seventy_five_percent_views}, Reported Orders: ${p.reported_orders}`).join('\n')}

LAYER 2: CHAT & SALES SPECIALIST (CRM, WHATSAPP & SALES TEAM):
- Chat Health Status: ${baseAudit.layer2_diagnostic?.decision_light}
- Received CRM Chats: ${payload.chat_data?.actual_received_chats || 1308}
- Average FRT: ${payload.chat_data?.average_frt_minutes || 18.5} minutes
- Qualified Leads: ${payload.chat_data?.qualified_leads_count || 860}
- Closed Orders: ${payload.chat_data?.closed_orders_count || 145}
- الرقم الأول (Qualified Rate %): ${(((payload.chat_data?.qualified_leads_count || 860) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}% [المصدر: Inbox/CRM Tags فرز Qualified مقابل Unqualified | المعادلة: (شاتات جادة ÷ إجمالي شاتات) * 100]
- الرقم الثاني (Chat CVR %): ${(((payload.chat_data?.closed_orders_count || 145) / Math.max(1, payload.chat_data?.actual_received_chats || 1308)) * 100).toFixed(1)}% [المصدر: شيت المبيعات أوردرات مقفولة ومؤكدة | المعادلة: (أوردرات مقفولة ÷ إجمالي شاتات) * 100]
- VBP Score (Value-Before-Price): ${baseAudit.layer2_diagnostic?.vbp_score?.vbp_score_percentage ?? 42}% (الهدف >= 80% | شاتات اجتازت: ${baseAudit.layer2_diagnostic?.vbp_score?.passed_chats_count ?? 424} من أصل ${baseAudit.layer2_diagnostic?.vbp_score?.total_price_inquiries ?? 1010} استفسار سعر. الفشل: إرسال السعر فوراً دون تشخيص المشكلة وشرح القيمة.)
- AOV & Upsell Audit: ${baseAudit.layer2_diagnostic?.aov_audit?.aov_value ?? 650} ج.م (تنبيه: ${baseAudit.layer2_diagnostic?.aov_audit?.single_product_orders_without_upsell ?? 48} أوردر لمنتج فردي أغلقت بدون محاولة ترقية لباكدج | معدل Upsell: ${baseAudit.layer2_diagnostic?.aov_audit?.upsell_attempts_rate ?? 35}% | معدل Cross-sell: ${baseAudit.layer2_diagnostic?.aov_audit?.cross_sell_attempts_rate ?? 28}%)
- Chat Micro-Funnel Rates: Greeting Engagement (${baseAudit.layer2_diagnostic?.chat_micro_funnel?.greeting_engagement_rate}%), Price Inquiry (${baseAudit.layer2_diagnostic?.chat_micro_funnel?.price_inquiry_rate}%), Offer Dropped (${baseAudit.layer2_diagnostic?.chat_micro_funnel?.offer_dropped_rate}%), Checkout Intent (${baseAudit.layer2_diagnostic?.chat_micro_funnel?.checkout_intent_rate}%)
- SLA Breach Rate: ${baseAudit.layer2_diagnostic?.time_decay_sla?.sla_breach_rate}% (Decay Category: ${baseAudit.layer2_diagnostic?.time_decay_sla?.decay_category}, Dead Leads: ${baseAudit.layer2_diagnostic?.time_decay_sla?.dead_leads_count})
- Sales Rep Variance: Deviation ${baseAudit.layer2_diagnostic?.sales_rep_variance?.rep_deviation}% (${baseAudit.layer2_diagnostic?.sales_rep_variance?.verdict})
- Top Objection: ${baseAudit.layer2_diagnostic?.objection_breakdown?.[0]?.label_ar} (${baseAudit.layer2_diagnostic?.objection_breakdown?.[0]?.percentage}%) - Action: ${baseAudit.layer2_diagnostic?.objection_breakdown?.[0]?.executive_action}

LAYER 1 PRE-CLICK DIAGNOSTIC RESULT:
- Layer 1 Decision Light: ${baseAudit.layer1_diagnostic?.decision_light}
- Layer 1 Leak Location: ${baseAudit.layer1_diagnostic?.leak_location}
- Layer 1 Hook Rate: ${baseAudit.layer1_diagnostic?.hook_rate}% | Hold Rate: ${baseAudit.layer1_diagnostic?.hold_rate}% | Outbound CTR: ${baseAudit.layer1_diagnostic?.outbound_ctr}%
- Layer 1 CPM: ${baseAudit.layer1_diagnostic?.cpm} EGP | Frequency: ${baseAudit.layer1_diagnostic?.frequency} | Cost/Message: ${baseAudit.layer1_diagnostic?.cost_per_message} EGP
- Layer 1 Pre-Click Red Flags: ${JSON.stringify(baseAudit.layer1_diagnostic?.red_flags || [])}

SYSTEM AUDIT RESULTS:
- System Status: ${baseAudit.system_status} (${baseAudit.status_reason})
- Funnel Leak Location: ${baseAudit.funnel_leak_location}
- True CPA (Based on Confirmed Sheet Sales): ${baseAudit.financial_economics?.true_cpa} EGP
- Net Contribution Margin: ${baseAudit.financial_economics?.contribution_margin} EGP
- Platform Overclaim %: ${baseAudit.financial_economics?.overclaim_percentage}%
- Executive Summary: ${baseAudit.diagnosis_summary}
- Action Queue: ${JSON.stringify(baseAudit.action_queue || [])}

LANGUAGE & VOICE REQUIREMENT:
When language is 'ar-EG' or user speaks in Arabic (via voice or text), respond in direct, authoritative, sharp Egyptian Arabic mixed with English performance marketing terms used by expert media buyers (e.g. True CPA, Contribution Margin, Hook Rate, Hold Rate, Outbound CTR, Overclaiming, Confirmation Rate, CBO/ABO, Meta Ads).

RESPONSE FORMAT:
1. Provide a direct 1-2 sentence diagnostic answer answering the user's specific voice/text question.
2. Outline a 3-step actionable protocol tailored to their numbers.
3. Keep it professional, data-backed, and focused on maximizing actual confirmed profit.
`;

    const ai = getGenAIClient();
    if (!ai) {
      // Fallback local response
      const fallbackMsg = language === 'ar-EG' 
        ? `بناءً على فحص شيت التأكيدات المباشر (مصدر الحقيقة الأساسي):\nالحالة العامة **${baseAudit.system_status}** لإن التسريب في **${baseAudit.funnel_leak_location.replace(/_/g, ' ')}** والـ True CPA المباشر من الشيت **${baseAudit.financial_economics?.true_cpa} ج.م**.\n\nلاحظ أننا استبعدنا الاعتماد على Purchase ميتا لتأخره، واعتمدنا على أوردرات الشيت المؤكدة (${payload.backend_sheet?.confirmed_orders || 0} أوردر).\n\n### خطة العمل العملية:\n1. **مراجعة وتأكيد أوردرات الشيت**: معالجة التأكيدات هاتفيارات والواتساب لرفع نسبة التأكيد.\n2. **تعديل مقاطع الفيديو الإعلانية**: استبدال أول 3 ثواني للإعلانات ذات الـ Hook القليل.\n3. **ضبط الميزانيات**: التوسع بحذر 20% فقط للحملات ذات هامش الربح الإيجابي.`
        : `Based on backend confirmed sheet sales (ground truth):\nSystem status is **${baseAudit.system_status}** due to bottleneck in **${baseAudit.funnel_leak_location}** with True CPA at **${baseAudit.financial_economics?.true_cpa} EGP**.\nNote: Meta Purchase is disregarded for sales metrics due to delayed reporting.\n\n### Action Protocol:\n1. **Optimize Sheet Confirmation Rate**: Fast call center response & WhatsApp automation.\n2. **Refresh Creative Intros**: Test new 3s video hooks for low-performing ads.\n3. **Scale Safely**: Cap budget scaling to +20% per 48h for profitable ads.`;

      return res.json({
        reply: fallbackMsg,
        status: baseAudit.system_status,
        funnel_leak: baseAudit.funnel_leak_location,
      });
    }

    const conversationPrompt = `
System Context: ${systemInstruction}

Recent Conversation History:
${history.map((h: any) => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')}

USER VOICE/TEXT QUESTION: ${message}

Provide a direct, authoritative, performance marketer copilot answer:
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: conversationPrompt,
      config: {
        temperature: 0.7,
      },
    });

    const reply = response.text || 'لم أتمكن من الحصول على الإجابة المناسبة حالياً.';

    return res.json({
      reply,
      status: baseAudit.system_status,
      funnel_leak: baseAudit.funnel_leak_location,
    });
  } catch (err: any) {
    console.error('Chat Copilot Error:', err);
    return res.status(500).json({ error: err.message || 'Chat service error' });
  }
});

// Vite Middleware for Dev & Static Fallback for Production
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDistIndex = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' || hasDistIndex) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PrePilot Live Copilot Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
