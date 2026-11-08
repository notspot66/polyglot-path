import React, { useState } from 'react';
import { UserStats, Clan, ClanMember } from '../types';
import {
  Shield,
  Users,
  Trophy,
  Flame,
  Zap,
  Crown,
  MessageSquare,
  UserPlus,
  Send,
  Sparkles,
  Clock,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ClansViewProps {
  userStats: UserStats;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
}

const GLOBAL_CLANS: Clan[] = [
  {
    id: 'clan-neo-tokyo',
    name: 'Neo Tokyo Polyglots',
    tag: 'NEO',
    motto: 'Fluency at the speed of light ⚡',
    badge: '⚡',
    bannerColor: 'from-cyan-600 to-blue-700',
    totalWeeklyXp: 18450,
    rank: 1,
    memberCount: 10,
    maxMembers: 10,
    members: [],
  },
  {
    id: 'clan-latin-titans',
    name: 'Latin Titans',
    tag: 'TITAN',
    motto: 'Conquering Romance languages together 🏛️',
    badge: '🏛️',
    bannerColor: 'from-amber-600 to-orange-700',
    totalWeeklyXp: 16920,
    rank: 2,
    memberCount: 10,
    maxMembers: 10,
    members: [],
  },
  {
    id: 'clan-cyber-foxes',
    name: 'Cyber Foxes',
    tag: 'CFOX',
    motto: 'Learn fast, adapt faster 🦊',
    badge: '🦊',
    bannerColor: 'from-teal-600 to-emerald-700',
    totalWeeklyXp: 15340,
    rank: 3,
    memberCount: 8,
    maxMembers: 10,
    isUserClan: true,
    members: [
      { id: 'cm-1', name: 'Aria Vance', avatar: '🦊', weeklyXp: 2850, role: 'Leader' },
      { id: 'cm-2', name: 'You (Explorer)', avatar: '🐾', weeklyXp: 2150, role: 'Officer', isCurrentUser: true },
      { id: 'cm-3', name: 'Kenji Sato', avatar: '⚡', weeklyXp: 1980, role: 'Member' },
      { id: 'cm-4', name: 'Elena Rossi', avatar: '👑', weeklyXp: 1840, role: 'Member' },
      { id: 'cm-5', name: 'Mateo Silva', avatar: '🔥', weeklyXp: 1650, role: 'Member' },
      { id: 'cm-6', name: 'Sophie Martin', avatar: '🌟', weeklyXp: 1590, role: 'Member' },
      { id: 'cm-7', name: 'Liam Chen', avatar: '🚀', weeklyXp: 1420, role: 'Member' },
      { id: 'cm-8', name: 'Zara Al-Mansoor', avatar: '💎', weeklyXp: 1260, role: 'Member' },
    ],
  },
  {
    id: 'clan-seoul-strikers',
    name: 'Seoul Strikers',
    tag: 'KOR',
    motto: 'Always advancing our streaks 🐯',
    badge: '🐯',
    bannerColor: 'from-rose-600 to-pink-700',
    totalWeeklyXp: 13800,
    rank: 4,
    memberCount: 9,
    maxMembers: 10,
    members: [],
  },
];

export const ClansView: React.FC<ClansViewProps> = ({ userStats, onUpdateUserStats }) => {
  const [activeSubTab, setActiveSubTab] = useState<'my-clan' | 'leaderboard'>('my-clan');
  const [chatInput, setChatInput] = useState('');
  const [clanMessages, setClanMessages] = useState<
    { sender: string; avatar: string; text: string; time: string }[]
  >([
    { sender: 'Aria Vance (Leader)', avatar: '🦊', text: 'Great job everyone! We are holding Rank #3 in the Diamond League! 🏆', time: '10:14 AM' },
    { sender: 'Elena Rossi', avatar: '👑', text: 'Just completed 4 lessons in Spanish! +80 XP added to our pool.', time: '11:02 AM' },
    { sender: 'Kenji Sato', avatar: '⚡', text: 'Let’s surpass Latin Titans before Sunday midnight!', time: '11:45 AM' },
  ]);

  const userClan = GLOBAL_CLANS.find((c) => c.isUserClan) || GLOBAL_CLANS[2];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sound.playClick();
    setClanMessages((prev) => [
      ...prev,
      {
        sender: 'You',
        avatar: '🐾',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  const handleContributeXp = () => {
    sound.playFanfare();
    onUpdateUserStats((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 50,
      coins: (prev.coins || 0) + 25,
    }));
    userClan.totalWeeklyXp += 50;
    alert('Contributed +50 XP to your Clan pool! Earned 25 Arena Coins as team reward.');
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-6 px-4 pb-28">
      {/* Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-700 p-6 sm:p-7 text-white shadow-2xl mb-8 border border-teal-400/30 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-teal-200 border border-white/20 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal-300" />
                <span>CLANS & GUILDS (MAX 10 PLAYERS)</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">TEAM GUILDS</h1>
            <p className="text-xs sm:text-sm text-teal-100 font-semibold mt-1 max-w-xl leading-relaxed">
              Combine your weekly XP with a 10-player squad. Climb the global Clan Leaderboard to win huge weekly gem & coin rewards!
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-xs font-bold text-teal-200 block">Weekly War Ends In</span>
            <div className="flex items-center justify-center gap-1.5 text-xl font-black text-white mt-0.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>2d 14h 32m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: My Clan vs Global Leaderboard */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('my-clan');
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'my-clan'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#161b22] text-slate-300 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>My Clan ({userClan.name})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('leaderboard');
          }}
          className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'leaderboard'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-[#161b22] text-slate-300 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Global Clan Rankings</span>
        </button>
      </div>

      {/* TAB 1: MY CLAN DASHBOARD */}
      {activeSubTab === 'my-clan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Clan Card & Roster (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clan Card */}
            <div className="bg-[#161b22] rounded-3xl p-6 border border-slate-800 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-3xl shadow-lg shadow-teal-900/30">
                    {userClan.badge}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">{userClan.name}</h2>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        [{userClan.tag}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-0.5">{userClan.motto}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-bold text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Trophy className="w-3.5 h-3.5" /> Rank #{userClan.rank} Global
                      </span>
                      <span>•</span>
                      <span className="text-teal-300">
                        {userClan.members.length} / {userClan.maxMembers} Members
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContributeXp}
                  className="btn-3d px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border-b-2 border-amber-700 shadow-md shrink-0"
                >
                  <Zap className="w-4 h-4" />
                  <span>Contribute +50 XP</span>
                </button>
              </div>

              {/* Weekly XP Bar */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-400">Total Squad XP This Week</span>
                  <span className="text-white font-black tabular-nums">{userClan.totalWeeklyXp} XP</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: '82%' }}
                  />
                </div>
              </div>
            </div>

            {/* Member Roster (10 Players Max) */}
            <div className="bg-[#161b22] rounded-3xl p-6 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  <h3 className="text-lg font-black text-white">Squad Roster ({userClan.members.length}/10)</h3>
                </div>
                <span className="text-xs font-bold text-slate-400">Sorted by weekly XP</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {userClan.members.map((member, mIdx) => (
                  <div key={member.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500 w-4">{mIdx + 1}</span>
                      <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${member.isCurrentUser ? 'text-teal-400' : 'text-white'}`}>
                            {member.name}
                          </span>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            member.role === 'Leader'
                              ? 'bg-amber-500/20 text-amber-300'
                              : member.role === 'Officer'
                              ? 'bg-teal-500/20 text-teal-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-semibold">{member.weeklyXp} XP contributed</span>
                      </div>
                    </div>

                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Active today" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Live Clan Chat Wall */}
          <div className="bg-[#161b22] rounded-3xl border border-slate-800 shadow-xl flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <h4 className="text-sm font-black text-white">Clan Chat Room</h4>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">● 5 Online</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {clanMessages.map((msg, idx) => (
                <div key={idx} className="bg-[#0d1117] p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-teal-300 flex items-center gap-1.5">
                      <span>{msg.avatar}</span>
                      <span>{msg.sender}</span>
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 font-medium leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 flex items-center gap-2 bg-[#0d1117]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Cheer your squad..."
                className="flex-1 px-3 py-2 bg-[#161b22] border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL CLAN LEADERBOARD */}
      {activeSubTab === 'leaderboard' && (
        <div className="w-full bg-[#161b22] rounded-3xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-black text-white">Global Diamond League Clan Standings</h3>
              <p className="text-xs text-slate-400 font-medium">Top 3 squads earn 500 Gems and exclusive Clan Badges every Sunday</p>
            </div>
            <span className="text-xs font-black text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              Season 14
            </span>
          </div>

          <div className="space-y-3">
            {GLOBAL_CLANS.map((clan) => (
              <div
                key={clan.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  clan.isUserClan
                    ? 'bg-teal-950/30 border-teal-500/60 shadow-lg'
                    : 'bg-[#0d1117] border-slate-800'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                    clan.rank === 1
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : clan.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : clan.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {clan.rank}
                  </div>

                  <div className="text-2xl">{clan.badge}</div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">{clan.name}</span>
                      <span className="text-[10px] font-bold text-slate-400">[{clan.tag}]</span>
                      {clan.isUserClan && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-teal-500 text-slate-950">
                          YOUR CLAN
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{clan.motto}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-emerald-400 tabular-nums">
                    {clan.totalWeeklyXp} XP
                  </span>
                  <span className="text-[11px] text-slate-400 block">{clan.memberCount}/10 Members</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
