import React, { useState } from 'react';
import { UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import {
  Volume2,
  VolumeX,
  Flame,
  Heart,
  Gem,
  Coins,
  Shield,
  Brain,
  Sparkles,
  Moon,
  Sun,
  LogIn,
  LogOut,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useFirebaseAuth } from '../firebase/AuthContext';

interface HeaderProps {
  userStats: UserStats;
  currentLanguage: Language;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenLanguagePicker: () => void;
  onOpenShop: () => void;
  onOpenPractice: () => void;
  onOpenSRSDeck?: () => void;
  onOpenArena?: () => void;
  onOpenLuckyWheel?: () => void;
  onOpenAvatarExporter?: () => void;
  onToggleSound: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userStats,
  currentLanguage,
  isDark,
  onToggleTheme,
  onOpenLanguagePicker,
  onOpenShop,
  onOpenPractice,
  onOpenSRSDeck,
  onOpenArena,
  onOpenLuckyWheel,
  onOpenAvatarExporter,
  onToggleSound,
  onOpenLogin,
}) => {
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showHeartsModal, setShowHeartsModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const { user, isSyncing, isSigningIn, authError, clearAuthError, signInWithGoogle, signOutUser } = useFirebaseAuth();

  return (
    <>
      {authError && (
        <div className="bg-amber-950/90 border-b border-amber-600/50 px-4 py-2 text-xs text-amber-200 flex items-center justify-between z-40 relative">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{authError}</span>
          </div>
          <button
            onClick={clearAuthError}
            className="p-1 hover:bg-amber-900/50 rounded-md cursor-pointer text-amber-300"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3 bg-[#0d1117]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
        {/* Left: Language Course Quick Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLanguagePicker();
            }}
            className="btn-3d flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-700/60 bg-[#161b22] hover:bg-[#21262d] text-slate-100 font-bold text-sm shadow-xs transition-all cursor-pointer"
            title="Explore 500+ Languages"
          >
            <span className="text-xl leading-none">{currentLanguage.flag}</span>
            <div className="flex flex-col text-left">
              <span className="leading-tight font-extrabold text-xs text-emerald-400">
                {currentLanguage.name}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                {currentLanguage.nativeName}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800">
              500+
            </span>
          </button>
        </div>

        {/* Center / Right: Gamified Resource Counters & Firebase Account */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Streak Flame & Shield Counter */}
          <button
            onClick={() => {
              sound.playClick();
              setShowStreakModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-amber-950/40 text-amber-400 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
            title="Day Streak & Automated Shields"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500 animate-pulse" />
            <span className="tabular-nums tracking-tight">{userStats.streak}</span>
            {userStats.streakShields > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-black bg-sky-950/90 text-sky-400 border border-sky-600/40 px-1.5 py-0.5 rounded-md" title={`${userStats.streakShields} Streak Shields Active`}>
                <Shield className="w-2.5 h-2.5 fill-sky-400 text-sky-400" />
                <span>{userStats.streakShields}</span>
              </span>
            )}
          </button>

          {/* Arena Coins Counter */}
          <button
            onClick={() => {
              sound.playClick();
              if (onOpenArena) onOpenArena();
              else onOpenShop();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-amber-950/40 text-amber-300 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
            title="Trivia Arena Wager Coins"
          >
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="tabular-nums tracking-tight">{(userStats.coins || 0).toLocaleString()}</span>
          </button>

          {/* Gems Counter */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-sky-950/40 text-sky-400 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
            title="Lingoverse Gems"
          >
            <Gem className="w-4 h-4 sm:w-5 sm:h-5 fill-sky-400 text-sky-400" />
            <span className="tabular-nums tracking-tight">{userStats.gems}</span>
          </button>

          {/* SRS Weak Words Quick Review Button */}
          {onOpenSRSDeck && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenSRSDeck();
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-emerald-500/40 text-emerald-400 font-extrabold text-xs transition-all cursor-pointer shadow-xs"
              title="Spaced Repetition Weak Words Deck"
            >
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>Review SRS</span>
              {userStats.weakWordsDeck?.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                  {userStats.weakWordsDeck.length}
                </span>
              )}
            </button>
          )}

          {/* Hearts Life Meter */}
          <button
            onClick={() => {
              sound.playClick();
              setShowHeartsModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-rose-950/40 text-rose-400 font-extrabold text-xs sm:text-sm transition-colors cursor-pointer"
            title="Lives & Practice"
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-500 text-rose-500" />
            <span className="tabular-nums tracking-tight">{userStats.hearts}</span>
          </button>

          {/* Lucky Wheel Quick Spin */}
          {onOpenLuckyWheel && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLuckyWheel();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title="Daily Lucky Fortune Wheel"
            >
              <span className="text-sm">🎡</span>
              <span className="hidden xl:inline">Spin</span>
            </button>
          )}

          {/* AR Avatar Reels Studio */}
          {onOpenAvatarExporter && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAvatarExporter();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title="Export 9:16 AR Social Reel"
            >
              <span className="text-sm">📱</span>
              <span className="hidden xl:inline">AR Reels</span>
            </button>
          )}

          {/* Theme Switcher Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleTheme();
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#161b22] border border-slate-800 transition-colors cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.enabled = !userStats.soundEnabled;
              onToggleSound();
              if (sound.enabled) sound.playClick();
            }}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#161b22] border border-slate-800 transition-colors cursor-pointer"
            title={userStats.soundEnabled ? 'Mute Game Sounds' : 'Unmute Game Sounds'}
          >
            {userStats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Firebase Google Auth & Cloud Sync */}
          {user ? (
            <button
              onClick={() => {
                sound.playClick();
                setShowAccountModal(true);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-emerald-500/40 text-slate-100 font-bold text-xs transition-all cursor-pointer shadow-xs"
              title="Firebase Cloud Account"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full object-cover border border-emerald-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="hidden sm:inline max-w-[90px] truncate text-slate-200">
                {user.displayName?.split(' ')[0] || 'Learner'}
              </span>
              <div
                className={`w-2 h-2 rounded-full ${
                  isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
                title={isSyncing ? 'Syncing to Firestore...' : 'Synced to Firestore'}
              />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                if (onOpenLogin) {
                  onOpenLogin();
                } else {
                  signInWithGoogle();
                }
              }}
              disabled={isSigningIn}
              className="btn-3d flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs shadow-xs border-b-2 border-teal-800 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              title="Log in to Lingoverse account"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Firebase Cloud Account Details Modal */}
      {showAccountModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0d1117] text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800 text-center animate-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-emerald-400 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-black text-white border-2 border-emerald-400 shadow-md">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <h3 className="text-xl font-black text-white">{user.displayName || 'Lingoverse Learner'}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>

              <div className="my-5 p-3.5 bg-[#161b22] border border-slate-800 rounded-2xl w-full text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>Cloud Database</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Connected
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 leading-snug">
                  Progress, streaks, crowns, and gems are synchronized automatically to Firebase Firestore.
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={async () => {
                    await signOutUser();
                    setShowAccountModal(false);
                  }}
                  className="btn-3d w-full py-2.5 bg-[#21262d] hover:bg-[#30363d] text-rose-400 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak Info Modal */}
      {showStreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0d1117] text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center mb-3">
                <Flame className="w-10 h-10 fill-amber-500 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {userStats.streak} Day Streak!
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                You're building an unstoppable habit. Practice every day to keep your streak glowing!
              </p>

              {/* 7-Day Calendar Streak Dots */}
              <div className="grid grid-cols-7 gap-2 w-full my-6 p-3 bg-[#161b22] border border-slate-800 rounded-2xl">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">{day}</span>
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Flame className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Streak Freeze Badge */}
              <div className="flex items-center gap-3 p-3 w-full bg-sky-950/40 border border-sky-800/60 rounded-2xl mb-5 text-left">
                <Shield className="w-6 h-6 text-sky-400 shrink-0" />
                <div className="text-xs text-sky-300">
                  <span className="font-extrabold block">Streak Freeze Active</span>
                  Equipped from the PolyShop. Shields your streak if you miss a day!
                </div>
              </div>

              <button
                onClick={() => setShowStreakModal(false)}
                className="btn-3d w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-amber-700 cursor-pointer"
              >
                Continue Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hearts Info Modal */}
      {showHeartsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0d1117] text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-800">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center mb-3">
                <Heart className="w-10 h-10 fill-rose-500 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {userStats.hearts} / {userStats.maxHearts} Hearts
              </h3>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Hearts keep you attentive during lessons. Mistakes cost 1 heart, but practicing mistakes refuels them!
              </p>

              <div className="flex items-center justify-center gap-2 my-5">
                {[1, 2, 3, 4, 5].map((h) => (
                  <Heart
                    key={h}
                    className={`w-7 h-7 transition-all ${
                      h <= userStats.hearts
                        ? 'fill-rose-500 text-rose-500 scale-100'
                        : 'fill-slate-800 text-slate-700 scale-90'
                    }`}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={() => {
                    setShowHeartsModal(false);
                    onOpenPractice();
                  }}
                  className="btn-3d w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-emerald-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Practice to Refill (+1 Heart)
                </button>
                <button
                  onClick={() => {
                    setShowHeartsModal(false);
                    onOpenShop();
                  }}
                  className="btn-3d w-full py-3 bg-[#161b22] hover:bg-[#21262d] text-sky-400 font-extrabold rounded-2xl border border-slate-800 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Gem className="w-4 h-4 fill-sky-500" />
                  Buy Full Refill (350 Gems)
                </button>
                <button
                  onClick={() => setShowHeartsModal(false)}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-400 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
