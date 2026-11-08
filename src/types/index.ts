export type RegionCategory =
  | 'Popular'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Africa'
  | 'Americas'
  | 'Middle East'
  | 'Ancient & Classical'
  | 'Constructed';

export type LanguageDifficulty = 'Beginner Friendly' | 'Intermediate' | 'Challenging';

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
  region: RegionCategory;
  family: string;
  script: string;
  speakers: string;
  learners: string;
  difficulty: LanguageDifficulty;
  greeting: string;
  greetingMeaning: string;
  description: string;
  hasSpeechVoice?: boolean;
}

export type ExerciseType =
  | 'word_bank'
  | 'match_pairs'
  | 'audio_listen'
  | 'multiple_choice'
  | 'dialogue_complete'
  | 'speaking';

export interface MatchPair {
  id: string;
  target: string;
  native: string;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  prompt: string;
  targetSentence?: string;
  nativeSentence?: string;
  audioText?: string;
  voiceLang?: string;
  phonetic?: string;
  wordBank?: string[];
  correctWords?: string[];
  options?: string[];
  correctOption?: string;
  pairs?: MatchPair[];
  dialogueSpeaker?: string;
  dialogueContext?: string;
  hint?: string;
  culturalNote?: string;
}

export type NodeKind = 'lesson' | 'story' | 'review' | 'chest';

export interface PathNode {
  id: string;
  lessonNumber: number;
  title: string;
  subtitle: string;
  kind: NodeKind;
  crownsMax: number;
  crownsEarned: number;
  xpReward: number;
  gemReward: number;
  isCompleted: boolean;
  isLocked: boolean;
  exercises: Exercise[];
  storyLines?: { speaker: string; text: string; translation: string; audio?: string }[];
}

export interface Unit {
  id: string;
  unitNumber: number;
  title: string;
  topic: string;
  color: string;
  accentColor: string;
  guidebook: string;
  nodes: PathNode[];
}

export type LeagueTier =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Sapphire'
  | 'Ruby'
  | 'Emerald'
  | 'Amethyst'
  | 'Pearl'
  | 'Obsidian'
  | 'Diamond';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  rank: number;
  isCurrentUser?: boolean;
  flag: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  gemReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  rewardGems: number;
}

export interface WeakWord {
  id: string;
  term: string;
  meaning: string;
  languageId: string;
  incorrectCount: number;
  correctStreak: number;
  masteryLevel: number; // 1 to 5
  lastReviewedAt: string;
  nextReviewAt: string;
  exampleSentence?: string;
}

export interface ClanMember {
  id: string;
  name: string;
  avatar: string;
  weeklyXp: number;
  role: 'Leader' | 'Officer' | 'Member';
  isCurrentUser?: boolean;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  motto: string;
  badge: string;
  bannerColor: string;
  totalWeeklyXp: number;
  rank: number;
  memberCount: number;
  maxMembers: number;
  members: ClanMember[];
  isUserClan?: boolean;
}

export interface CertificateItem {
  id: string;
  title: string;
  level: CefrLevel;
  languageId: string;
  description: string;
  unlocked: boolean;
  requiredUnit: number;
  completedAt?: string;
  credentialId?: string;
  priceUsd: number;
  verifiedOnChain: boolean;
}

export interface UserStats {
  currentLanguageId: string;
  languageProgress: Record<
    string,
    {
      completedNodeIds: string[];
      activeUnitIndex: number;
      crowns: number;
      xp: number;
    }
  >;
  hearts: number;
  maxHearts: number;
  streak: number;
  streakFreeze: boolean;
  streakShields: number; // Consumed automatically to prevent streak loss
  lastActiveDate: string;
  streakDays: number[];
  gems: number;
  coins: number; // Virtual wager arena coins
  totalXp: number;
  league: LeagueTier;
  costume: string;
  soundEnabled: boolean;
  speechEnabled: boolean;
  mistakes: Exercise[];
  weakWordsDeck: WeakWord[]; // Spaced Repetition System (SRS)
  clanId?: string;
  unlockedCertificates: string[];
  unlockedChests: string[];
  livingWorldProgress?: LivingWorldProgress;
}

export type LocationId = 'cafe' | 'shop' | 'airport' | 'hotel' | 'school' | 'park';
export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface WorldCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
  greetingPreview: string;
}

export interface CharacterMemory {
  visitCount: number;
  lastVisitDate: string;
  notes: string;
  learnedVocabulary: string[];
  weakPoints: string[];
  conversationCount: number;
}

export interface WorldLocation {
  id: LocationId;
  name: string;
  tagline: string;
  description: string;
  character: WorldCharacter;
  minXpRequired: number;
  bgGradient: string;
  accentColor: string;
  icon: string;
  threeCoords: [number, number, number];
  sampleMissions: string[];
}

export interface LivingWorldProgress {
  unlockedLocationIds: LocationId[];
  characterMemories: Record<string, CharacterMemory>;
  completedMissionCount: number;
  selectedCefrLevel: CefrLevel;
}

export interface EndOfMissionReport {
  score: number;
  fluencyRating: string;
  xpEarned: number;
  gemsEarned: number;
  vocabularyLearned: { term: string; meaning: string }[];
  grammarNotes: { original: string; correction: string; tip: string }[];
  paoPraise: string;
  nextMissionRecommendation: string;
}
