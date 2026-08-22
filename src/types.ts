export type SystemStatus = 'GREEN_MOVE' | 'YELLOW_WAIT' | 'RED_DONT_TOUCH';

export type FunnelLeakLocation = 
  | 'PRE_CLICK_HOOK_LEAK'
  | 'PRE_CLICK_HOLD_LEAK'
  | 'PRE_CLICK_OFFER_CTA_LEAK'
  | 'PRE_CLICK_BRIDGE_LEAK'
  | 'PRE_CLICK_CREATIVE_FATIGUE'
  | 'PRE_CLICK_AUCTION_NARROW_AUDIENCE'
  | 'PRE_CLICK_HOOK'
  | 'PRE_CLICK_BODY'
  | 'POST_CLICK_CONFIRMATION_LEAK'
  | 'ECONOMICS_HIGH_COGS'
  | 'ATTRIBUTION_MISMATCH'
  | 'CREATIVE_FATIGUE';

export type ActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ActionCategory = 'Creative' | 'CRO' | 'Budget' | 'Backend';

export interface ActionItem {
  id?: string;
  action: string;
  priority: ActionPriority;
  category: ActionCategory;
  completed?: boolean;
}

export type CreativeAngleCategory = 
  | 'DOCTOR_RECOMMENDATION' // ترشيح دكاترة ومتخصصين
  | 'PROBLEM_SOLVING'       // حل مشكلة حب الشباب / تساقط الشعر / التصبغات
  | 'BEFORE_AFTER'          // تجارب ونتائج قبل وبعد
  | 'UGC_CUSTOMER_REVIEW'   // تجارب عملاء حقيقيين UGC
  | 'OFFERS_DISCOUNTS'      // عروض وتخفيضات وباكدجات
  | 'FOUNDER_STORY'         // قصة البراند / خلف الكواليس
  | 'OTHER';

export interface CreativeBreakdown {
  id: string;
  name: string;
  format: 'Video' | 'Image' | 'Carousel';
  angle_category?: CreativeAngleCategory;
  angle_label_ar?: string;
  hook_type_ar?: string; // مثلاً: صدمة بصرية / سؤال مستفز / نتيجة مباشرة
  spend: number;
  impressions: number;
  reach?: number;
  three_sec_views: number;
  seventy_five_percent_views: number;
  outbound_clicks: number;
  outbound_ctr: number;
  cost_per_outbound_click: number;
  messaging_conversations_started: number;
  messaging_contacts?: number;
  new_messaging_contacts: number;
  returning_messaging_contacts: number;
  cost_per_messaging_conversation?: number;
  cost_per_result?: number;
  click_to_message_rate: number;
  cpm: number;
  frequency: number;
  hook_rate: number;
  hold_rate: number;
  // Attributed backend conversions for Creative Angle Analysis
  attributed_orders?: number;
  conversion_rate?: number; // CVR %
  blended_cpa?: number; // تكلفة الطلب الفعلي
  status_light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP';
  leak_reason?: string;
}

export interface CreativeAngleAnalysis {
  angle_category: CreativeAngleCategory;
  label_ar: string;
  icon_name?: string;
  total_spend: number;
  total_impressions: number;
  total_messages: number;
  total_orders: number;
  avg_hook_rate: number;
  avg_hold_rate: number;
  avg_outbound_ctr: number;
  cvr: number; // Conversion Rate (Orders / Messages)%
  blended_cpa: number; // Spend / Orders (ج.م)
  cost_per_message: number;
  is_winning_angle: boolean;
  angle_status: 'WINNING' | 'SCALABLE' | 'PROMISING' | 'DRAINING_BUDGET';
  content_team_directive: string; // توجيه مباشر لفريق المحتوى
  creatives_count: number;
}

export interface AdSetBreakdown {
  id: string;
  name: string;
  targeting_type: 'Broad' | 'Lookalike' | 'Interests' | 'Retargeting';
  budget: number;
  spend: number;
  impressions: number;
  reach: number;
  cpm: number;
  frequency: number;
  outbound_clicks: number;
  outbound_ctr: number;
  cost_per_outbound_click: number;
  messaging_conversations_started: number;
  messaging_contacts?: number;
  new_messaging_contacts: number;
  returning_messaging_contacts: number;
  click_to_message_rate: number;
  cost_per_message: number;
  cost_per_messaging_conversation?: number;
  cost_per_result?: number;
  cost_per_new_contact: number;
  status_light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP';
  leak_reason?: string;
  creatives?: CreativeBreakdown[];
}

export interface HealthScores {
  signal_integrity: number;
  creative_diagnosis: number;
  cro_audit: number;
  scaling_guardrails: number;
}

