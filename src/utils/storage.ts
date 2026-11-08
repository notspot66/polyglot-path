import { UserStats, Quest, Achievement, Exercise, WeakWord } from '../types';

const STORAGE_KEY = 'polypanda_user_state_v1';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Earn 30 XP Today',
    description: 'Complete lessons or practice sessions',
    current: 0,
    target: 30,
    gemReward: 20,
    isCompleted: false,
    isClaimed: false,
    icon: '⚡',
  },
  {
    id: 'q2',
    title: 'Score 100% in 1 Lesson',
    description: 'Get every exercise right without losing a heart',
    current: 0,
    target: 1,
    gemReward: 25,
    isCompleted: false,
    isClaimed: false,
    icon: '🎯',
  },
  {
    id: 'q3',
    title: 'Complete 3 Exercises in Word Bank',
    description: 'Assemble translated tiles correctly',
    current: 0,
    target: 3,
    gemReward: 15,
    isCompleted: false,
    isClaimed: false,
    icon: '🧩',
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_streak',
    title: 'Wildfire Streak',
    description: 'Reach a 3-day learning streak',
    icon: '🔥',
    progress: 3,
    target: 3,
    unlocked: true,
    rewardGems: 50,
  },
  {
    id: 'ach_polyglot',
    title: 'World Polyglot',
    description: 'Explore and start 3 or more distinct languages',
    icon: '🌐',
    progress: 1,
    target: 3,
    unlocked: false,
    rewardGems: 100,
  },
  {
    id: 'ach_sharpshooter',
    title: 'Sharp Shooter',
    description: 'Complete 5 lessons with 100% accuracy',
    icon: '🎯',
    progress: 2,
    target: 5,
    unlocked: false,
    rewardGems: 75,
  },
  {
    id: 'ach_words',
    title: 'Word Hoarder',
    description: 'Learn and match 50 vocabulary terms',
    icon: '📚',
    progress: 18,
    target: 50,
    unlocked: false,
    rewardGems: 80,
  },
];

export const INITIAL_WEAK_WORDS: WeakWord[] = [
  {
    id: 'ww-1',
    term: 'El desayuno',
    meaning: 'Breakfast',
    languageId: 'es',
    incorrectCount: 3,
    correctStreak: 1,
    masteryLevel: 2,
    lastReviewedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    exampleSentence: 'El desayuno continental incluye café y pan tostado.',
  },
  {
    id: 'ww-2',
    term: 'Por desgracia',
    meaning: 'Unfortunately / Sadly',
    languageId: 'es',
    incorrectCount: 4,
    correctStreak: 0,
    masteryLevel: 1,
    lastReviewedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    exampleSentence: 'Por desgracia el tren ya ha salido de la estación.',
  },
  {
    id: 'ww-3',
    term: 'Agradecer',
    meaning: 'To thank / To appreciate',
    languageId: 'es',
    incorrectCount: 2,
    correctStreak: 2,
    masteryLevel: 3,
    lastReviewedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    nextReviewAt: new Date(Date.now() + 3600000 * 14).toISOString(),
    exampleSentence: 'Quiero agradecer a todos por venir hoy.',
  },
  {
    id: 'ww-4',
    term: 'La costumbre',
    meaning: 'The habit / Custom',
    languageId: 'es',
    incorrectCount: 3,
    correctStreak: 1,
    masteryLevel: 2,
    lastReviewedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    nextReviewAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    exampleSentence: 'Es una costumbre cenar tarde en España.',
  },
];

export const DEFAULT_USER_STATS: UserStats = {
  currentLanguageId: 'es',
  languageProgress: {
    es: {
      completedNodeIds: ['es-u1-n1'],
      activeUnitIndex: 0,
      crowns: 1,
      xp: 45,
    },
  },
  hearts: 5,
  maxHearts: 5,
  streak: 7,
  streakFreeze: true,
  streakShields: 2, // 2 shields in inventory
  lastActiveDate: new Date().toISOString(),
  streakDays: [1, 2, 3, 4, 5, 6, 7],
  gems: 480,
  coins: 1250, // 1,250 Wager coins for Trivia Arena
  totalXp: 450,
  league: 'Ruby',
  costume: 'default',
  soundEnabled: true,
  speechEnabled: true,
  mistakes: [],
  weakWordsDeck: INITIAL_WEAK_WORDS,
  clanId: 'clan-cyber-foxes',
  unlockedCertificates: ['cert-a1-es'],
  unlockedChests: [],
  livingWorldProgress: {
    unlockedLocationIds: ['cafe', 'park'],
    characterMemories: {},
    completedMissionCount: 0,
    selectedCefrLevel: 'A2',
  },
};

/**
 * Streak System with Automated Streak Shield Consumption
 * If user missed days, consumes a Streak Shield automatically rather than resetting to 0!
 */
export function verifyAndProtectStreak(stats: UserStats): {
  updatedStats: UserStats;
  shieldConsumed: boolean;
  streakLost: boolean;
} {
  const lastDate = new Date(stats.lastActiveDate);
  const now = new Date();
  
  // Calculate difference in calendar days
  const msInDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / msInDay);

  if (daysDiff <= 1) {
    // Active today or yesterday, streak is safe
    return { updatedStats: stats, shieldConsumed: false, streakLost: false };
  }

  // User missed more than 1 day!
  if (stats.streakShields > 0) {
    // Automated Streak Shield consumed to save billionaire-level streak!
    return {
      updatedStats: {
        ...stats,
        streakShields: stats.streakShields - 1,
        lastActiveDate: now.toISOString(),
      },
      shieldConsumed: true,
      streakLost: false,
    };
  }

  // No shields left, streak resets to 1
  return {
    updatedStats: {
      ...stats,
      streak: 1,
      lastActiveDate: now.toISOString(),
    },
    shieldConsumed: false,
    streakLost: true,
  };
}

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_USER_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER_STATS;
    const parsed = JSON.parse(raw);
    const merged: UserStats = {
      ...DEFAULT_USER_STATS,
      ...parsed,
      streakShields: parsed.streakShields ?? DEFAULT_USER_STATS.streakShields,
      coins: parsed.coins ?? DEFAULT_USER_STATS.coins,
      weakWordsDeck: parsed.weakWordsDeck?.length ? parsed.weakWordsDeck : DEFAULT_USER_STATS.weakWordsDeck,
      clanId: parsed.clanId || DEFAULT_USER_STATS.clanId,
      unlockedCertificates: parsed.unlockedCertificates || DEFAULT_USER_STATS.unlockedCertificates,
      languageProgress: {
        ...DEFAULT_USER_STATS.languageProgress,
        ...(parsed.languageProgress || {}),
      },
    };

    const { updatedStats } = verifyAndProtectStreak(merged);
    return updatedStats;
  } catch {
    return DEFAULT_USER_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore quota issues
  }
}
