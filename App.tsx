import React, { useState, useEffect } from 'react';
import { Language, Unit, PathNode, UserStats, Exercise } from './types';
import { ALL_LANGUAGES } from './data/languages';
import { generateCurriculumForLanguage } from './data/curriculum';
import { loadUserStats, saveUserStats } from './utils/storage';
import { sound } from './utils/audio';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { PathTree } from './components/PathTree';
import { LessonModal } from './components/LessonModal';
import { LanguagePickerModal } from './components/LanguagePickerModal';
import { LeaderboardView } from './components/LeaderboardView';
import { QuestsView } from './components/QuestsView';
import { ShopView } from './components/ShopView';
import { PracticeHubView } from './components/PracticeHubView';
import { ProfileView } from './components/ProfileView';
import { LivingWorldView } from './components/livingWorld/LivingWorldView';
import { AILoungeView } from './components/AILoungeView';
import { TriviaArenaView } from './components/TriviaArenaView';
import { CertificatesView } from './components/CertificatesView';
import { ClansView } from './components/ClansView';
import { SRSDeckModal } from './components/SRSDeckModal';
import { RoastClubView } from './components/RoastClubView';
import { SpeedDatingView } from './components/SpeedDatingView';
import { LuckyWheelModal } from './components/LuckyWheelModal';
import { AvatarExporterModal } from './components/AvatarExporterModal';
import { LoginPage } from './components/LoginPage';

import { AuthProvider, useFirebaseAuth } from './firebase/AuthContext';