export interface FinancialEconomics {
  true_cpa: number;
  contribution_margin: number;
  overclaim_percentage: number;
  funnel_leak_percentage: number;
  gross_revenue?: number;
  net_margin_percentage?: number;
  breakeven_roas?: number;
}

export interface Layer1DiagnosticResult {
  decision_light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP';
  leak_location: string;
  leak_code: string;
  hook_rate: number;
  hold_rate: number;
  outbound_clicks: number;
  outbound_ctr: number;
  cost_per_outbound_click: number;
  click_to_message_rate: number;
  messaging_conversations_started: number;
  messaging_contacts?: number;
  new_messaging_contacts: number;
  returning_messaging_contacts: number;
  cost_per_messaging_conversation?: number;
  cost_per_result?: number;
  cost_per_new_contact: number;
  cpm: number;
  frequency: number;
  cost_per_message: number;
  diagnosis_details: string;
  action_plan_24h: string;
  red_flags: string[];
  creative_angles?: CreativeAngleAnalysis[];
  winning_angle?: CreativeAngleAnalysis;
}

export interface ChatMicroFunnel {
  total_incoming_messages: number;
  greeting_responded_customers: number;
  greeting_engagement_rate: number; // (greeting_responded_customers / total_incoming_messages) * 100
  interactive_customers: number;
  price_inquiry_customers: number;
  price_inquiry_rate: number; // (price_inquiry_customers / interactive_customers) * 100
  serious_qualified_customers: number;
  offer_reached_customers: number;
  offer_dropped_rate: number; // (offer_reached_customers / serious_qualified_customers) * 100
  shipping_info_provided_customers: number;
  closed_orders: number;
  checkout_intent_rate: number; // (closed_orders / shipping_info_provided_customers) * 100
  checkout_intent_drop: number; // 100 - checkout_intent_rate
}

export interface TimeDecaySLA {
  total_chats: number;
  delayed_chats_over_15m: number;
  sla_breach_rate: number; // (delayed_chats_over_15m / total_chats) * 100
  avg_frt_minutes: number;
  decay_category: 'OPTIMAL' | '20%_DECAY' | '50%_DECAY' | '80%_DEAD_LEAD';
  potential_conversion_percentage: number;
  dead_leads_count: number;
}

export interface SalesRepPerformance {
  rep_id: string;
  rep_name: string;
  assigned_leads: number;
  closed_orders: number;
  cvr_percentage: number;
  avg_frt_minutes: number;
  status: 'TOP' | 'AVERAGE' | 'NEEDS_TRAINING';
}

export interface SalesRepVarianceData {
  reps: SalesRepPerformance[];
  top_rep_cvr: number;
  lowest_rep_cvr: number;
  rep_deviation: number; // Top Rep CVR - Lowest Rep CVR
  is_high_variance: boolean; // rep_deviation > 15
  verdict: string;
}

export interface ObjectionItem {
  objection_type: 'Price Objection' | 'Shipping & Delivery' | 'Trust / Product Proof' | 'Competitor Match';
  label_ar: string;
  percentage: number;
  threshold_percentage: number;
  exceeded_threshold: boolean;
  diagnosis: string;
  executive_action: string;
}

export interface VBPScoreAudit {
  total_price_inquiries: number;
  vbp_passed_chats: number;
  vbp_failed_chats: number;
  vbp_score_percentage: number; // (vbp_passed_chats / total_price_inquiries) * 100
  benchmark_target: number; // 80%
  status: 'OPTIMAL' | 'BELOW_BENCHMARK' | 'CRITICAL';
  diagnostic_steps: {
    step_1_diagnostic_question: boolean; // طرح سؤال تشخيصي عن طبيعة المشكلة
    step_2_value_benefit_explained: boolean; // شرح الفائدة المباشرة للروتين المناسب
    step_3_price_as_solution: boolean; // إعلان السعر في خطوة متأخرة كحل شامل
  };
  trigger_keywords: string[];
  failure_reason: string;
  pass_example: string;
  fail_example: string;
}

export interface AOVAudit {
  aov_value: number; // إجمالي إيرادات المبيعات ÷ عدد الأوردرات المقفولة
  total_revenue: number;
  closed_orders: number;
  upsell_attempts_rate: number; // نسبة محاولات الترقية لباكدج كاملة
  cross_sell_attempts_rate: number; // نسبة محاولات اقتراح منتج مكمل
  single_product_orders_without_upsell: number;
  single_product_no_upsell_flag: boolean;
  benchmark_aov: number;
  status: 'EXCELLENT' | 'WARNING' | 'OPPORTUNITY_LOST';
  warning_flag_message: string;
  upsell_example: {
    single_item: string;
    single_price: number;
    upsell_target: string;
    bundle_price: number;
  };
  cross_sell_example: {
    base_item: string;
    complementary_item: string;
    benefit: string;
  };
}

