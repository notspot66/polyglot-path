import React, { useState, useEffect } from 'react';
import { UserStats, LeaderboardUser } from '../types';
import { Trophy, Flame, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';

interface LeaderboardViewProps {
  userStats: UserStats;
}

const mockLearners: LeaderboardUser[] = [
  { id: 'u1', name: 'Sofia Rodriguez', avatar: '👩‍🎨', xp: 890, rank: 1, flag: '🇪🇸' },
  { id: 'u2', name: 'Kenji Sato', avatar: '🧑‍💻', xp: 820, rank: 2, flag: '🇯🇵' },
  { id: 'u3', name: 'Amara Diallo', avatar: '👩‍⚕️', xp: 760, rank: 3, flag: '🇸🇳' },
  { id: 'u4', name: 'Lucas Dubois', avatar: '👨‍🍳', xp: 710, rank: 4, flag: '🇫🇷' },
  { id: 'u5', name: 'Elena Petrova', avatar: '👩‍🏫', xp: 680, rank: 5, flag: '🇺🇦' },
  { id: 'u6', name: 'Matteo Rossi', avatar: '👨‍🎤', xp: 620, rank: 6, flag: '🇮🇹' },
  { id: 'u7', name: 'Aarav Sharma', avatar: '🧑‍🔬', xp: 580, rank: 7, flag: '🇮🇳' },
  { id: 'u8', name: 'Chloe Dubois', avatar: '👩‍🌾', xp: 510, rank: 8, flag: '🇨🇦' },
  { id: 'u9', name: 'Tariq Al-Mansoor', avatar: '🧑‍✈️', xp: 470, rank: 9, flag: '🇦🇪' },
  { id: 'u10', name: 'Ingrid Lindholm', avatar: '👩‍💼', xp: 420, rank: 10, flag: '🇸🇪' },
  { id: 'u11', name: 'Diego Morales', avatar: '🧑‍🎨', xp: 390, rank: 11, flag: '🇲🇽' },
  { id: 'u12', name: 'Fatima Zahra', avatar: '👩‍💻', xp: 350, rank: 12, flag: '🇲🇦' },
  { id: 'u13', name: 'Sven Becker', avatar: '👨‍🔧', xp: 310, rank: 13, flag: '🇩🇪' },
  { id: 'u14', name: 'Nia Williams', avatar: '👩‍🎤', xp: 280, rank: 14, flag: '🇿🇦' },
  { id: 'u15', name: 'Ji-hoon Park', avatar: '🧑‍🎓', xp: 240, rank: 15, flag: '🇰🇷' },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userStats }) => {
  // Insert current user into the ranking based on total XP
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const currentUser: LeaderboardUser = {
      id: 'current_user',
      name: 'You (Pao Explorer)',
      avatar: '🐾',
      xp: userStats.totalXp,
      rank: 1,
      isCurrentUser: true,
      flag: '🌟',
    };

    const combined = [...mockLearners, currentUser]
      .sort((a, b) => b.xp - a.xp)
      .map((item, idx) => ({ ...item, rank: idx + 1 }));

    setLeaderboard(combined);
  }, [userStats.totalXp]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 px-4 pb-28">
      {/* League Header Card */}
      <div className="w-full rounded-3xl bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 p-6 text-white shadow-xl mb-8 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30 shrink-0 bg-white">
          <img
            src="/src/assets/images/diamond_league_trophy_1794049863759.jpg"
            alt="League Trophy"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-rose-200">
              Weekly League
            </span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
              2d 14h Left
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Ruby League</h2>
          <p className="text-xs sm:text-sm text-rose-100 font-medium mt-1">
            Top 7 learners promote to the elite <strong>Diamond League</strong>!
          </p>
        </div>
      </div>

      {/* Promotion / Demotion Rules */}
      <div className="flex items-center justify-between w-full px-4 py-2.5 bg-[#161b22] border border-slate-800 rounded-2xl mb-4 text-xs font-extrabold text-emerald-400">
        <div className="flex items-center gap-1.5">
          <ChevronUp className="w-4 h-4 text-emerald-400" />
          <span>Top 7 Advance to Diamond League</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <ChevronDown className="w-4 h-4 text-rose-500" />
          <span className="text-rose-400">Bottom 3 Demote</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="w-full bg-[#0d1117] rounded-3xl border border-slate-800 shadow-md overflow-hidden">
        {leaderboard.map((user) => {
          const isPromotion = user.rank <= 7;
          const isDemotion = user.rank > leaderboard.length - 3;

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 transition-colors ${
                user.isCurrentUser
                  ? 'bg-amber-950/40 border-l-4 border-l-amber-400 font-black'
                  : 'hover:bg-[#161b22]'
              }`}
            >
              {/* Left Rank & Avatar */}
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 text-center font-black text-sm ${
                    user.rank === 1
                      ? 'text-amber-400 text-lg'
                      : user.rank === 2
                      ? 'text-slate-300 text-lg'
                      : user.rank === 3
                      ? 'text-amber-600 text-lg'
                      : 'text-slate-500'
                  }`}
                >
                  {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                </span>

                <div className="w-10 h-10 rounded-2xl bg-[#161b22] flex items-center justify-center text-xl shrink-0 shadow-xs border border-slate-800">
                  {user.avatar}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-extrabold text-white">
                      {user.name}
                    </span>
                    <span className="text-xs">{user.flag}</span>
                  </div>
                  {user.isCurrentUser && (
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      You are in the Promotion Zone!
                    </span>
                  )}
                </div>
              </div>

              {/* Right XP Score */}
              <div className="text-right">
                <span className="text-sm font-black text-slate-100 tabular-nums">
                  {user.xp} XP
                </span>
                {isPromotion && user.rank <= 7 && (
                  <span className="block text-[10px] font-bold text-emerald-400">
                    Promoting ↑
                  </span>
                )}
                {isDemotion && (
                  <span className="block text-[10px] font-bold text-rose-400">
                    Danger ↓
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