function AppContent() {
  const [userStats, setUserStats] = useState<UserStats>(loadUserStats);
  const [activeTab, setActiveTab] = useState<TabType>('learn');
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isLoginPageOpen, setIsLoginPageOpen] = useState(false);
  const [isSRSModalOpen, setIsSRSModalOpen] = useState(false);
  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isAvatarExporterOpen, setIsAvatarExporterOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('polypanda_theme') !== 'light';
    }
    return true;
  });

  const { user, syncStats, loading: authLoading, isSyncing } = useFirebaseAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('polypanda_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('polypanda_theme', 'light');
    }
  }, [isDark]);

  // Active language resolving
  const currentLanguage = ALL_LANGUAGES.find((l) => l.id === userStats.currentLanguageId) || ALL_LANGUAGES[0];

  // Dynamic Units & curriculum generation for current language
  const [units, setUnits] = useState<Unit[]>(() => generateCurriculumForLanguage(currentLanguage));

  // Active interactive lesson modal state
  const [activeLessonNode, setActiveLessonNode] = useState<PathNode | null>(null);

  // Save changes to localStorage and Firestore
  useEffect(() => {
    saveUserStats(userStats);
    if (user && !authLoading && !isSyncing) {
      syncStats(userStats);
    }
  }, [userStats, user, authLoading, isSyncing]);

  // Sync sound settings with audio engine
  useEffect(() => {
    sound.enabled = userStats.soundEnabled;
    sound.speechEnabled = userStats.speechEnabled;
  }, [userStats.soundEnabled, userStats.speechEnabled]);

  // Regenerate units whenever language changes
  useEffect(() => {
    const generated = generateCurriculumForLanguage(currentLanguage);
    // Mark completed nodes according to userStats
    const langProgress = userStats.languageProgress[currentLanguage.id];
    if (langProgress && langProgress.completedNodeIds) {
      generated.forEach((u) => {
        u.nodes.forEach((n) => {
          if (langProgress.completedNodeIds.includes(n.id)) {
            n.isCompleted = true;
            n.isLocked = false;
          }
        });
      });
    }
    setUnits(generated);
  }, [currentLanguage.id, userStats.languageProgress]);

  // Handle language selection from 500+ languages modal
  const handleSelectLanguage = (lang: Language) => {
    setUserStats((prev) => {
      const existing = prev.languageProgress[lang.id] || {
        completedNodeIds: [],
        activeUnitIndex: 0,
        crowns: 0,
        xp: 0,
      };
      return {
        ...prev,
        currentLanguageId: lang.id,
        languageProgress: {
          ...prev.languageProgress,
          [lang.id]: existing,
        },
      };
    });
  };

  // Handle clicking a node on the path
  const handleSelectNode = (node: PathNode) => {
    setActiveLessonNode(node);
  };

  // Handle claiming chest reward on the path
  const handleClaimChest = (node: PathNode) => {
    if (node.isCompleted) return;
    sound.playGems();

    setUserStats((prev) => ({
      ...prev,
      gems: prev.gems + (node.gemReward || 50),
    }));

    setUnits((prev) =>
      prev.map((u) => ({
        ...u,
        nodes: u.nodes.map((n) => (n.id === node.id ? { ...n, isCompleted: true } : n)),
      }))
    );
  };

  // When a lesson finishes
  const handleFinishLesson = (xpGained: number, accuracy: number, perfect: boolean) => {
    if (!activeLessonNode) return;

    setUserStats((prev) => {
      const currentLangId = prev.currentLanguageId;
      const currentProgress = prev.languageProgress[currentLangId] || {
        completedNodeIds: [],
        activeUnitIndex: 0,
        crowns: 0,
        xp: 0,
      };

      const updatedCompleted = Array.from(
        new Set([...currentProgress.completedNodeIds, activeLessonNode.id])
      );

      return {
        ...prev,
        totalXp: prev.totalXp + xpGained,
        gems: prev.gems + (perfect ? 15 : 10),
        languageProgress: {
          ...prev.languageProgress,
          [currentLangId]: {
            ...currentProgress,
            completedNodeIds: updatedCompleted,
            crowns: (currentProgress.crowns || 0) + 1,
            xp: (currentProgress.xp || 0) + xpGained,
          },
        },
      };
    });

    // Mark node completed in the current path tree
    setUnits((prev) =>
      prev.map((u) => ({
        ...u,
        nodes: u.nodes.map((n) =>
          n.id === activeLessonNode.id
            ? { ...n, isCompleted: true, crownsEarned: Math.min(3, n.crownsEarned + 1) }
            : n
        ),
      }))
    );

    setActiveLessonNode(null);
  };

  // When heart lost during exercise: register mistake into Spaced Repetition System (SRS) Weak Words Deck
  const handleHeartLost = (exercise?: Exercise) => {
    setUserStats((prev) => {
      let nextDeck = [...(prev.weakWordsDeck || [])];
      if (exercise) {
        const term = exercise.targetSentence || exercise.prompt || 'Vocabulary phrase';
        const meaning = exercise.nativeSentence || exercise.correctOption || 'Translation phrase';
        const existingIdx = nextDeck.findIndex((w) => w.term.toLowerCase() === term.toLowerCase());
        if (existingIdx >= 0) {
          nextDeck[existingIdx] = {
            ...nextDeck[existingIdx],
            incorrectCount: nextDeck[existingIdx].incorrectCount + 1,
            masteryLevel: Math.max(1, nextDeck[existingIdx].masteryLevel - 1),
            lastReviewedAt: new Date().toISOString(),
          };
        } else {
          nextDeck.unshift({
            id: `ww-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            term,
            meaning,
            languageId: prev.currentLanguageId,
            incorrectCount: 1,
            correctStreak: 0,
            masteryLevel: 1,
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
            exampleSentence: exercise.prompt,
          });
        }
      }
      return {
        ...prev,
        hearts: Math.max(0, prev.hearts - 1),
        weakWordsDeck: nextDeck,
      };
    });
  };

  // Refill 1 heart via Practice Hub
  const handleRefillHeart = () => {
    setUserStats((prev) => ({
      ...prev,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
    }));
  };

  // Shop purchases
  const handleBuyItem = (itemKey: string, cost: number): boolean => {
    if (userStats.gems < cost) return false;

    setUserStats((prev) => {
      const nextGems = prev.gems - cost;
      if (itemKey === 'refill') {
        return { ...prev, gems: nextGems, hearts: prev.maxHearts };
      }
      if (itemKey === 'freeze') {
        return { ...prev, gems: nextGems, streakFreeze: true };
      }
      if (itemKey === 'streakShield') {
        return { ...prev, gems: nextGems, streakShields: (prev.streakShields || 0) + 1 };
      }
      if (itemKey === 'coins500') {
        return { ...prev, gems: nextGems, coins: (prev.coins || 0) + 500 };
      }
      if (itemKey === 'coins2000') {
        return { ...prev, gems: nextGems, coins: (prev.coins || 0) + 2000 };
      }
      if (itemKey === 'astronaut' || itemKey === 'detective' || itemKey === 'scout') {
        return { ...prev, gems: nextGems, costume: itemKey };
      }
      return { ...prev, gems: nextGems };
    });

    return true;
  };

  // Quest rewards claim
  const handleClaimQuestReward = (_questId: string, gems: number) => {
    setUserStats((prev) => ({ ...prev, gems: prev.gems + gems }));
  };

  // Sound toggle
  const handleToggleSound = () => {
    setUserStats((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  if (isLoginPageOpen) {
    return (
      <LoginPage
        onBackToApp={() => setIsLoginPageOpen(false)}
        onLoginSuccess={() => setIsLoginPageOpen(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
        streakCount={userStats.streak}
        totalLanguages={ALL_LANGUAGES.length}
        coins={userStats.coins}
        streakShields={userStats.streakShields}
        weakWordsCount={userStats.weakWordsDeck?.length || 0}
        onOpenSRSDeck={() => setIsSRSModalOpen(true)}
        onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
        onOpenAvatarExporter={() => setIsAvatarExporterOpen(true)}
        onOpenLogin={() => setIsLoginPageOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#0b0e14]">
        {/* Top Sticky Header */}
        <Header
          userStats={userStats}
          currentLanguage={currentLanguage}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
          onOpenShop={() => setActiveTab('shop')}
          onOpenPractice={() => setActiveTab('practice')}
          onOpenSRSDeck={() => setIsSRSModalOpen(true)}
          onOpenArena={() => setActiveTab('trivia')}
          onOpenLuckyWheel={() => setIsLuckyWheelOpen(true)}
          onOpenAvatarExporter={() => setIsAvatarExporterOpen(true)}
          onToggleSound={handleToggleSound}
          onOpenLogin={() => setIsLoginPageOpen(true)}
        />

        {/* Tab Views */}
        <main className="flex-1 w-full">
          {activeTab === 'learn' && (
            <PathTree
              units={units}
              currentLanguage={currentLanguage}
              onSelectNode={handleSelectNode}
              onClaimChest={handleClaimChest}
            />
          )}

          {activeTab === 'ai-lounge' && (
            <AILoungeView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
            />
          )}

          {activeTab === 'roast' && (
            <RoastClubView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenSRSDeck={() => setIsSRSModalOpen(true)}
            />
          )}

          {activeTab === 'dating' && (
            <SpeedDatingView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
            />
          )}

          {activeTab === 'trivia' && (
            <TriviaArenaView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'world' && (
            <LivingWorldView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
            />
          )}

          {activeTab === 'clans' && (
            <ClansView
              userStats={userStats}
              onUpdateUserStats={(updater) => setUserStats(updater)}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onUpdateUserStats={(updater) => setUserStats(updater)}
              onOpenShop={() => setActiveTab('shop')}
            />
          )}

          {activeTab === 'practice' && (
            <PracticeHubView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onRefillHeart={handleRefillHeart}
            />
          )}

          {activeTab === 'leaderboards' && (
            <LeaderboardView userStats={userStats} />
          )}

          {activeTab === 'quests' && (
            <QuestsView
              userStats={userStats}
              onClaimQuestReward={handleClaimQuestReward}
              onClaimAchievementReward={(_id, gems) =>
                setUserStats((p) => ({ ...p, gems: p.gems + gems }))
              }
            />
          )}

          {activeTab === 'shop' && (
            <ShopView userStats={userStats} onBuyItem={handleBuyItem} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userStats={userStats}
              currentLanguage={currentLanguage}
              onSelectLanguage={handleSelectLanguage}
              onOpenLanguagePicker={() => setIsLanguagePickerOpen(true)}
              onOpenSRSDeck={() => setIsSRSModalOpen(true)}
              onOpenClans={() => setActiveTab('clans')}
              onOpenLogin={() => setIsLoginPageOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Spaced Repetition System (SRS) Weak Words Deck Modal */}
      {isSRSModalOpen && (
        <SRSDeckModal
          isOpen={isSRSModalOpen}
          onClose={() => setIsSRSModalOpen(false)}
          userStats={userStats}
          currentLanguage={currentLanguage}
          onUpdateUserStats={(updater) => setUserStats(updater)}
        />
      )}

      {/* Lucky Fortune Wheel Modal */}
      {isLuckyWheelOpen && (
        <LuckyWheelModal
          isOpen={isLuckyWheelOpen}
          onClose={() => setIsLuckyWheelOpen(false)}
          userStats={userStats}
          onUpdateUserStats={(updater) => setUserStats(updater)}
          onOpenShop={() => {
            setIsLuckyWheelOpen(false);
            setActiveTab('shop');
          }}
        />
      )}

      {/* AR Avatar Reel Exporter Modal */}
      {isAvatarExporterOpen && (
        <AvatarExporterModal
          isOpen={isAvatarExporterOpen}
          onClose={() => setIsAvatarExporterOpen(false)}
          userStats={userStats}
          currentLanguage={currentLanguage}
        />
      )}

      {/* 500+ Languages Explorer Modal */}
      {isLanguagePickerOpen && (
        <LanguagePickerModal
          currentLanguageId={currentLanguage.id}
          onSelectLanguage={handleSelectLanguage}
          onClose={() => setIsLanguagePickerOpen(false)}
        />
      )}

      {/* Interactive Lesson Player Modal */}
      {activeLessonNode && (
        <LessonModal
          node={activeLessonNode}
          currentLanguage={currentLanguage}
          userStats={userStats}
          onFinishLesson={handleFinishLesson}
          onHeartLost={handleHeartLost}
          onClose={() => setActiveLessonNode(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  const [initialStats, setInitialStats] = useState<UserStats>(loadUserStats);

  const handleCloudStatsLoaded = (cloudStats: UserStats) => {
    setInitialStats((prev) => ({
      ...prev,
      ...cloudStats,
    }));
    saveUserStats(cloudStats);
  };

  return (
    <AuthProvider onCloudStatsLoaded={handleCloudStatsLoaded} getUserStats={() => initialStats}>
      <AppContent />
    </AuthProvider>
  );
}
