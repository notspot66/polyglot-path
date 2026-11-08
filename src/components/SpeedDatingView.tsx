import React, { useState, useEffect, useRef } from 'react';
import { UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Clock,
  Sparkles,
  Globe2,
  Heart,
  MessageCircle,
  Volume2,
  Users,
  CheckCircle2,
  ArrowRight,
  Smile,
  Flame,
  Award,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useFirebaseAuth } from '../firebase/AuthContext';

interface SpeedDatingViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenLanguagePicker: () => void;
}

interface PeerPartner {
  id: string;
  name: string;
  avatar: string;
  country: string;
  flag: string;
  city: string;
  nativeLanguage: string;
  learningLanguage: string;
  proficiency: string;
  bio: string;
  commonTopics: string[];
  sampleGreetings: string[];
}

const PEER_PARTNERS: PeerPartner[] = [
  {
    id: 'partner-sofia',
    name: 'Sofia Ramos',
    avatar: '👩🏻‍🦰',
    country: 'Spain',
    flag: '🇪🇸',
    city: 'Barcelona',
    nativeLanguage: 'Spanish',
    learningLanguage: 'English',
    proficiency: 'B2 Upper-Intermediate',
    bio: 'Product designer & flamenco fan. Excited to chat about Barcelona tapas and tech!',
    commonTopics: ['Favorite travel spots in Spain', 'Work & daily routines', 'Coffee and food culture'],
    sampleGreetings: ['¡Hola! ¡Qué emoción conocerte!', '¿Cómo va tu día aprendiendo español?'],
  },
  {
    id: 'partner-kenji',
    name: 'Kenji Takahashi',
    avatar: '🧑🏻‍💻',
    country: 'Japan',
    flag: '🇯🇵',
    city: 'Kyoto',
    nativeLanguage: 'Japanese',
    learningLanguage: 'English',
    proficiency: 'C1 Fluent',
    bio: 'Storyboard animator & coffee roaster. Let us exchange phrases and cultural tips!',
    commonTopics: ['Anime animation process', 'Traditional Kyoto temples', 'Language learning hacks'],
    sampleGreetings: ['こんにちは！はじめまして！', 'Welcome! Let us speak together today!'],
  },
  {
    id: 'partner-amelie',
    name: 'Amélie Laurent',
    avatar: '👩🏼‍🎨',
    country: 'France',
    flag: '🇫🇷',
    city: 'Lyon',
    nativeLanguage: 'French',
    learningLanguage: 'English',
    proficiency: 'B1 Intermediate',
    bio: 'Pastry chef and street photographer. Looking for relaxed casual conversations!',
    commonTopics: ['French cuisine secrets', 'Cinema & photography', 'Music festivals'],
    sampleGreetings: ['Bonjour! Très heureuse de te rencontrer!', 'Prêt pour notre échange linguistique?'],
  },
  {
    id: 'partner-mateo',
    name: 'Mateo Rossi',
    avatar: '👨🏻‍🎓',
    country: 'Italy',
    flag: '🇮🇹',
    city: 'Milan',
    nativeLanguage: 'Italian',
    learningLanguage: 'Spanish & English',
    proficiency: 'B2 Upper-Intermediate',
    bio: 'Architecture graduate & football enthusiast. Love debating history and cinema!',
    commonTopics: ['Milan fashion & architecture', 'Italian pasta traditions', 'European football leagues'],
    sampleGreetings: ['Ciao! Che bello fare questa sessione con te!', 'Pronti a praticare?'],
  },
];

const ICEBREAKER_PROMPTS = [
  { prompt: 'What is your absolute favorite street food in your city?', targetHint: 'Mi comida favorita es...' },
  { prompt: 'If you could travel anywhere tomorrow, where would you go?', targetHint: 'Si pudiera viajar, iría a...' },
  { prompt: 'What made you decide to learn this language?', targetHint: 'Empecé a aprender porque...' },
  { prompt: 'Describe your hometown in 3 exciting adjectives.', targetHint: 'Mi ciudad es hermosa, viva y...' },
];

