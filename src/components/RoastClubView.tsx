import React, { useState } from 'react';
import { UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import {
  Flame,
  Volume2,
  Share2,
  Sparkles,
  Zap,
  RotateCcw,
  Skull,
  Smile,
  AlertTriangle,
  Award,
  CheckCircle2,
  Copy,
  Check,
  TrendingDown,
  Shield,
  Loader2,
} from 'lucide-react';
import { useFirebaseAuth } from '../firebase/AuthContext';

interface RoastClubViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenSRSDeck?: () => void;
}

interface RoastResult {
  roasterName: string;
  roastTitle: string;
  roastText: string;
  emotionalDamagePercent: number;
  memePunchline: string;
  advice: string;
  targetLanguageLine: string;
  targetLanguageTranslation: string;
}

export const RoastClubView: React.FC<RoastClubViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenSRSDeck,
}) => {
  const { user } = useFirebaseAuth();
  const [savagery, setSavagery] = useState<'mild' | 'spicy' | 'savage'>('spicy');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [redemptionDone, setRedemptionDone] = useState(false);
  const [roastHistory, setRoastHistory] = useState<RoastResult[]>([]);

  const [currentRoast, setCurrentRoast] = useState<RoastResult>({
    roasterName: 'Viper the Cyber Roastmaster 🦊🎤',
    roastTitle: userStats.streak > 3 ? 'Basking in Mediocre Glory' : 'The Phantom Streak Disaster',
    roastText:
      userStats.streak > 5
        ? `Look at you, ${user?.displayName || 'Learner'}, flaunting a ${userStats.streak}-day streak like you're about to win the Nobel Prize in Literature. Half your quiz answers were frantic guesses at 11:59 PM to save your skin!`
        : `Welcome to the stage, ${user?.displayName || 'Learner'}! You've got ${userStats.streak} day(s) on your streak. Even a microwave timer has more consistency than your study schedule!`,
    emotionalDamagePercent: 84,
    memePunchline: 'A native speaker just heard your accent and switched to Morse code.',
    advice: 'Stop memorizing word lists at midnight and actually speak out loud for 5 minutes during daylight!',
    targetLanguageLine: '¡La perseverancia vence al desastre gramatical!',
    targetLanguageTranslation: 'Perseverance conquers grammatical disaster!',
  });

  const handleFetchRoast = async (roastTopic: 'streak' | 'mistakes' | 'random' | 'grammar') => {
    sound.playClick();
    setLoading(true);
    setRedemptionDone(false);

    try {
      const res = await fetch('/api/roast/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: { name: currentLanguage.name, code: currentLanguage.code },
          streak: userStats.streak,
          streakLost: userStats.streak === 0 || userStats.streak === 1,
          mistakes: (userStats.weakWordsDeck || []).slice(0, 4),
          savagery,
          roastTopic,
          userName: user?.displayName?.split(' ')[0] || 'Learner',
        }),
      });

      if (!res.ok) throw new Error('Roast generation failed');
      const data: RoastResult = await res.json();
      setCurrentRoast(data);
      setRoastHistory((prev) => [data, ...prev.slice(0, 5)]);
      sound.playWrong(); // Play hilarious comedy sting
    } catch (e) {
      console.warn('Fallback roast', e);
      sound.playWrong();
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakRoast = () => {
    sound.playClick();
    const textToSpeak = `${currentRoast.roastText} ... In ${currentLanguage.name}: ${currentRoast.targetLanguageLine}`;
    sound.speak(textToSpeak, currentLanguage.code || 'en-US');
  };

  const handleCopyQuote = () => {
    sound.playClick();
    const quote = `🔥 Lingoverse AI Roast Club:\n"${currentRoast.roastText}"\n💀 Emotional Damage: ${currentRoast.emotionalDamagePercent}%\n#Lingoverse #RoastMySpanish #LanguageLearning`;
    navigator.clipboard?.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRedeemDamage = () => {
    if (redemptionDone) return;
    sound.playFanfare();
    setRedemptionDone(true);
    onUpdateUserStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 35,
      coins: (prev.coins || 0) + 50,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-32 flex flex-col items-center">
      {/* Club Banner Header */}
      <div className="w-full text-center mb-8 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 font-extrabold text-xs uppercase tracking-wider mb-3 shadow-lg animate-pulse">
          <Flame className="w-4 h-4 text-rose-400" />
          <span>Underground AI Comedy Stage</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Lingoverse <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-orange-500 bg-clip-text text-transparent">Roast Club</span> 🔥
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mt-2">
          Think you're fluent? Let Viper the Savage AI Roastmaster humble your broken streak and cringe mistakes.
        </p>
      </div>

      {/* Savagery Meter & Controls */}
      <div className="w-full bg-[#161b22] border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Skull className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">Savagery Calibration</span>
            <div className="text-[11px] text-slate-400">Controls how brutally the AI exposes your grammar</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0d1117] rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              sound.playClick();
              setSavagery('mild');
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              savagery === 'mild'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Mild 🌶️</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSavagery('spicy');
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              savagery === 'spicy'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spicy 🔥</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setSavagery('savage');
            }}
            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              savagery === 'savage'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Savage 💀</span>
          </button>
        </div>
      </div>

      {/* Main Comedy Stage Spotlight Card */}
      <div className="w-full relative bg-gradient-to-b from-[#131924] via-[#0e131d] to-[#0a0d14] border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden mb-6">
        {/* Spotlight top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-rose-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Stage Header Avatar & Microphone */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden border-2 border-rose-500/60 shadow-xl bg-slate-900 shrink-0">
              <img
                src="/src/assets/images/cyber_fox_logo_1794128107518.jpg"
                alt="Viper the Roastmaster"
                className="w-full h-full object-cover scale-110"
              />
              <span className="absolute bottom-1 right-1 text-base">🎤</span>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">{currentRoast.roasterName}</h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-700/60 text-[10px] font-black uppercase">
                  LIVE ON STAGE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: {currentLanguage.name} {currentLanguage.flag} · Streak: {userStats.streak} Days · Mistakes: {userStats.weakWordsDeck?.length || 0}
              </p>
            </div>
          </div>

          {/* Emotional Damage Meter */}
          <div className="flex flex-col items-center sm:items-end">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
              Emotional Damage
            </span>
            <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">
              <TrendingDown className="w-6 h-6 text-rose-500 animate-bounce" />
              <span>{currentRoast.emotionalDamagePercent}%</span>
            </div>
          </div>
        </div>

        {/* Roast Headline & Punchline */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-black text-xs uppercase tracking-wider mb-2">
            🎭 {currentRoast.roastTitle}
          </span>
          <blockquote className="text-lg sm:text-2xl font-black text-slate-100 leading-relaxed italic my-2">
            "{currentRoast.roastText}"
          </blockquote>

          {/* Target language punchline */}
          <div className="p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 mt-4 text-left">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-1">
              Burn in {currentLanguage.name} {currentLanguage.flag}:
            </span>
            <div className="text-base font-extrabold text-amber-200">
              "{currentRoast.targetLanguageLine}"
            </div>
            <div className="text-xs text-slate-400 italic mt-0.5">
              "{currentRoast.targetLanguageTranslation}"
            </div>
          </div>

          {/* Meme verdict badge */}
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400 bg-[#0d1117] p-3 rounded-2xl border border-slate-800">
            <span className="text-base">📢</span>
            <span className="text-rose-300 font-extrabold">Verdict:</span>
            <span>{currentRoast.memePunchline}</span>
          </div>
        </div>

        {/* Action Controls for the current Roast */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakRoast}
              className="btn-3d px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-teal-300 font-extrabold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs"
              title="Hear Viper Speak Roast"
            >
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span>Listen</span>
            </button>
            <button
              onClick={handleCopyQuote}
              className="btn-3d px-3.5 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white font-extrabold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-xs"
              title="Copy Roast Quote"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share Burn'}</span>
            </button>
          </div>

          {/* Convert Damage to XP / Heart */}
          <button
            onClick={handleRedeemDamage}
            disabled={redemptionDone}
            className={`btn-3d px-4 py-2 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all ${
              redemptionDone
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-b-2 border-emerald-800'
            }`}
          >
            {redemptionDone ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Damage Redeemed (+35 XP, +50 Coins)</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Turn Burn Into XP (+35 XP & +1 Heart)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Roast Topic Triggers Bar */}
      <div className="w-full mb-8">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center sm:text-left">
          Pick A Roast Target:
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => handleFetchRoast('streak')}
            disabled={loading}
            className="btn-3d p-3.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-slate-800 hover:border-amber-500/50 flex flex-col items-center text-center cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-xs font-black text-white">Roast My Streak</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{userStats.streak} Days on record</span>
          </button>

          <button
            onClick={() => handleFetchRoast('mistakes')}
            disabled={loading}
            className="btn-3d p-3.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-slate-800 hover:border-rose-500/50 flex flex-col items-center text-center cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-xs font-black text-white">Roast Weak Words</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{userStats.weakWordsDeck?.length || 0} Terms in deck</span>
          </button>

          <button
            onClick={() => handleFetchRoast('grammar')}
            disabled={loading}
            className="btn-3d p-3.5 rounded-2xl bg-[#161b22] hover:bg-[#21262d] border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center text-center cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs font-black text-white">Roast My Accent</span>
            <span className="text-[10px] text-slate-400 mt-0.5">{currentLanguage.name} Phonetics</span>
          </button>

          <button
            onClick={() => handleFetchRoast('random')}
            disabled={loading}
            className="btn-3d p-3.5 rounded-2xl bg-gradient-to-br from-rose-950/40 to-[#161b22] hover:from-rose-900/40 border border-rose-500/40 flex flex-col items-center text-center cursor-pointer group transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-2 group-hover:scale-110 transition-transform">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Skull className="w-5 h-5" />}
            </div>
            <span className="text-xs font-black text-rose-200">Surprise Savage</span>
            <span className="text-[10px] text-rose-300 mt-0.5">Full Comedic Blast</span>
          </button>
        </div>
      </div>

      {/* Constructive Advice Card */}
      <div className="w-full bg-[#161b22] border border-slate-800 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-2xl bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
          <Award className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-xs font-black uppercase tracking-wider text-teal-400">
            Viper's Secret Redemption Wisdom
          </h4>
          <p className="text-sm text-slate-200 mt-1 leading-relaxed">
            "{currentRoast.advice}"
          </p>
          {onOpenSRSDeck && (
            <button
              onClick={onOpenSRSDeck}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-teal-400 hover:text-teal-300 hover:underline cursor-pointer"
            >
              <span>Review SRS Weak Words Now</span>
              <span>→</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
