import React, { useState, useRef, useEffect } from 'react';
import { UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import {
  X,
  Share2,
  Download,
  Play,
  Pause,
  Sparkles,
  Volume2,
  Copy,
  Check,
  Smartphone,
  Video,
  Layers,
  CheckCircle2,
  Camera,
  Film,
} from 'lucide-react';

interface AvatarExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  currentLanguage: Language;
}

interface AvatarModel {
  id: string;
  name: string;
  badge: string;
  emoji: string;
  avatarImg: string;
  accentColor: string;
}

const AVATAR_MODELS: AvatarModel[] = [
  {
    id: 'cyber_fox',
    name: 'Cyber Fox',
    badge: 'DEFAULT',
    emoji: '🦊',
    avatarImg: '/src/assets/images/cyber_fox_logo_1794128107518.jpg',
    accentColor: '#00e5ff',
  },
  {
    id: 'astronaut_panda',
    name: 'Astronaut Pao',
    badge: 'COSMIC',
    emoji: '🐼',
    avatarImg: '/src/assets/images/polypanda_mascot_logo_1794049862453.jpg',
    accentColor: '#10b981',
  },
  {
    id: 'golden_fox',
    name: 'Golden Monarch',
    badge: 'VIP',
    emoji: '👑',
    avatarImg: '/src/assets/images/cyber_fox_logo_1794128107518.jpg',
    accentColor: '#f59e0b',
  },
];

const BACKGROUND_SCENES = [
  { id: 'tokyo', name: 'Cyber Tokyo', icon: '🏙️', bgClass: 'from-cyan-900 via-purple-950 to-slate-950' },
  { id: 'madrid', name: 'Madrid Sunset', icon: '🏛️', bgClass: 'from-amber-900 via-rose-950 to-slate-950' },
  { id: 'paris', name: 'Paris Neon Cafe', icon: '☕', bgClass: 'from-teal-900 via-indigo-950 to-slate-950' },
  { id: 'greenscreen', name: 'Green Screen', icon: '🟩', bgClass: 'from-green-600 to-green-600' },
];

const VIRAL_TEMPLATES: Record<string, { title: string; targetText: string; translation: string }[]> = {
  es: [
    { title: 'Ordering like a Boss', targetText: 'Un café solo y la cuenta, por favor. ¡Qué día tan maravilloso!', translation: 'A black coffee and the check, please. What a wonderful day!' },
    { title: 'POV: 365 Day Streak', targetText: 'Empecé desde cero y ahora hablo español todos los días con Lingoverse.', translation: 'I started from zero and now I speak Spanish every day with Lingoverse.' },
    { title: 'Bilingual flex', targetText: 'La vida es demasiado corta para hablar un solo idioma.', translation: 'Life is too short to speak only one language.' },
  ],
  fr: [
    { title: 'Parisian Confidence', targetText: 'La vie est belle quand on apprend une nouvelle langue!', translation: 'Life is beautiful when learning a new language!' },
    { title: 'POV: Streak Pride', targetText: 'Un café et un croissant, s’il vous plaît! Prêt pour la journée.', translation: 'A coffee and a croissant, please! Ready for the day.' },
  ],
  ja: [
    { title: 'Tokyo Vibe', targetText: '毎日リンゴバースで日本語を練習しています！楽しいです！', translation: 'I practice Japanese every day on Lingoverse! It is fun!' },
  ],
  de: [
    { title: 'German Precision', targetText: 'Übung macht den Meister! Deutsch lernen macht Spaß.', translation: 'Practice makes perfect! Learning German is fun.' },
  ],
};

