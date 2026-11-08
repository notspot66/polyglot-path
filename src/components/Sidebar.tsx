import React from 'react';
import {
  Map,
  Sparkles,
  Swords,
  Globe2,
  Store,
  Award,
  Shield,
  Dumbbell,
  Trophy,
  User,
  LogIn,
  Coins,
  Brain,
  Flame,
  Zap,
  Smartphone,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { useFirebaseAuth } from '../firebase/AuthContext';

export type TabType =
  | 'learn'
  | 'ai-lounge'
  | 'roast'
  | 'dating'
  | 'trivia'
  | 'world'
  | 'clans'
  | 'certificates'
  | 'shop'
  | 'practice'
  | 'leaderboards'
  | 'quests'
  | 'profile';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenLanguagePicker: () => void;
  streakCount: number;
  totalLanguages: number;
  coins?: number;
  streakShields?: number;
  weakWordsCount?: number;
  onOpenSRSDeck?: () => void;
  onOpenLuckyWheel?: () => void;
  onOpenAvatarExporter?: () => void;
  onOpenLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenLanguagePicker,
  totalLanguages,
  coins = 1250,
  streakShields = 2,
  weakWordsCount = 0,
  onOpenSRSDeck,
  onOpenLuckyWheel,
  onOpenAvatarExporter,
  onOpenLogin,
}) => {
  const { user } = useFirebaseAuth();

  const primaryNavItems: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    { id: 'learn', label: 'Learn', icon: <Map className="w-5 h-5" /> },
    {
      id: 'ai-lounge',
      label: 'AI Lounge',
      badge: 'VIP',
      badgeColor: 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-xs',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'roast',
      label: 'Roast Club',
      badge: 'AI 🔥',
      badgeColor: 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black shadow-xs',
      icon: <Flame className="w-5 h-5 text-rose-500 animate-pulse" />,
    },
    {
      id: 'dating',
      label: 'Speed Dating',
      badge: 'Live 10m',
      badgeColor: 'bg-cyan-500 text-slate-950 font-black',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'trivia',
      label: 'Trivia Arena',
      badge: '1v1',
      badgeColor: 'bg-rose-500 text-white font-black',
      icon: <Swords className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'world',
      label: 'Living World',
      badge: '3D',
      badgeColor: 'bg-emerald-400 text-slate-950 font-black',
      icon: <Globe2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'clans',
      label: 'Clans & Guilds',
      badge: 'Squad',
      badgeColor: 'bg-cyan-500 text-slate-950 font-black',
      icon: <Shield className="w-5 h-5 text-cyan-400" />,
    },
    {
      id: 'certificates',
      label: 'Certificates',
      badge: 'CEFR',
      badgeColor: 'bg-purple-500 text-white font-black',
      icon: <Award className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'shop',
      label: 'Panda Shop',
      icon: <Store className="w-5 h-5 text-teal-400" />,
    },
    {
      id: 'practice',
      label: 'Practice Hub',
      icon: <Dumbbell className="w-5 h-5 text-slate-300" />,
    },
    {
      id: 'leaderboards',
      label: 'Leagues',
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5 text-slate-300" />,
    },
  ];

  return (
    <>
      {/* Desktop / Tablet Vertical Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 border-r border-slate-800/80 bg-[#0d1117] text-slate-100 min-h-screen px-3 py-4 shrink-0 sticky top-0 h-screen overflow-y-auto z-20">
        {/* Brand Lockup */}
        <div
          className="flex items-center gap-3 px-2 py-2 mb-4 cursor-pointer select-none group"
          onClick={() => onTabChange('learn')}
        >
          <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg border-2 border-teal-500/50 shrink-0 bg-slate-900 group-hover:scale-105 transition-transform">
            <img
              src="/src/assets/images/cyber_fox_logo_1794128107518.jpg"
              alt="Lingoverse Mascot"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-300 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
              Lingoverse
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {totalLanguages}+ World Courses
            </span>
          </div>
        </div>

        {/* 500+ Languages Explorer Button Banner */}
        <div className="mb-3 px-1">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLanguagePicker();
            }}
            className="btn-3d w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-teal-700 via-teal-800 to-cyan-900 text-white shadow-md border-b-2 border-teal-950 cursor-pointer text-left group hover:brightness-110 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Globe2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-teal-200">
                  Switch Course
                </span>
                <span className="block text-xs font-extrabold leading-tight">
                  500+ Languages
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-bold">
              Explore
            </span>
          </button>
        </div>

        {/* Quick Micro-Wallet & SRS Counter Bar */}
        <div className="grid grid-cols-3 gap-1.5 px-1 mb-3">
          {/* Coins */}
          <button
            onClick={() => onTabChange('trivia')}
            className="flex flex-col items-center p-1.5 rounded-xl bg-[#161b22] border border-amber-500/20 hover:border-amber-500/40 transition-colors text-center cursor-pointer"
            title="Arena Wager Coins"
          >
            <div className="flex items-center gap-1 text-[11px] font-black text-amber-400">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins.toLocaleString()}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Coins</span>
          </button>

          {/* Shields */}
          <button
            onClick={() => onTabChange('shop')}
            className="flex flex-col items-center p-1.5 rounded-xl bg-[#161b22] border border-sky-500/20 hover:border-sky-500/40 transition-colors text-center cursor-pointer"
            title="Streak Shields (Auto-Protects Streak)"
          >
            <div className="flex items-center gap-1 text-[11px] font-black text-sky-400">
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>{streakShields}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Shields</span>
          </button>

          {/* SRS Deck */}
          <button
            onClick={() => {
              if (onOpenSRSDeck) onOpenSRSDeck();
              else onTabChange('practice');
            }}
            className="flex flex-col items-center p-1.5 rounded-xl bg-[#161b22] border border-emerald-500/20 hover:border-emerald-500/40 transition-colors text-center cursor-pointer"
            title="Weak Words Spaced Repetition Deck"
          >
            <div className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
              <Brain className="w-3.5 h-3.5 text-emerald-400" />
              <span>{weakWordsCount}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Weak SRS</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1 flex-1 pr-1 overflow-y-auto">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  onTabChange(item.id);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-950/70 to-emerald-950/40 text-teal-300 border border-teal-500/50 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                <span className="uppercase tracking-wider font-black flex-1 text-left text-[11px]">
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      item.badgeColor || 'bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Launchers: Lucky Wheel & AR Reels Studio */}
        <div className="grid grid-cols-2 gap-1.5 mt-2 px-1">
          {onOpenLuckyWheel && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLuckyWheel();
              }}
              className="btn-3d flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-[11px] border-b-2 border-amber-900 shadow-sm cursor-pointer"
            >
              <span>🎡 Spin Wheel</span>
            </button>
          )}

          {onOpenAvatarExporter && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAvatarExporter();
              }}
              className="btn-3d flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-700 hover:from-cyan-500 hover:to-teal-600 text-white font-extrabold text-[11px] border-b-2 border-cyan-950 shadow-sm cursor-pointer"
            >
              <span>📱 AR Reels</span>
            </button>
          )}
        </div>

        {/* Bottom Mascot Tip & Guest Login CTA */}
        <div className="mt-2 flex flex-col gap-2 pt-2 border-t border-slate-800/80">
          {!user && onOpenLogin && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenLogin();
              }}
              className="btn-3d w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 border-teal-800 cursor-pointer shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In / Sign Up</span>
            </button>
          )}

          <div className="p-2.5 bg-[#161b22] border border-slate-800 rounded-xl text-center">
            <p className="text-[11px] text-slate-300 font-medium leading-snug">
              "Master vocabulary via daily streaks and 1v1 Arena clashes."
            </p>
            <span className="block text-[10px] font-extrabold text-teal-400 mt-1">
              — Lingoverse Cyber Fox 🦊
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Scrollable horizontally) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d1117]/95 backdrop-blur-md border-t border-slate-800 flex items-center overflow-x-auto px-2 py-1.5 no-scrollbar gap-1">
        {primaryNavItems.slice(0, 6).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                onTabChange(item.id);
              }}
              className={`flex flex-col items-center shrink-0 min-w-[56px] py-1 px-1 rounded-lg transition-all cursor-pointer ${
                isActive
                  ? 'text-teal-400 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg relative ${isActive ? 'bg-teal-950/70 text-teal-300' : ''}`}>
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 text-[7px] font-black px-1 rounded bg-teal-400 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </button>
          );
        })}
        {/* More Tab Button for mobile */}
        <button
          onClick={() => {
            sound.playClick();
            onTabChange('profile');
          }}
          className={`flex flex-col items-center shrink-0 min-w-[56px] py-1 px-1 rounded-lg transition-all cursor-pointer ${
            activeTab === 'profile' || activeTab === 'shop'
              ? 'text-teal-400 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="p-1 rounded-lg">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tight">More</span>
        </button>
      </nav>
    </>
  );
};
