import React from 'react';
import { UserStats, Language } from '../types';
import { ALL_LANGUAGES } from '../data/languages';
import {
  Flame,
  Trophy,
  Gem,
  Crown,
  Globe2,
  Sparkles,
  Award,
  Cloud,
  CheckCircle2,
  LogIn,
  LogOut,
  Loader2,
  Shield,
  Coins,
  Brain,
  Swords,
  Users,
} from 'lucide-react';
import { useFirebaseAuth } from '../firebase/AuthContext';

interface ProfileViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenLanguagePicker: () => void;
  onOpenSRSDeck?: () => void;
  onOpenClans?: () => void;
  onOpenLogin?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userStats,
  currentLanguage,
  onSelectLanguage,
  onOpenLanguagePicker,
  onOpenSRSDeck,
  onOpenClans,
  onOpenLogin,
}) => {
  const activeLangKeys = Object.keys(userStats.languageProgress);
  const activeLanguages = ALL_LANGUAGES.filter((l) => activeLangKeys.includes(l.id));
  const { user, isSyncing, isSigningIn, signInWithGoogle, signOutUser } = useFirebaseAuth();

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 px-4 pb-28">
      {/* Profile Header Avatar */}
      <div className="w-full bg-[#161b22] rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md mb-8 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="relative w-24 h-24 rounded-3xl overflow-hidden shadow-lg border-4 border-emerald-500/30 shrink-0">
          <img
            src={user?.photoURL || '/src/assets/images/polypanda_mascot_logo_1794049862453.jpg'}
            alt="Pao Profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-black text-white">
              {user?.displayName || 'Polyglot Explorer'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-extrabold border border-emerald-500/40">
              {user ? 'Verified Learner' : 'Guest Learner'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {user ? user.email : 'Local session'} · Learning across {activeLanguages.length} world course{activeLanguages.length > 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs font-bold text-slate-300">
            <span className="px-2.5 py-1 rounded-xl bg-[#0d1117] border border-slate-800">
              Active: {currentLanguage.name} {currentLanguage.flag}
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-[#0d1117] border border-slate-800">
              League: {userStats.league}
            </span>
          </div>
        </div>
      </div>

      {/* Firebase Cloud Sync Card */}
      <div className="w-full bg-[#161b22] rounded-3xl p-5 border border-slate-800 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-sm font-black text-white">Firebase Cloud Sync</h3>
              {user ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> {isSyncing ? 'Syncing...' : 'Active'}
                </span>
              ) : (
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                  Offline / Local
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {user
                ? `Signed in as ${user.email}. Progress is securely synced to Firestore.`
                : 'Sign in with Google to backup your streak, gems, crowns, and lesson progress across devices.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          {user ? (
            <button
              onClick={signOutUser}
              className="btn-3d w-full sm:w-auto px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-rose-400 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                  else signInWithGoogle();
                }}
                className="btn-3d flex-1 sm:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border-b-2 border-teal-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogIn className="w-4 h-4" /> Log In / Register
              </button>
              <button
                onClick={signInWithGoogle}
                disabled={isSigningIn}
                className="btn-3d flex-1 sm:flex-initial px-4 py-2.5 bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                title="Google 1-click login"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Google</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics 4-Card Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
        <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
            <Flame className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="text-2xl font-black text-white tabular-nums">
            {userStats.streak}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Day Streak
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
            <Crown className="w-5 h-5 fill-amber-500" />
          </div>
          <span className="text-2xl font-black text-white tabular-nums">
            {Object.values(userStats.languageProgress).reduce((acc, curr) => acc + (curr.crowns || 0), 0) || 1}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Crowns
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-sky-950/40 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-2">
            <Gem className="w-5 h-5 fill-sky-500" />
          </div>
          <span className="text-2xl font-black text-white tabular-nums">
            {userStats.gems}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Gems
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#161b22] border border-slate-800 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white tabular-nums">
            {userStats.totalXp}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
            Total XP
          </span>
        </div>
      </div>

      {/* Advanced Billionaire Gamification Metrics Grid */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-8">
        {/* Arena Coins */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161b22] to-amber-950/20 border border-amber-500/30 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
            <Coins className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-amber-300 tabular-nums">
            {(userStats.coins || 0).toLocaleString()}
          </span>
          <span className="text-[11px] font-extrabold text-amber-400/80 uppercase tracking-tight mt-0.5">
            Wager Coins
          </span>
        </div>

        {/* Streak Shields */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#161b22] to-sky-950/20 border border-sky-500/30 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-2">
            <Shield className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-sky-300 tabular-nums">
            {userStats.streakShields || 0}
          </span>
          <span className="text-[11px] font-extrabold text-sky-400/80 uppercase tracking-tight mt-0.5">
            Auto-Shields
          </span>
        </div>

        {/* SRS Weak Words Deck */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-[#161b22] to-emerald-950/20 border border-emerald-500/30 shadow-xs flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
            <Brain className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-emerald-300 tabular-nums">
            {userStats.weakWordsDeck?.length || 0}
          </span>
          <span className="text-[11px] font-extrabold text-emerald-400/80 uppercase tracking-tight mt-0.5">
            Weak Words SRS
          </span>
        </div>
      </div>

      {/* Clan Banner Card */}
      <div className="w-full p-4 rounded-2xl bg-[#161b22] border border-cyan-500/40 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-2xl">
            🦊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">Active Clan</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-400 text-slate-950 uppercase">Diamond League</span>
            </div>
            <h4 className="text-base font-black text-white">Cyber Foxes [FOX]</h4>
            <p className="text-xs text-slate-400">10 / 10 Members · Rank #3 Global Leaderboard</p>
          </div>
        </div>
        {onOpenSRSDeck && (
          <button
            onClick={onOpenSRSDeck}
            className="btn-3d w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md border-b-2 border-teal-800 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Brain className="w-4 h-4" />
            <span>Practice Weak Words</span>
          </button>
        )}
      </div>

      {/* Active Courses List */}
      <section className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">
            My Language Courses
          </h3>
          <button
            onClick={onOpenLanguagePicker}
            className="text-xs font-extrabold text-emerald-400 hover:underline cursor-pointer"
          >
            + Add Language (500+)
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {activeLanguages.map((lang) => {
            const isCurrent = lang.id === currentLanguage.id;
            const progress = userStats.languageProgress[lang.id] || { crowns: 0, xp: 0 };

            return (
              <div
                key={lang.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500/70 shadow-xs'
                    : 'bg-[#161b22] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <h4 className="text-sm font-black text-white">
                      {lang.name}
                    </h4>
                    <span className="text-xs text-slate-400 font-semibold">
                      {lang.nativeName} · {progress.crowns || 1} Crowns · {progress.xp || 45} XP
                    </span>
                  </div>
                </div>

                {isCurrent ? (
                  <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
                    Current
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectLanguage(lang)}
                    className="btn-3d px-3 py-1 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-slate-200 font-extrabold text-xs cursor-pointer border border-slate-700"
                  >
                    Switch
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