export const AvatarExporterModal: React.FC<AvatarExporterModalProps> = ({
  isOpen,
  onClose,
  userStats,
  currentLanguage,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarModel>(AVATAR_MODELS[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_SCENES[0]);
  const [customText, setCustomText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  // Lip-sync / speaking animation state
  const [mouthOpen, setMouthOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const defaultTemplates =
    VIRAL_TEMPLATES[currentLanguage.code] || VIRAL_TEMPLATES['es'] || VIRAL_TEMPLATES['fr'];
  const [activeTemplate, setActiveTemplate] = useState(defaultTemplates[0]);

  const phraseToSpeak = customText.trim() || activeTemplate.targetText;

  useEffect(() => {
    if (!phraseToSpeak) return;
  }, [phraseToSpeak]);

  if (!isOpen) return null;

  const handlePlayPreview = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      setMouthOpen(false);
      return;
    }

    sound.playClick();
    setIsPlaying(true);

    // Lip sync interval animation
    const mouthInterval = setInterval(() => {
      setMouthOpen((prev) => !prev);
    }, 180);

    sound.speak(phraseToSpeak, currentLanguage.code, false);

    // Estimate speaking duration (approx 250ms per word)
    const wordCount = phraseToSpeak.split(' ').length;
    const duration = Math.max(2500, wordCount * 350);

    setTimeout(() => {
      clearInterval(mouthInterval);
      setMouthOpen(false);
      setIsPlaying(false);
    }, duration);
  };

  const handleRecordVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    sound.playClick();
    setIsRecording(true);
    setRecordedBlobUrl(null);
    recordedChunksRef.current = [];

    // Capture stream from canvas at 30 fps
    try {
      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setIsRecording(false);
        sound.playFanfare();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      // Trigger preview playback during recording
      handlePlayPreview();

      const wordCount = phraseToSpeak.split(' ').length;
      const duration = Math.max(3000, wordCount * 380);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, duration);
    } catch {
      // Fallback
      setIsRecording(false);
      handlePlayPreview();
    }
  };

  const handleCopyCaption = () => {
    sound.playClick();
    const caption = `🔥 POV: Learning ${currentLanguage.name} with my AI Cyber Fox on Lingoverse!\n"${phraseToSpeak}"\n\n${userStats.streak}-day streak and counting! 🚀\n#Lingoverse #Learn${currentLanguage.name.replace(/\s+/g, '')} #PolyglotTok #LanguageLearning #LanguageChallenge`;
    navigator.clipboard?.writeText(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0d1117] border-2 border-cyan-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">AR Avatar Social Reel Studio</h3>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-black uppercase">
                  9:16 Viral Format
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate high-retention animated reels of your avatar speaking {currentLanguage.name} for TikTok, Reels, & Shorts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 overflow-y-auto pr-1">
          {/* Left: 9:16 Vertical Video Phone Frame Preview */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div
              className={`relative w-64 h-[440px] sm:w-72 sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-gradient-to-b ${selectedBg.bgClass} flex flex-col justify-between p-4`}
            >
              {/* Phone Status Top */}
              <div className="flex items-center justify-between text-[10px] font-bold text-white/80 z-10">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>LIVE REEL</span>
                </div>
                <span>9:16 HD</span>
              </div>

              {/* Avatar Center Stage with Animated Bobbing & Lip Sync */}
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <div
                  className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 shadow-2xl transition-transform duration-200 ${
                    isPlaying ? (mouthOpen ? 'scale-105' : 'scale-95') : 'scale-100'
                  }`}
                  style={{ borderColor: selectedAvatar.accentColor }}
                >
                  <img
                    src={selectedAvatar.avatarImg}
                    alt={selectedAvatar.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Neon Speaking Soundwave Indicator */}
                  {isPlaying && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-black/70 px-2 py-0.5 rounded-full">
                      <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce" />
                      <span className="w-1 h-5 bg-cyan-400 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce delay-150" />
                    </div>
                  )}
                </div>

                {/* Avatar Label */}
                <div className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 text-xs font-black text-white flex items-center gap-1.5 shadow-sm">
                  <span>{selectedAvatar.emoji}</span>
                  <span>{selectedAvatar.name}</span>
                </div>
              </div>

              {/* Karaoke Animated Subtitle Overlay */}
              <div className="z-10 bg-black/80 backdrop-blur-sm p-3 rounded-2xl border border-white/10 text-center shadow-lg">
                <span className="text-[10px] font-black uppercase text-teal-300 block mb-0.5">
                  {currentLanguage.name} {currentLanguage.flag}
                </span>
                <p className="text-xs sm:text-sm font-black text-white leading-snug">
                  "{phraseToSpeak}"
                </p>
                <span className="text-[10px] text-slate-300 italic block mt-1">
                  "{activeTemplate.translation}"
                </span>
              </div>

              {/* Watermark branding */}
              <div className="text-center text-[9px] font-extrabold text-white/60 tracking-wider uppercase mt-1">
                @Lingoverse App · Day {userStats.streak} Streak
              </div>
            </div>

            {/* Hidden canvas for video recording */}
            <canvas ref={canvasRef} width={400} height={600} className="hidden" />
          </div>

          {/* Right: Studio Customization & Export Controls */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* 1. Avatar Model Selector */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                1. Choose Viral Avatar
              </span>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_MODELS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      selectedAvatar.id === av.id
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md'
                        : 'bg-[#161b22] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{av.emoji}</span>
                    <span className="text-xs font-extrabold">{av.name}</span>
                    <span className="text-[9px] text-cyan-400 font-bold">{av.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Background Scene Selector */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                2. Choose Studio Background
              </span>
              <div className="grid grid-cols-4 gap-2">
                {BACKGROUND_SCENES.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedBg(bg);
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                      selectedBg.id === bg.id
                        ? 'bg-teal-950/70 border-teal-400 text-white'
                        : 'bg-[#161b22] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xl mb-0.5">{bg.icon}</span>
                    <span className="text-[10px] font-bold truncate max-w-full">{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Viral Phrase Presets */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2">
                3. Pick Viral Dialogue or Type Custom
              </span>
              <div className="flex flex-col gap-1.5 mb-2">
                {defaultTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playClick();
                      setActiveTemplate(t);
                      setCustomText('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      activeTemplate.title === t.title && !customText
                        ? 'bg-emerald-950/60 border-emerald-500/70 text-white'
                        : 'bg-[#161b22] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span>{t.title}</span>
                      <span className="text-[10px] text-teal-400 uppercase">Viral Hook</span>
                    </div>
                    <div className="text-xs text-emerald-300 font-extrabold mt-0.5 truncate">
                      "{t.targetText}"
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Speech Input */}
              <input
                type="text"
                placeholder={`Or type custom sentence in ${currentLanguage.name}...`}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d1117] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            {/* 4. Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handlePlayPreview}
                className={`btn-3d flex-1 w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                  isPlaying
                    ? 'bg-rose-600 text-white border-b-2 border-rose-900'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-teal-300 border border-slate-700'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-teal-400" />}
                <span>{isPlaying ? 'Pause Speaking' : 'Preview Lip-Sync'}</span>
              </button>

              <button
                onClick={handleRecordVideo}
                disabled={isRecording}
                className="btn-3d flex-1 w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border-b-2 border-teal-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Film className="w-4 h-4 text-slate-950" />
                <span>{isRecording ? 'Recording Clip...' : 'Record Reel Clip'}</span>
              </button>
            </div>

            {/* Social Share & Copy Caption */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCaption}
                className="btn-3d flex-1 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-slate-800 text-slate-200 font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Copied to Clipboard!' : 'Copy Viral Caption & Tags'}</span>
              </button>

              {recordedBlobUrl && (
                <a
                  href={recordedBlobUrl}
                  download={`Lingoverse_Reel_${currentLanguage.name}.webm`}
                  className="btn-3d py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 border-b-2 border-emerald-900 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Clip</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
