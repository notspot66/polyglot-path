import React, { useState } from 'react';
import { UserStats, Quest, Achievement } from '../types';
import { INITIAL_QUESTS, INITIAL_ACHIEVEMENTS } from '../utils/storage';
import { sound } from '../utils/audio';
import { Target, Gift, Sparkles, Check, Gem } from 'lucide-react';

interface QuestsViewProps {
  userStats: UserStats;
  onClaimQuestReward: (questId: string, gems: number) => void;
  onClaimAchievementReward: (achId: string, gems: number) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({
  userStats,
  onClaimQuestReward,
  onClaimAchievementReward,
}) => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    return INITIAL_QUESTS.map((q) => {
      // Sync with user's actual progress
      if (q.id === 'q1') {
        const current = Math.min(q.target, userStats.totalXp % 100);
        return { ...q, current, isCompleted: current >= q.target };
      }
      return q;
    });
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const handleClaim = (quest: Quest) => {
    sound.playGems();
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, isClaimed: true } : q))
    );
    onClaimQuestReward(quest.id, quest.gemReward);
  };

  const handleClaimAch = (ach: Achievement) => {
    sound.playGems();
    setAchievements((prev) =>
      prev.map((a) => (a.id === ach.id ? { ...a, unlocked: true } : a))
    );
    onClaimAchievementReward(ach.id, ach.rewardGems);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 px-4 pb-28">
      {/* Monthly Challenge Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white shadow-xl mb-8 flex items-center justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-amber-100 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Monthly Challenge</span>
          </div>
          <h2 className="text-2xl font-black">November Lingoverse Odyssey</h2>
          <p className="text-xs text-amber-100 font-medium mt-1">
            Complete 20 daily quests this month to unlock the exclusive Polyglot Explorer badge!
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-3.5 bg-black/20 rounded-full overflow-hidden p-0.5 max-w-xs">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: '65%' }} />
            </div>
            <span className="text-xs font-black">13 / 20</span>
          </div>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl shadow-inner shrink-0">
          🏅
        </div>
      </div>

      {/* Daily Quests Section */}
      <section className="w-full mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-white">
            Daily Quests
          </h3>
          <span className="text-xs font-bold text-slate-400">Resets in 16 hours</span>
        </div>

        <div className="flex flex-col gap-3">
          {quests.map((quest) => {
            const percent = Math.min(100, (quest.current / quest.target) * 100);
            return (
              <div
                key={quest.id}
                className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
                    {quest.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-white leading-tight">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {quest.description}
                    </p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-[#0d1117] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-400 tabular-nums">
                        {quest.current} / {quest.target}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="shrink-0">
                  {quest.isClaimed ? (
                    <span className="px-3.5 py-1.5 rounded-xl bg-[#21262d] text-slate-400 text-xs font-black uppercase flex items-center gap-1 border border-slate-700">
                      <Check className="w-3.5 h-3.5" /> Claimed
                    </span>
                  ) : quest.isCompleted ? (
                    <button
                      onClick={() => handleClaim(quest)}
                      className="btn-3d px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md border-b-2 border-emerald-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Gift className="w-4 h-4" /> Claim +{quest.gemReward} 💎
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-black text-slate-400">
                      <Gem className="w-4 h-4 fill-sky-400 text-sky-500" />
                      <span>{quest.gemReward}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Polyglot Achievements Gallery */}
      <section className="w-full">
        <h3 className="text-lg font-black text-white mb-4">
          Polyglot Achievements
        </h3>

        <div className="flex flex-col gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-5 rounded-2xl bg-[#161b22] border border-slate-800 shadow-sm flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/40 border border-purple-500/20 flex items-center justify-center text-2xl shrink-0">
                  {ach.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-black text-amber-400">
                <span>+{ach.rewardGems} 💎</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