export const SpeedDatingView: React.FC<SpeedDatingViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenLanguagePicker,
}) => {
  const { user } = useFirebaseAuth();
  const [sessionState, setSessionState] = useState<'idle' | 'matching' | 'connected' | 'completed'>('idle');
  const [partner, setPartner] = useState<PeerPartner>(PEER_PARTNERS[0]);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 minutes
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string }[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);

  // Timer logic for live 10:00 session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === 'connected' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setSessionState('completed');
            sound.playFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState, secondsRemaining]);

  // Handle Matchmaking
  const handleStartMatching = () => {
    sound.playClick();
    setSessionState('matching');

    // Simulate match search with international peers
    setTimeout(() => {
      const match = PEER_PARTNERS.find((p) => p.country.toLowerCase() !== 'unknown') || PEER_PARTNERS[0];
      setPartner(match);
      setSecondsRemaining(600);
      setSessionState('connected');
      sound.playFanfare();
      // Speak partner greeting
      const greeting = match.sampleGreetings[0];
      sound.speak(greeting, currentLanguage.code);
    }, 2800);
  };

  // Turn on actual webcam if desired, or fallback smoothly
  const handleToggleCamera = async () => {
    sound.playClick();
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
      setIsVideoMuted(true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCameraStream(stream);
        setIsVideoMuted(false);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      } catch {
        // Fallback to avatar mode gracefully
        setIsVideoMuted((prev) => !prev);
      }
    }
  };

  const handleSendReaction = (emoji: string) => {
    sound.playClick();
    const id = Date.now() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 1500);
  };

  const handleEndCall = () => {
    sound.playClick();
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
    setSessionState('completed');
    // Reward XP & Coins
    onUpdateUserStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 60,
      coins: (prev.coins || 0) + 35,
    }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-32 flex flex-col items-center">
      {/* Header Lockup */}
      <div className="w-full text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-extrabold text-xs uppercase tracking-wider mb-2 shadow-sm animate-pulse">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Peer-to-Peer Language Speed Dating</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          10-Minute <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Live Exchange</span> ⚡
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto mt-1.5">
          Match live with international native speakers. 5 minutes in your target language, 5 minutes in theirs!
        </p>
      </div>

      {/* IDLE LOBBY STATE */}
      {sessionState === 'idle' && (
        <div className="w-full bg-[#161b22] border-2 border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-4xl mb-4 shadow-lg animate-bounce">
            🌐
          </div>
          <h2 className="text-2xl font-black text-white">Ready for Instant Conversation?</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1 mb-6">
            We will pair you with a verified native speaker of <span className="text-teal-400 font-extrabold">{currentLanguage.name} {currentLanguage.flag}</span> who wants to learn your language.
          </p>

          {/* Quick Match Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mb-8 text-left">
            <div className="p-3.5 bg-[#0d1117] border border-slate-800 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                Target Language
              </span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-emerald-400">
                  {currentLanguage.name} {currentLanguage.flag}
                </span>
                <button
                  onClick={onOpenLanguagePicker}
                  className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-[#0d1117] border border-slate-800 rounded-2xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                Session Format
              </span>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 10 Mins (5 + 5 Split)
              </span>
            </div>
          </div>

          {/* Start Matching CTA */}
          <button
            onClick={handleStartMatching}
            className="btn-3d w-full max-w-md py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 font-black text-base uppercase tracking-wider rounded-2xl shadow-xl border-b-4 border-teal-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            <span>Find Live Exchange Match Now</span>
          </button>
        </div>
      )}

      {/* MATCHING RADAR SEARCH STATE */}
      {sessionState === 'matching' && (
        <div className="w-full bg-[#161b22] border-2 border-cyan-500/40 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center">
          <div className="relative w-32 h-32 my-6 flex items-center justify-center">
            {/* Animated Radar Rings */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping" />
            <div className="absolute inset-4 rounded-full border-2 border-teal-500/40 animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-3xl shadow-xl">
              🛰️
            </div>
          </div>
          <h3 className="text-2xl font-black text-white">Scanning Global Nodes...</h3>
          <p className="text-xs text-cyan-300 mt-1 max-w-xs animate-pulse">
            Connecting to language exchange hubs in Madrid, Buenos Aires, and Barcelona...
          </p>
        </div>
      )}

      {/* CONNECTED LIVE VIDEO/AUDIO CALL STATE */}
      {sessionState === 'connected' && (
        <div className="w-full flex flex-col gap-4">
          {/* Call Top Status Bar */}
          <div className="w-full bg-[#161b22] border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                Live Exchange
              </span>
              <span className="text-xs text-slate-400">· Room #{partner.city}-77</span>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 bg-[#0d1117] px-3 py-1 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black text-white tabular-nums">
                {formatTime(secondsRemaining)}
              </span>
            </div>

            {/* 5-Min Switch Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-extrabold text-[10px]">
                {secondsRemaining > 300 ? `Speak ${currentLanguage.name}` : 'Speak English'}
              </span>
            </div>
          </div>

          {/* Split Screen Video Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Left: Partner Video Screen */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-[#161b22] to-[#0d1117] border-2 border-teal-500/40 shadow-xl flex flex-col items-center justify-center p-4">
              <div className="relative text-7xl sm:text-8xl mb-3 animate-bounce">
                {partner.avatar}
              </div>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white">
                <span>{partner.flag}</span>
                <span>{partner.name}</span>
                <span className="text-[10px] text-teal-300">({partner.city})</span>
              </div>

              {/* Audio Waveform simulation */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-xs p-2.5 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 truncate">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate italic">"{partner.sampleGreetings[0]}"</span>
                </div>
                <button
                  onClick={() => sound.speak(partner.sampleGreetings[0], currentLanguage.code)}
                  className="p-1 rounded-lg bg-teal-600 hover:bg-teal-500 text-white cursor-pointer shrink-0"
                  title="Hear partner"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Floating Reaction Emojis */}
              {floatingEmojis.map((item) => (
                <span
                  key={item.id}
                  className="absolute bottom-16 right-8 text-3xl animate-in fade-in slide-in-from-bottom duration-500 pointer-events-none"
                >
                  {item.emoji}
                </span>
              ))}
            </div>

            {/* Right: Learner Video Screen */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-b from-[#161b22] to-[#0d1117] border-2 border-cyan-500/40 shadow-xl flex flex-col items-center justify-center p-4">
              {cameraStream ? (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-7xl sm:text-8xl mb-3">
                  🦊
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-white">
                <span>{user?.displayName || 'You'}</span>
                <span className="text-[10px] text-cyan-300">(Learning {currentLanguage.name})</span>
              </div>

              <div className="absolute bottom-4 left-4 text-xs font-bold text-slate-400 bg-black/60 px-3 py-1 rounded-full">
                {isMicMuted ? '🔇 Microphone Off' : '🎙️ Microphone Live'}
              </div>
            </div>
          </div>

          {/* Icebreaker Conversation Card */}
          <div className="w-full bg-[#161b22] border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                Conversation Icebreaker #{topicIndex + 1}
              </span>
              <h4 className="text-base sm:text-lg font-black text-white">
                "{ICEBREAKER_PROMPTS[topicIndex].prompt}"
              </h4>
              <p className="text-xs text-emerald-400 mt-1">
                Prompt Hint: {ICEBREAKER_PROMPTS[topicIndex].targetHint}
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                setTopicIndex((prev) => (prev + 1) % ICEBREAKER_PROMPTS.length);
              }}
              className="btn-3d px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-extrabold text-xs rounded-xl border border-slate-700 cursor-pointer shrink-0"
            >
              Next Topic →
            </button>
          </div>

          {/* Bottom Call Controls & Emojis */}
          <div className="w-full bg-[#0d1117] border border-slate-800 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Quick Emojis */}
            <div className="flex items-center gap-1.5">
              {['🔥', '👏', '💡', '❤️', '🤣'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleSendReaction(emoji)}
                  className="w-9 h-9 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-slate-800 flex items-center justify-center text-lg cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* AV Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMicMuted((prev) => !prev);
                }}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  isMicMuted ? 'bg-rose-950 border-rose-600 text-rose-400' : 'bg-[#161b22] border-slate-700 text-slate-100'
                }`}
                title="Toggle Mic"
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleToggleCamera}
                className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
                  isVideoMuted ? 'bg-rose-950 border-rose-600 text-rose-400' : 'bg-[#161b22] border-slate-700 text-slate-100'
                }`}
                title="Toggle Camera"
              >
                {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndCall}
                className="btn-3d px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 border-rose-900 cursor-pointer shadow-lg"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Finish Call</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SESSION STATE */}
      {sessionState === 'completed' && (
        <div className="w-full bg-[#161b22] border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-3xl bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-4xl mb-4 shadow-xl animate-bounce">
            🎉
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-1">
            Exchange Session Completed!
          </span>
          <h2 className="text-3xl font-black text-white">
            You & {partner.name} rocked it!
          </h2>
          <p className="text-sm text-slate-300 max-w-md mt-1 mb-6">
            10 minutes of active bilingual conversation completed. Your spoken confidence in {currentLanguage.name} leveled up!
          </p>

          {/* Reward Badges */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-6">
            <div className="p-3 bg-[#0d1117] border border-emerald-500/40 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-emerald-400">XP Earned</span>
              <span className="block text-2xl font-black text-emerald-300">+60 XP</span>
            </div>
            <div className="p-3 bg-[#0d1117] border border-amber-500/40 rounded-2xl">
              <span className="text-[10px] font-black uppercase text-amber-400">Arena Coins</span>
              <span className="block text-2xl font-black text-amber-300">+35 Coins</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={() => setSessionState('idle')}
              className="btn-3d w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-extrabold rounded-xl shadow-md border-b-2 border-teal-800 cursor-pointer"
            >
              Match Another Partner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