export interface MasterRuleStatus {
  rule_id: string;
  rule_name: string;
  condition_text: string;
  condition_met: boolean;
  leak_label: string;
  action_plan: string;
}

export interface Layer2ChatKpi {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  healthy_range: string;
  red_flag_threshold: string;
  status: 'HEALTHY' | 'WARNING' | 'RED_FLAG';
}

export interface ChatLeakDiagnostic {
  id: string;
  leak_name: string;
  leak_name_ar: string;
  cause: string;
  condition: string;
  is_triggered: boolean;
  diagnosis: string;
  sales_action: string;
  media_buyer_action: string;
}

export interface Layer2DiagnosticResult {
  decision_light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP';
  chat_kpis: Layer2ChatKpi[];
  chat_leaks: ChatLeakDiagnostic[];
  chat_micro_funnel: ChatMicroFunnel;
  time_decay_sla: TimeDecaySLA;
  sales_rep_variance: SalesRepVarianceData;
  objection_breakdown: ObjectionItem[];
  vbp_score: VBPScoreAudit;
  aov_audit: AOVAudit;
  master_rules: MasterRuleStatus[];
  sales_team_tasks: string[];
  media_buyer_tasks: string[];
  summary_diagnosis: string;
  action_plan_24h: string;
}

export interface ExternalSignalCheckItem {
  id: string;
  name: string;
  name_ar: string;
  category: 'Seasonality' | 'Competitors' | 'Pricing' | 'Logistics' | 'Inventory' | 'Platform' | 'Technical';
  status: 'SAFE' | 'WARNING' | 'ALERT';
  description: string;
  inspection_source: string;
  current_finding: string;
  recommended_action: string;
  metrics_tag?: string;
}

export interface HardRuleDecisionItem {
  id: string;
  rule_name_ar: string;
  rule_type: 'AD_KILL_BAN' | 'COMPETITOR_COUNTER_STRIKE' | 'MID_MONTH_PAYDAY_TRAP' | 'OPERATIONAL_BOTTLENECK';
  condition_trigger: string;
  strict_directive: string;
  is_active: boolean;
  status_badge: string;
  execution_steps: string[];
  stakeholder_actions: {
    media_buyer: string;
    sales_rep: string;
    operations: string;
  };
}

export interface Layer5DiagnosticResult {
  decision_light: 'GREEN_SCALE' | 'YELLOW_FIX' | 'RED_STOP';
  ad_kill_ban_active: boolean;
  payday_cycle_status: 'PAYDAY_WINDOW' | 'MID_MONTH_TRAP' | 'NORMAL_CYCLE';
  current_day_of_month: number;
  signals_checklist: ExternalSignalCheckItem[];
  hard_rules: HardRuleDecisionItem[];
  executive_summary: string;
  action_plan_24h: string;
  media_buyer_rules: string[];
  sales_team_rules: string[];
  operations_rules: string[];
}

export interface AuditResult {
  system_status: SystemStatus;
  status_reason: string;
  health_scores: HealthScores;
  financial_economics: FinancialEconomics;
  diagnosis_summary: string;
  funnel_leak_location: FunnelLeakLocation;
  action_queue: ActionItem[];
  layer1_diagnostic?: Layer1DiagnosticResult;
  layer2_diagnostic?: Layer2DiagnosticResult;
  layer5_diagnostic?: Layer5DiagnosticResult;
  /** User-provided context describing how the uploaded data should be interpreted. */
  data_context_note?: string;
  /** Explicitly saved, browser-local operating context supplied by the user. */
  system_memory_notes?: string[];
  raw_calculated_metrics?: Record<string, number | string>;
}

export interface AdPlatformData {
  platform: 'Meta' | 'TikTok' | 'Google' | 'Blended';
  channel?: 'Messenger' | 'WhatsApp' | 'Instagram' | 'General';
  budget?: number;
  reach?: number;
  impressions: number;
  cpm?: number;
  frequency?: number;
  three_sec_views: number;
  seventy_five_percent_views: number;
  clicks: number;
  outbound_clicks?: number;
  outbound_ctr?: number;
  cost_per_outbound_click?: number;
  messaging_conversations_started?: number;
  new_messaging_contacts?: number;
  returning_messaging_contacts?: number;
  cost_per_messaging_conversation?: number;
  welcome_messages?: number;
  post_engagement?: number;
  post_reactions?: number;
  post_comments?: number;
  post_saves?: number;
  post_shares?: number;
  photo_clicks?: number;
  video_plays_at_75?: number;
  spend: number;
  reported_orders: number;
  reported_revenue: number;
  campaign_age_hours?: number;
  budget_scaled_24h_pct?: number;
  ad_sets?: AdSetBreakdown[];
}

