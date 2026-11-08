import React, { useState, useRef, useEffect } from 'react';
import { UserStats } from '../types';
import { sound } from '../utils/audio';
import {
  X,
  Sparkles,
  Coins,
  Shield,
  Heart,
  Gem,
  Zap,
  Award,
  Crown,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface LuckyWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenShop: () => void;
}

interface WheelSegment {
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  accent: string;
  rewardType: 'gems' | 'coins' | 'shield' | 'hearts' | 'xp' | 'jackpot' | 'costume';
  amount: number;
}

const SEGMENTS: WheelSegment[] = [
  { label: '50 Gems', sublabel: 'Digital Jewels', icon: '💎', color: '#0369a1', accent: '#38bdf8', rewardType: 'gems', amount: 50 },
  { label: '300 Coins', sublabel: 'Arena Wager', icon: '🪙', color: '#b45309', accent: '#fbbf24', rewardType: 'coins', amount: 300 },
  { label: '+1 Shield', sublabel: 'Streak Guard', icon: '🛡️', color: '#0f766e', accent: '#2dd4bf', rewardType: 'shield', amount: 1 },
  { label: 'Full Hearts', sublabel: 'Max 5 Lives', icon: '❤️', color: '#be123c', accent: '#fb7185', rewardType: 'hearts', amount: 5 },
  { label: '100 XP', sublabel: 'League Boost', icon: '⚡', color: '#6d28d9', accent: '#c084fc', rewardType: 'xp', amount: 100 },
  { label: '750 Coins', sublabel: 'Big Bag', icon: '🪙', color: '#d97706', accent: '#fde047', rewardType: 'coins', amount: 750 },
  { label: '500 Gems', sublabel: 'MEGA JACKPOT', icon: '👑', color: '#e11d48', accent: '#fda4af', rewardType: 'jackpot', amount: 500 },
  { label: '150 Coins', sublabel: 'Gladiator Pot', icon: '⚔️', color: '#047857', accent: '#34d399', rewardType: 'coins', amount: 150 },
];

