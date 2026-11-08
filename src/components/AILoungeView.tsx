import React, { useState, useEffect, useRef } from 'react';
import { Language, UserStats } from '../types';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  Crown,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  RotateCcw,
  Flame,
  Globe,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface AILoungeViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenLanguagePicker: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  timestamp: string;
}

export const AILoungeView: React.FC<AILoungeViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenLanguagePicker,
}) => {
  const [persona, setPersona] = useState<'friendly' | 'strict' | 'casual' | 'royal'>('friendly');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'm-init',
      sender: 'ai',
      text: `¡Bienvenido al AI Lounge! [Welcome to the AI Lounge!] I am Astrid, your personal billionaire language coach in ${currentLanguage.name}. Speak or type anything, and I'll converse with you while instantly highlighting grammar corrections in brackets!`,
      translation: `Welcome to the AI Lounge! I am Astrid, your personal billionaire language coach. Speak or type anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([
    '¿Qué planes tienes para el fin de semana?',
    'Me gustaría practicar mi vocabulario.',
    '¿Cómo se dice "entrepreneur" en español?',
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage.code || 'es';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage.code]);

  const toggleMic = () => {
    sound.playClick();
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = currentLanguage.code || 'es';
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  // Text-to-speech playback
  const speakText = (text: string, msgId: string) => {
    sound.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove bracketed corrections for cleaner speech flow
      const cleanText = text.replace(/\[.*?\]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = currentLanguage.code || 'es';
      utterance.rate = 0.95;

      utterance.onstart = () => setSpeakingMsgId(msgId);
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    sound.playClick();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai-lounge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: currentLanguage,
          persona,
          userMessage: text,
          conversationHistory: messages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || `¡Entendido! [${text}] Cuéntame más.`,
        translation: data.translation,
        corrections: data.correctionsFound,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      sound.playFanfare();

      if (data.suggestedReplies?.length) {
        setSuggestedReplies(data.suggestedReplies.map((r: any) => r.text));
      }

      // Reward learner XP for engaging in AI conversation
      onUpdateUserStats((prev) => ({
        ...prev,
        totalXp: prev.totalXp + 15,
        coins: (prev.coins || 0) + 10,
      }));
    } catch (err) {
      console.warn('AI Lounge error:', err);
      // Fallback response with bracketed grammar encouragement
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `¡Muy bien dicho! [${text}] Continúa practicando tu fluidez en ${currentLanguage.name}. ¿Tienes alguna otra pregunta?`,
        translation: `Well said! Keep practicing your fluency. Do you have any other questions?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Helper to render message with highlighted bracket corrections [Like this: correction]
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const inner = part.slice(1, -1);
        return (
          <span
            key={i}
            className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-black border border-amber-500/40 text-xs shadow-xs"
            title="Grammar Correction / Enhanced Phrasing"
          >
            <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{inner}</span>
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-6 px-4 pb-28">
      {/* Premium Header Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-teal-700 p-6 sm:p-7 text-white shadow-2xl mb-6 relative overflow-hidden border border-amber-400/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-300/25 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-amber-200 border border-amber-300/30 flex items-center gap-1.5 shadow-sm">
                <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>BILLIONAIRE VIP LOUNGE</span>
              </span>
              <span className="text-xs font-black bg-teal-400 text-teal-950 px-2.5 py-1 rounded-full uppercase">
                LLM Powered
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              AI LANGUAGE LOUNGE
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 font-semibold mt-1 max-w-xl leading-relaxed">
              Real-time conversational mentor with dynamic bracket grammar correction <strong className="text-white underline">[Like this]</strong>, audio speech synthesis, and tailored polyglot personas.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs font-bold">
              <button
                onClick={onOpenLanguagePicker}
                className="btn-3d px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-teal-200" />
                <span>Target: {currentLanguage.name} {currentLanguage.flag}</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-black/25 border border-white/20 text-amber-200 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> +15 XP & 10 Coins per chat
              </span>
            </div>
          </div>

          {/* Persona Selector Chips */}
          <div className="bg-[#0d1117]/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex flex-col gap-2 shrink-0 w-full md:w-56">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
              Select AI Persona
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              <button
                onClick={() => setPersona('friendly')}
                className={`px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  persona === 'friendly'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#161b22] text-slate-300 hover:text-white'
                }`}
              >
                Astrid ✨
              </button>
              <button
                onClick={() => setPersona('strict')}
                className={`px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  persona === 'strict'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#161b22] text-slate-300 hover:text-white'
                }`}
              >
                Prof. Sterling 🎓
              </button>
              <button
                onClick={() => setPersona('casual')}
                className={`px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  persona === 'casual'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#161b22] text-slate-300 hover:text-white'
                }`}
              >
                Kai (Casual) 🎧
              </button>
              <button
                onClick={() => setPersona('royal')}
                className={`px-2.5 py-1.5 rounded-xl transition-all text-left ${
                  persona === 'royal'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-[#161b22] text-slate-300 hover:text-white'
                }`}
              >
                Seraphina 👑
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="w-full bg-[#161b22] rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    isUser
                      ? 'bg-teal-600 text-white'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black'
                  }`}
                >
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div className="flex flex-col gap-1.5">
                  <div
                    className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                      isUser
                        ? 'bg-teal-600 text-white rounded-tr-none'
                        : 'bg-[#0d1117] text-slate-100 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <div>{renderMessageContent(msg.text)}</div>

                    {msg.translation && (
                      <p className="text-xs text-slate-400 font-medium italic mt-2 pt-2 border-t border-slate-800">
                        {msg.translation}
                      </p>
                    )}

                    {/* Grammar corrections breakdown badge */}
                    {msg.corrections && msg.corrections.length > 0 && (
                      <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                        <div className="flex items-center gap-1 font-bold mb-1 text-amber-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Grammar Insight:</span>
                        </div>
                        {msg.corrections.map((corr, cIdx) => (
                          <div key={cIdx} className="space-y-0.5">
                            <span className="line-through text-rose-300 mr-1.5">
                              {corr.original}
                            </span>
                            <span className="font-extrabold text-emerald-400">
                              → {corr.corrected}
                            </span>
                            <p className="text-[11px] text-slate-400">{corr.explanation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 font-bold px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSpeaking
                            ? 'text-amber-400 bg-amber-500/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Hear Pronunciation"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-[#0d1117] border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold text-amber-300">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Astrid is thinking in {currentLanguage.name}...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Replies */}
        <div className="px-4 py-2 bg-[#0d1117]/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            Quick Prompts:
          </span>
          {suggestedReplies.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill)}
              className="px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-slate-200 border border-slate-800 font-bold shrink-0 transition-colors cursor-pointer"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Bottom Input Bar with Voice & Send */}
        <div className="p-3 sm:p-4 bg-[#0d1117] border-t border-slate-800 flex items-center gap-2">
          {/* Microphone Voice Button */}
          <button
            onClick={toggleMic}
            className={`p-3 rounded-2xl border transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-[#161b22] text-slate-300 hover:text-white border-slate-800'
            }`}
            title={isListening ? 'Listening... click to stop' : 'Speak via microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-teal-400" />}
          </button>

          {/* Text Input Field */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Say something in ${currentLanguage.name}...`}
            className="flex-1 px-4 py-3 bg-[#161b22] border border-slate-800 focus:border-amber-400 rounded-2xl text-slate-100 font-semibold text-sm outline-none transition-all placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/20"
          />

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="btn-3d px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:translate-y-0.5 text-slate-950 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border-b-2 border-amber-700"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