export interface BackendSheetData {
  raw_orders: number;
  confirmed_orders: number;
  cancelled_fake_orders: number;
  delivered_orders: number;
  cogs_per_order: number;
  average_order_value: number;
  shipping_cost_per_order: number;
  cod_fee_per_order: number;
  confirmation_fee_per_order: number;
  product_performance?: ProductPerformance[];
  operations?: OrderOperations;
}

export interface OrderDimensionPerformance {
  name: string;
  orders: number;
  confirmed_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  revenue: number;
}

export interface OrderOperations {
  detailed_orders_count: number;
  sources: OrderDimensionPerformance[];
  sales_reps: OrderDimensionPerformance[];
  governorates: OrderDimensionPerformance[];
  couriers: OrderDimensionPerformance[];
}

export interface ProductPerformance {
  product_name: string;
  confirmed_orders: number;
  revenue?: number;
  delivered_orders?: number;
  cancelled_orders?: number;
  cogs_per_order?: number;
}

export interface ContentOffer {
  id: string;
  title: string;
  offer_text: string;
  channel: 'Meta Ads' | 'Messenger' | 'WhatsApp' | 'Instagram';
  creative_angle?: CreativeAngleCategory;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  ends_at?: string;
}

export interface ChatSalesData {
  actual_received_chats: number;
  average_frt_minutes: number;
  qualified_leads_count: number;
  closed_orders_count: number;
  followup_closed_orders: number;
  vbp_passed_chats_count?: number;
  total_price_inquiries_count?: number;
  upsell_attempts_count?: number;
  cross_sell_attempts_count?: number;
  single_product_orders_no_upsell?: number;
}

export interface AuditPayload {
  store_name?: string;
  currency?: string;
  timeframe?: string;
  ad_platforms: AdPlatformData[];
  backend_sheet: BackendSheetData;
  chat_data?: ChatSalesData;
  content_offers?: ContentOffer[];
  /** Optional context attached to the current import, retained across all layers. */
  data_context_note?: string;
  /** Notes the user explicitly chose to retain for future uploads on this browser. */
  system_memory_notes?: string[];
}

export interface WeeklySnapshot {
  id: string;
  week_code: string; // e.g. "W33-2026"
  week_label: string; // e.g. "أسبوع 33 (10 - 17 أغسطس)"
  period_start: string;
  period_end: string;
  timestamp: string;
  is_immutable: boolean;
  immutable_hash: string;
  // Raw Data (Platform Spent + True CRM)
  spent: number;
  impressions: number;
  clicks: number;
  raw_orders: number;
  confirmed_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  average_order_value: number;
  cogs_per_order: number;
  // Calculated Core Financials
  blended_cpa: number;
  confirmed_revenue: number;
  net_contribution_margin: number;
  contribution_margin_pct: number;
  roas: number;
  cvr: number;
  // Decision & Backtesting
  decision_applied?: {
    action_type: 'SCALE_BUDGET_20' | 'KILL_CREATIVE' | 'CHANGE_OFFER' | 'MAINTAIN' | 'INBOX_SCRIP_CHANGE';
    title: string;
    description: string;
    applied_date: string;
    target_kpi: string;
  };
  outcome_evaluation?: {
    success_status: 'SUCCESS' | 'PARTIAL' | 'FAILED' | 'PENDING';
    profit_delta_pct: number;
    cpa_delta_pct: number;
    retrospective_finding: string;
    confidence_impact: number; // e.g. +5% or -3%
  };
  // YoY Historical Marker
  yoy_baseline?: {
    same_week_last_year_spend: number;
    same_week_last_year_revenue: number;
    same_week_last_year_cpa: number;
    same_week_last_year_margin_pct: number;
    seasonal_event_name?: string; // e.g. "موسم المدارس" or "ركود ما بعد العيد"
  };
}

export interface DecisionToOutcomeRecord {
  id: string;
  date_applied: string;
  decision_name: string;
  category: string;
  pre_decision_metric: { cpa: number; spend: number; profit: number };
  post_decision_metric: { cpa: number; spend: number; profit: number };
  outcome_status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  profit_growth_pct: number;
  notes: string;
  confidence_calibration: string;
}

export type NavTab = 
  | 'overview' 
  | 'upload_files'
  | 'signals' 
  | 'diagnosis' 
  | 'layer3_diagnostic'
  | 'workflows' 
  | 'decisions'
  | 'benchmark'
  | 'guardrails' 
  | 'playbooks' 
  | 'snapshot_vault';