export const LuckyWheelModal: React.FC<LuckyWheelModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onUpdateUserStats,
  onOpenShop,
}) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonSegment, setWonSegment] = useState<WheelSegment | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  // Free spin daily tracking
  const [lastFreeSpinDate, setLastFreeSpinDate] = useState<string>(() => {
    return localStorage.getItem('lingoverse_last_free_spin') || '';
  });

  const isFreeSpinAvailable = () => {
    if (!lastFreeSpinDate) return true;
    const lastDate = new Date(lastFreeSpinDate);
    const now = new Date();
    // 20 hours cooldown
    return now.getTime() - lastDate.getTime() > 20 * 60 * 60 * 1000;
  };

  const freeAvailable = isFreeSpinAvailable();

  if (!isOpen) return null;

  const numSegments = SEGMENTS.length;
  const segmentAngle = 360 / numSegments;

  const handleSpin = (isFree: boolean) => {
    if (isSpinning) return;

    if (!isFree) {
      if (userStats.gems < 75) {
        sound.playWrong();
        return;
      }
      // Deduct 75 gems for extra spin
      onUpdateUserStats((prev) => ({ ...prev, gems: prev.gems - 75 }));
    }

    sound.playClick();
    setIsSpinning(true);
    setWonSegment(null);
    setShowPrizeModal(false);

    // Pick random segment (weighted slightly)
    const winningIndex = Math.floor(Math.random() * numSegments);
    const winningReward = SEGMENTS[winningIndex];

    // Calculate rotation: 5 full rotations (1800 deg) + offset to land precisely on the segment at top pointer (270 deg)
    const extraRotations = 360 * 5;
    // Pointer is at the top (90 deg or 270 deg depending on canvas orientation)
    // Pointer at 270 deg: Target angle = extraRotations + (360 - (winningIndex * segmentAngle + segmentAngle / 2))
    const targetAngle = rotation + extraRotations + (360 - ((winningIndex * segmentAngle + segmentAngle / 2) % 360));

    setRotation(targetAngle);

    // Play ticker audio ticks
    let tickCount = 0;
    const ticker = setInterval(() => {
      sound.playClick();
      tickCount++;
      if (tickCount > 18) clearInterval(ticker);
    }, 220);

    // Conclude spin after 4.5 seconds
    setTimeout(() => {
      setIsSpinning(false);
      setWonSegment(winningReward);
      setShowPrizeModal(true);
      sound.playGems();

      if (isFree) {
        const nowStr = new Date().toISOString();
        setLastFreeSpinDate(nowStr);
        localStorage.setItem('lingoverse_last_free_spin', nowStr);
      }

      // Award the reward
      onUpdateUserStats((prev) => {
        if (winningReward.rewardType === 'gems' || winningReward.rewardType === 'jackpot') {
          return { ...prev, gems: prev.gems + winningReward.amount };
        }
        if (winningReward.rewardType === 'coins') {
          return { ...prev, coins: (prev.coins || 0) + winningReward.amount };
        }
        if (winningReward.rewardType === 'shield') {
          return { ...prev, streakShields: (prev.streakShields || 0) + winningReward.amount };
        }
        if (winningReward.rewardType === 'hearts') {
          return { ...prev, hearts: prev.maxHearts };
        }
        if (winningReward.rewardType === 'xp') {
          return { ...prev, totalXp: prev.totalXp + winningReward.amount };
        }
        return prev;
      });
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0d1117] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col items-center text-center">
        {/* Glow ambient background */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/40 text-amber-300 font-extrabold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Daily Lingoverse Casino</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Lucky Fortune Wheel 🎡
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Spin the cyber wheel for rare streak shields, wager coins, and massive gem jackpots!
        </p>

        {/* Wheel Container */}
        <div className="relative my-6 w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="w-6 h-7 bg-gradient-to-b from-amber-300 to-amber-500 rounded-b-md shadow-lg clip-triangle border border-white/50 animate-bounce" />
          </div>

          {/* Glowing Wheel Outer Rim */}
          <div className="w-full h-full rounded-full p-2.5 bg-gradient-to-br from-amber-500 via-teal-500 to-cyan-600 shadow-[0_0_35px_rgba(245,158,11,0.3)] border-4 border-slate-900">
            {/* Spinning SVG Wheel */}
            <div
              className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4500ms] ease-out relative"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionTimingFunction: 'cubic-bezier(0.12, 0.8, 0.32, 1)',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {SEGMENTS.map((seg, i) => {
                  const angle = segmentAngle;
                  const startAngle = i * angle;
                  const endAngle = startAngle + angle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const textAngle = startAngle + angle / 2;
                  const tx = 50 + 32 * Math.cos((Math.PI * (textAngle - 90)) / 180);
                  const ty = 50 + 32 * Math.sin((Math.PI * (textAngle - 90)) / 180);

                  return (
                    <g key={i}>
                      <path
                        d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                        fill={seg.color}
                        stroke="#0d1117"
                        strokeWidth="1"
                      />
                      <text
                        x={tx}
                        y={ty}
                        fill="#ffffff"
                        fontSize="4"
                        fontWeight="900"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                      >
                        {seg.icon} {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Center Hub Button */}
          <button
            onClick={() => handleSpin(freeAvailable)}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center shadow-xl border-4 border-[#0d1117] hover:scale-105 active:scale-95 transition-transform cursor-pointer disabled:opacity-80"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span className="leading-tight mt-0.5">SPIN!</span>
          </button>
        </div>

        {/* Spin Actions Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          {freeAvailable ? (
            <button
              onClick={() => handleSpin(true)}
              disabled={isSpinning}
              className="btn-3d w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg border-b-4 border-emerald-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Free Daily Spin Available!</span>
            </button>
          ) : (
            <button
              onClick={() => handleSpin(false)}
              disabled={isSpinning || userStats.gems < 75}
              className="btn-3d w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg border-b-4 border-amber-800 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Gem className="w-4 h-4 fill-slate-950" />
              <span>Spin Again (75 Gems)</span>
            </button>
          )}
        </div>

        {/* Next Free Spin Timer Hint */}
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {freeAvailable
              ? 'Free daily spin ready to use now'
              : 'Next free daily spin unlocks tomorrow'}
          </span>
        </div>

        {/* Prize Notification Modal */}
        {showPrizeModal && wonSegment && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 p-6 animate-in zoom-in-95 duration-200">
            <div className="text-5xl mb-3 animate-bounce">{wonSegment.icon}</div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
              🎉 WINNER WINNER!
            </span>
            <h3 className="text-3xl font-black text-white">{wonSegment.label}</h3>
            <p className="text-xs text-slate-300 mt-1">{wonSegment.sublabel}</p>

            <div className="my-5 p-3 rounded-2xl bg-[#161b22] border border-amber-500/40 text-xs font-bold text-amber-300">
              Reward instantly deposited into your Lingoverse vault!
            </div>

            <button
              onClick={() => setShowPrizeModal(false)}
              className="btn-3d w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold rounded-xl shadow-md border-b-2 border-teal-800 cursor-pointer"
            >
              Claim & Keep Playing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
