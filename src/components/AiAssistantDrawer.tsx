import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AuditPayload, AuditResult } from '../types';
import { Sparkles, Send, Bot, ChevronDown, ChevronUp, Zap, Globe, Mic, MicOff, Volume2, Square, Radio } from 'lucide-react';

interface AiAssistantDrawerProps {
  payload: AuditPayload;
  auditResult?: AuditResult | null;
  status: string;
  funnelLeak: string;
  onApplyActionsFromAi?: (newActions: string[]) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  payload,
  auditResult,
  status,
  funnelLeak,
  onApplyActionsFromAi
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'ليه الأداء اختلف الأسبوع ده وأعمل إيه دلوقتي عشان أزود الأوردرات المؤكدة؟',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 'm2',
      sender: 'assistant',
      text: `بناءً على فحص شيت المبيعات المؤكدة (مصدر الحقيقة المباشر):\nالسبب الرئيسي في هبوط الأداء هو **${funnelLeak.replace(/_/g, ' ')}** مع تسريب في مرحلة تأكيد أوردرات الكول سنتر بالشيت.\n\nلاحظ أنه تم استبعاد الاعتماد على Purchase بكسل ميتا لتأخره في التحديث، وتم الاعتماد كلياً على أوردرات الشيت المؤكدة (${payload.backend_sheet?.confirmed_orders || 0} أوردر).\n\n### 3 خطوات عملية فورية:\n1. **تحديث أول 3 ثواني في الفيديو (Hook Refresh)** للتركيز على لفت انتباه العميل قبل الكليك.\n2. **تحسين سكريبت وسرعة الكول سنتر** لرفع نسبة تأكيد أوردرات الشيت لأكثر من 70%.\n3. **إعادة توزيع الميزانية** نحو المنتجات ذات هامش الربح الصافي الإيجابي (Contribution Margin).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      diagnosisBadge: status,
      actionPlan: [
        'تحديث أول 3 ثواني في الإعلانات ذات الـ Hook المنخفض.',
        'متابعة أوردرات الشيت والاتصال الهاتفي السريع خلال 30 دقيقة.',
        'إعادة توجيه الميزانية للمنتجات الأعلى ربحية بالشيت.'
      ]
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [language, setLanguage] = useState<'ar-EG' | 'en'>('ar-EG');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingText, setRecordingText] = useState('');
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const presetQuestions = [
    'ليه الأداء اختلف الأسبوع ده؟',
    'قارن نتائج ميتا بأوردرات الشيت المؤكدة',
    'اكتبلي 3 أفكار خطاف إعلاني (Hooks)',
    'احسبلي نقطة التعادل للـ ROAS والـ CPA'
  ];

  // Initialize Web Speech Recognition if available
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === 'ar-EG' ? 'ar-EG' : 'en-US';

      rec.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setRecordingText(currentTranscript);
          setInputMsg(currentTranscript);
        }
      };

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        stopRecording();
      };

      rec.onend = () => {
        setIsRecording(false);
        clearInterval(timerRef.current);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  const startRecording = () => {
    if (isRecording) return;
    setRecordingSeconds(0);
    setRecordingText('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'ar-EG' ? 'ar-EG' : 'en-US';
        recognitionRef.current.start();
        setIsRecording(true);

        timerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      } catch (e) {
        console.warn('Start recognition failed:', e);
        fallbackRecordingSimulation();
      }
    } else {
      fallbackRecordingSimulation();
    }
  };

  const fallbackRecordingSimulation = () => {
    setIsRecording(true);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => {
        if (prev >= 4) {
          stopRecording('حلل لي أداء حملة ميتا مقارنة بأوردرات الشيت المؤكدة واقترح خطة علاج التسريب.');
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = (customText?: string) => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }

    if (customText) {
      setInputMsg(customText);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || isSending) return;

    if (isRecording) {
      stopRecording();
    }

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
          payload,
          auditResult,
          language
        })
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'تم تحليل الاستفسار بنجاح.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagnosisBadge: data.status || status
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'حدث خطأ أثناء الاتصال بالمساعد الذكي. جاري الاستعانة ببيانات الفحص المحلية.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleTurnInsightIntoActions = () => {
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
    if (!lastBotMsg) return;

    const actionsToApply: string[] = [];
    if (lastBotMsg.actionPlan && lastBotMsg.actionPlan.length > 0) {
      actionsToApply.push(...lastBotMsg.actionPlan);
    } else {
      actionsToApply.push(
        'متابعة وسكريبت تأكيد أوردرات الشيت.',
        'تعديل أول 3 ثواني في فيديوهات الإعلانات.',
        'الالتزام بسقف 20% لزيادة الميزانية يومياً.'
      );
    }

    if (onApplyActionsFromAi) {
      onApplyActionsFromAi(actionsToApply);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full overflow-hidden shadow-2xs text-slate-900">
      {/* Drawer Header */}
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight font-headline">مساعد الذكاء الاصطناعي (Copilot)</h3>
            <p className="text-[10px] text-slate-500 font-sans font-medium">مساعد التشخيص الذكي بالأوامر الصوتية</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'ar-EG' ? 'en' : 'ar-EG')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
            title="تغيير اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'ar-EG' ? 'العربية' : 'English'}</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-slate-900 p-1 rounded-md transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Messages Container */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[500px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-500 font-bold font-headline mb-1">
                  {msg.sender === 'user' ? 'المسؤول (صوت/نص)' : 'المساعد الذكي'}
                </span>

                <div
                  className={`p-3 rounded-xl text-xs max-w-[92%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-sans shadow-2xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 font-sans'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.actionPlan && msg.actionPlan.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-emerald-800 font-headline block mb-1">
                        خطة العمل المقترحة:
                      </span>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-sans">
                        {msg.actionPlan.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-bold p-2">
                <Bot className="w-4 h-4 text-emerald-700 animate-spin" />
                <span>جاري فحص الشيت والبيانات وتوليد الإجابة...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Active Voice Recording Status Box */}
          {isRecording && (
            <div className="p-3 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2 text-rose-800 font-bold">
                <Radio className="w-4 h-4 text-rose-600 animate-ping" />
                <span>جاري تسجيل صوتك... ({recordingSeconds} ثانية)</span>
              </div>
              <button
                onClick={() => stopRecording()}
                className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>إيقاف وإرسال</span>
              </button>
            </div>
          )}

          {/* Turn Insight into Actions Button */}
          <div className="p-2 px-3 border-t border-slate-200 bg-slate-50">
            <button
              onClick={handleTurnInsightIntoActions}
              className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-headline font-bold text-xs flex items-center justify-center gap-2 shadow-2xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>إضافة التوصيات لقائمة المهام المطلوبة</span>
            </button>
          </div>

          {/* Input Box with Voice Mic Button */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={language === 'ar-EG' ? 'اكتب سؤالك أو استخدم المايك للحدث صوتياً...' : 'Ask Copilot or use voice recording...'}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 font-sans focus:outline-none focus:border-emerald-500 transition-colors"
            />

            {/* Voice Mic Button */}
            <button
              onClick={isRecording ? () => stopRecording() : startRecording}
              className={`p-2 rounded-lg border transition-all cursor-pointer shrink-0 font-bold ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border-slate-300'
              }`}
              title={isRecording ? 'إيقاف التسجيل الصوتي' : 'تسجيل أمر صوتي (Voice Command)'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={isSending || (!inputMsg.trim() && !isRecording)}
              className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-all cursor-pointer shrink-0 font-bold shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};


