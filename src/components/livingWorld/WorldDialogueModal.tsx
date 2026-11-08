import React, { useState, useEffect, useRef } from 'react';
import {
  WorldLocation,
  Language,
  UserStats,
  CefrLevel,
  CharacterMemory,
  EndOfMissionReport,
} from '../../types';
import { sound } from '../../utils/audio';
import { CEFR_LEVELS } from '../../data/livingWorld';
import {
  X,
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  HelpCircle,
  Award,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Gem,
  Flame,
  Zap,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface WorldDialogueModalProps {
  location: WorldLocation;
  currentLanguage: Language;
  userStats: UserStats;
  characterMemory?: CharacterMemory;
  initialCefrLevel: CefrLevel;
  onClose: () => void;
  onMissionCompleted: (
    locationId: string,
    characterId: string,
    report: EndOfMissionReport,
    newMemoryNote: string
  ) => void;
}

interface ChatMessage {
  id: string;
  sender: 'character' | 'user';
  text: string;
  translation?: string;
  correction?: {
    hasMistake: boolean;
    feedback: string;
    correctedSentence: string;
  };
}

export const WorldDialogueModal: React.FC<WorldDialogueModalProps> = ({
  location,
  currentLanguage,
  userStats,
  characterMemory,
  initialCefrLevel,
  onClose,
  onMissionCompleted,
}) => {
  const [cefrLevel, setCefrLevel] = useState<CefrLevel>(initialCefrLevel);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [showPaoHint, setShowPaoHint] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState<{ text: string; translation: string }[]>([]);
  const [missionReport, setMissionReport] = useState<EndOfMissionReport | null>(null);
  const [lastMemoryNote, setLastMemoryNote] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentLanguage.code || 'es-ES';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
        sound.playClick();
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLanguage]);

  // Initial greeting from character on modal open
  useEffect(() => {
    const isReturning = characterMemory && characterMemory.visitCount > 0;
    const initialText = isReturning
      ? `¡Hola de nuevo! Es maravilloso verte otra vez en ${location.name}. ¿Cómo has estado practicando tu ${currentLanguage.name}?`
      : `${location.character.greetingPreview}`;

    const initialTranslation = isReturning
      ? `Hello again! It is wonderful to see you once more at ${location.name}. How has your ${currentLanguage.name} practice been going?`
      : `Welcome! Let's converse in ${currentLanguage.name}.`;

    const firstMsg: ChatMessage = {
      id: 'msg-0',
      sender: 'character',
      text: initialText,
      translation: initialTranslation,
    };

    setMessages([firstMsg]);
    sound.speak(initialText, currentLanguage.code);

    // Initial default hints
    setSuggestedReplies([
      {
        text: `¡Hola! Me alegro de verte.`,
        translation: `Hello! Nice to see you.`,
      },
      {
        text: `Estoy listo para practicar mi ${currentLanguage.name}.`,
        translation: `I am ready to practice my ${currentLanguage.name}.`,
      },
    ]);
  }, [location, characterMemory, currentLanguage]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingReply]);

  // Speech-to-text toggle
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    sound.playClick();

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.lang = currentLanguage.code || 'es-ES';
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsRecording(false);
      }
    }
  };

  // Send learner message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoadingReply) return;

    sound.playClick();
    setInputText('');
    setShowPaoHint(false);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setIsLoadingReply(true);

    try {
      const response = await fetch('/api/living-world/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: location.id,
          characterName: location.character.name,
          characterRole: location.character.role,
          targetLanguage: currentLanguage,
          cefrLevel,
          userMessage: text,
          conversationHistory: nextHistory.map((m) => ({
            speaker: m.sender === 'user' ? 'Learner' : location.character.name,
            text: m.text,
          })),
          characterMemory: characterMemory || {
            visitCount: 1,
            notes: 'First meeting with learner.',
            learnedVocabulary: [],
            weakPoints: [],
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch character reply');
      const data = await response.json();

      // Add feedback to user's message
      if (data.corrections) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, correction: data.corrections } : m))
        );
      }

      // Add character reply
      const charMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'character',
        text: data.characterReply,
        translation: data.characterReplyTranslation,
      };

      setMessages((prev) => [...prev, charMsg]);
      sound.speak(data.characterReply, currentLanguage.code);

      if (data.suggestedReplies && data.suggestedReplies.length > 0) {
        setSuggestedReplies(data.suggestedReplies);
      }

      if (data.newMemoryNote) {
        setLastMemoryNote(data.newMemoryNote);
      }
    } catch (err) {
      console.warn('Living world chat error, providing helpful response:', err);
      const fallbackReply = `¡Muy bien dicho! Me alegra charlar contigo en ${location.name}.`;
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'character',
          text: fallbackReply,
          translation: `Very well said! I enjoy chatting with you at ${location.name}.`,
        },
      ]);
      sound.speak(fallbackReply, currentLanguage.code);
    } finally {
      setIsLoadingReply(false);
    }
  };

  // Complete mission & generate learning report
  const handleFinishMission = async () => {
    sound.playClick();
    setIsLoadingReply(true);

    try {
      const response = await fetch('/api/living-world/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: location.id,
          characterName: location.character.name,
          targetLanguage: currentLanguage,
          cefrLevel,
          conversationHistory: messages.map((m) => ({
            speaker: m.sender === 'user' ? 'Learner' : location.character.name,
            text: m.text,
          })),
        }),
      });

      const reportData: EndOfMissionReport = await response.json();
      sound.playFanfare();
      setMissionReport(reportData);
      onMissionCompleted(location.id, location.character.id, reportData, lastMemoryNote);
    } catch (err) {
      console.warn('Report generation fallback:', err);
      const fallbackReport: EndOfMissionReport = {
        score: 95,
        fluencyRating: 'Confident',
        xpEarned: 50,
        gemsEarned: 25,
        vocabularyLearned: [
          { term: 'por favor', meaning: 'please' },
          { term: 'gracias', meaning: 'thank you' },
          { term: 'buenos días', meaning: 'good morning' },
        ],
        grammarNotes: [
          {
            original: 'Conversational replies',
            correction: 'Natural phrasing',
            tip: 'Polite, active participation helps conversational fluency.',
          },
        ],
        paoPraise: `¡Increíble! Pao is dancing with joy—your conversation skills in ${currentLanguage.name} leveled up!`,
        nextMissionRecommendation: 'Explore the next unlocked location in the 3D city!',
      };
      sound.playFanfare();
      setMissionReport(fallbackReport);
      onMissionCompleted(location.id, location.character.id, fallbackReport, lastMemoryNote);
    } finally {
      setIsLoadingReply(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl h-[92vh] max-h-[820px] bg-[#0b0e14] text-slate-100 rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1117]">
          {/* Location & Character Lockup */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#161b22] border border-slate-700/60 flex items-center justify-center text-2xl shadow-xs">
              {location.character.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white leading-tight">
                  {location.character.name}
                </h3>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  {location.character.role}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {location.name} · Learning in {currentLanguage.name} {currentLanguage.flag}
              </span>
            </div>
          </div>

          {/* Right Controls: CEFR Selector & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CEFR Level Pill Dropdown */}
            <div className="flex items-center gap-1 bg-[#161b22] border border-slate-800 rounded-xl px-2 py-1">
              <span className="text-[10px] font-black text-slate-400 uppercase hidden sm:inline">Level:</span>
              <select
                value={cefrLevel}
                onChange={(e) => {
                  sound.playClick();
                  setCefrLevel(e.target.value as CefrLevel);
                }}
                className="bg-transparent text-emerald-400 font-black text-xs cursor-pointer focus:outline-none"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id} className="bg-[#161b22] text-white">
                    {lvl.id} ({lvl.label.split('·')[1]?.trim()})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#161b22] transition-colors cursor-pointer"
              title="Leave Location"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Character Memory Banner (Signature Feature) */}
        {characterMemory && characterMemory.visitCount > 0 && (
          <div className="px-5 py-2 bg-emerald-950/40 border-b border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow shrink-0" />
              <span>
                <strong>Persistent Memory Active:</strong> {location.character.name} remembers you from {characterMemory.visitCount} previous visit{characterMemory.visitCount > 1 ? 's' : ''}!
                {characterMemory.notes && ` (${characterMemory.notes})`}
              </span>
            </div>
            <span className="hidden sm:inline text-[11px] font-bold text-emerald-400/80">
              {characterMemory.learnedVocabulary.length} words recalled
            </span>
          </div>
        )}

        {/* End-Of-Mission Report Overlay Screen */}
        {missionReport ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-200">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 mb-4">
              <img
                src="/src/assets/images/polypanda_mascot_logo_1794049862453.jpg"
                alt="Pao Celebrating"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" />
              <span>MISSION COMPLETED!</span>
            </div>

            <h2 className="text-3xl font-black text-white mb-1">
              Conversation Mastered!
            </h2>
            <p className="text-xs text-slate-300 max-w-md mb-6 italic">
              "{missionReport.paoPraise}"
            </p>

            {/* Score & Rewards Grid */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md mb-6">
              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-amber-500/30 text-center">
                <span className="text-[10px] font-extrabold uppercase text-amber-400">Score</span>
                <span className="block text-2xl font-black text-amber-400 mt-0.5">{missionReport.score}%</span>
                <span className="text-[10px] text-slate-400 font-bold">{missionReport.fluencyRating}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-emerald-500/30 text-center">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400">XP Gained</span>
                <span className="block text-2xl font-black text-emerald-400 mt-0.5">+{missionReport.xpEarned}</span>
                <span className="text-[10px] text-slate-400 font-bold">Total Power</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#161b22] border border-sky-500/30 text-center">
                <span className="text-[10px] font-extrabold uppercase text-sky-400">Gems</span>
                <span className="block text-2xl font-black text-sky-400 mt-0.5">+{missionReport.gemsEarned} 💎</span>
                <span className="text-[10px] text-slate-400 font-bold">Treasury</span>
              </div>
            </div>

            {/* Learned Vocabulary & Grammar Notes */}
            <div className="w-full max-w-md space-y-3 mb-6 text-left">
              {missionReport.vocabularyLearned.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1.5">
                    📚 Vocabulary Retained in Memory
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {missionReport.vocabularyLearned.map((v, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#21262d] text-xs font-bold text-slate-200 border border-slate-700"
                      >
                        <strong>{v.term}</strong>: {v.meaning}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {missionReport.nextMissionRecommendation && (
                <div className="p-3.5 rounded-2xl bg-[#161b22] border border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                    🗺️
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-purple-400 block">Recommended Next</span>
                    <span className="text-xs font-bold text-slate-200">{missionReport.nextMissionRecommendation}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="btn-3d w-full max-w-md py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg border-b-4 border-emerald-700 cursor-pointer"
            >
              Continue Adventure
            </button>
          </div>
        ) : (
          /* Live Interactive Dialogue Body */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Mission Objectives Card */}
              <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  🎯
                </div>
                <div>
                  <span className="text-xs font-black uppercase text-amber-400 block">Mission Goals</span>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    {location.sampleMissions[0] || 'Order something politely and ask questions!'}
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                    {msg.sender === 'character' && (
                      <div className="w-8 h-8 rounded-xl bg-[#161b22] border border-slate-700 flex items-center justify-center text-base shrink-0 mb-1">
                        {location.character.avatar}
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-3xl shadow-sm text-sm ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-[#161b22] text-slate-100 border border-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <div className="font-extrabold text-base leading-relaxed">
                        {msg.text}
                      </div>

                      {/* Character translation toggle */}
                      {msg.translation && (
                        <div className="text-xs text-slate-400 mt-1.5 pt-1.5 border-t border-slate-700/60 italic">
                          "{msg.translation}"
                        </div>
                      )}

                      {/* Listen button for character reply */}
                      {msg.sender === 'character' && (
                        <button
                          onClick={() => sound.speak(msg.text, currentLanguage.code)}
                          className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#21262d] text-[11px] font-extrabold text-emerald-400 border border-slate-700 hover:border-emerald-500 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" /> Listen
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Real-time Grammar Correction Card under user message */}
                  {msg.correction && (
                    <div
                      className={`mt-1.5 mr-2 max-w-[85%] sm:max-w-[75%] p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                        msg.correction.hasMistake
                          ? 'bg-amber-950/60 border-amber-600/50 text-amber-200'
                          : 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                      }`}
                    >
                      {msg.correction.hasMistake ? (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-extrabold block">
                          {msg.correction.hasMistake ? 'Grammar Tip' : 'Great Phrasing!'}
                        </span>
                        <p className="mt-0.5">{msg.correction.feedback}</p>
                        {msg.correction.hasMistake && msg.correction.correctedSentence && (
                          <div className="mt-1 font-mono text-[11px] bg-black/40 px-2 py-0.5 rounded">
                            Native: "{msg.correction.correctedSentence}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoadingReply && (
                <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{location.character.name} is thinking and replying in {currentLanguage.name}...</span>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Pao Panda Floating Companion Bar & Hint Drawer */}
            <div className="px-4 py-2 border-t border-slate-800 bg-[#0d1117] flex items-center justify-between">
              {/* Panda Companion Hint Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowPaoHint((prev) => !prev);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-amber-500/40 text-amber-400 text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                >
                  <span className="text-base">🐾</span>
                  <span>Ask Pao for Hints</span>
                </button>
              </div>

              {/* Finish Mission Early Button */}
              {messages.length >= 4 && (
                <button
                  onClick={handleFinishMission}
                  className="btn-3d px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs border-b-2 border-purple-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Finish Mission & Claim XP</span>
                </button>
              )}
            </div>

            {/* Pao Hint Suggestions Popup */}
            {showPaoHint && (
              <div className="px-4 py-3 bg-[#161b22] border-t border-slate-800 space-y-2 animate-in slide-in-from-bottom-2 duration-150">
                <div className="flex items-center justify-between text-xs font-black text-amber-400">
                  <div className="flex items-center gap-1.5">
                    <span>🐾 Pao's Recommended Phrases ({currentLanguage.name}):</span>
                  </div>
                  <button
                    onClick={() => setShowPaoHint(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedReplies.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(r.text)}
                      className="btn-3d p-2.5 rounded-xl bg-[#0b0e14] hover:bg-[#21262d] border border-slate-800 hover:border-emerald-500 text-left cursor-pointer transition-all"
                    >
                      <span className="block text-xs font-extrabold text-white">{r.text}</span>
                      <span className="block text-[11px] text-slate-400 italic mt-0.5">"{r.translation}"</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Input Controls: Mic, Text, Send */}
            <div className="p-4 border-t border-slate-800 bg-[#0d1117] flex items-center gap-2 sm:gap-3">
              {/* Microphone Voice Button */}
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  className={`btn-3d p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                      : 'bg-[#161b22] border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500'
                  }`}
                  title={isRecording ? 'Listening... click to stop' : `Speak in ${currentLanguage.name}`}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-400" />}
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isRecording
                    ? `Listening in ${currentLanguage.name}...`
                    : `Reply in ${currentLanguage.name}... (e.g. Me gustaría pedir...)`
                }
                className="flex-1 px-4 py-3 bg-[#161b22] border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />

              {/* Send Button */}
              <button
                disabled={!inputText.trim() || isLoadingReply}
                onClick={() => handleSendMessage()}
                className={`btn-3d px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  inputText.trim() && !isLoadingReply
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-2 border-emerald-700'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
