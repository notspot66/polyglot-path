import React, { useState } from 'react';
import {
  UserStats,
  Language,
  WorldLocation,
  CefrLevel,
  EndOfMissionReport,
  LocationId,
} from '../../types';
import { WORLD_LOCATIONS, CEFR_LEVELS } from '../../data/livingWorld';
import { LivingWorld3DScene } from './LivingWorld3DScene';
import { WorldDialogueModal } from './WorldDialogueModal';
import { sound } from '../../utils/audio';
import {
  Globe2,
  Sparkles,
  Lock,
  Award,
  BookOpen,
  Volume2,
  Compass,
  CheckCircle2,
  Zap,
  MapPin,
  Eye,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface LivingWorldViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenLanguagePicker: () => void;
}

export const LivingWorldView: React.FC<LivingWorldViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenLanguagePicker,
}) => {
  const [activeLocation, setActiveLocation] = useState<WorldLocation | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  // Extract living world progress from userStats (with safe defaults)
  const worldProgress = userStats.livingWorldProgress || {
    unlockedLocationIds: ['cafe', 'park'] as LocationId[],
    characterMemories: {},
    completedMissionCount: 0,
    selectedCefrLevel: 'A2' as CefrLevel,
  };

  const unlockedIds = worldProgress.unlockedLocationIds || ['cafe', 'park'];
  const memories = worldProgress.characterMemories || {};

  // Check which locations are unlocked based on either explicit unlock or user total XP
  const isLocationUnlocked = (loc: WorldLocation) => {
    return unlockedIds.includes(loc.id) || userStats.totalXp >= loc.minXpRequired;
  };

  const handleSelectLocation = (loc: WorldLocation) => {
    if (!isLocationUnlocked(loc)) {
      sound.playWrong();
      return;
    }
    sound.playClick();
    setActiveLocation(loc);
  };

  const handleMissionCompleted = (
    locationId: string,
    characterId: string,
    report: EndOfMissionReport,
    newMemoryNote: string
  ) => {
    onUpdateUserStats((prev) => {
      const prevWorld = prev.livingWorldProgress || {
        unlockedLocationIds: ['cafe', 'park'],
        characterMemories: {},
        completedMissionCount: 0,
        selectedCefrLevel: 'A2',
      };

      const existingCharMem = prevWorld.characterMemories[characterId] || {
        visitCount: 0,
        lastVisitDate: new Date().toISOString(),
        notes: '',
        learnedVocabulary: [],
        weakPoints: [],
        conversationCount: 0,
      };

      const newVocab = report.vocabularyLearned.map((v) => v.term);
      const combinedVocab = Array.from(
        new Set([...existingCharMem.learnedVocabulary, ...newVocab])
      );

      const updatedCharMem = {
        ...existingCharMem,
        visitCount: existingCharMem.visitCount + 1,
        lastVisitDate: new Date().toISOString(),
        notes: newMemoryNote || existingCharMem.notes,
        learnedVocabulary: combinedVocab,
        conversationCount: existingCharMem.conversationCount + 1,
      };

      // Check if newly unlocked locations can be added
      const nextUnlocked = Array.from(
        new Set([
          ...prevWorld.unlockedLocationIds,
          ...(prev.totalXp + report.xpEarned >= 80 ? (['shop'] as LocationId[]) : []),
          ...(prev.totalXp + report.xpEarned >= 160 ? (['hotel'] as LocationId[]) : []),
          ...(prev.totalXp + report.xpEarned >= 250 ? (['school'] as LocationId[]) : []),
          ...(prev.totalXp + report.xpEarned >= 350 ? (['airport'] as LocationId[]) : []),
        ])
      );

      return {
        ...prev,
        totalXp: prev.totalXp + report.xpEarned,
        gems: prev.gems + report.gemsEarned,
        livingWorldProgress: {
          ...prevWorld,
          unlockedLocationIds: nextUnlocked,
          completedMissionCount: prevWorld.completedMissionCount + 1,
          characterMemories: {
            ...prevWorld.characterMemories,
            [characterId]: updatedCharMem,
          },
        },
      };
    });
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-6 px-4 pb-28">
      {/* Hero Banner: POLYPANDA LIVING WORLD */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-2xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-emerald-300 animate-spin-slow" />
                <span>PREMIUM ADVENTURE</span>
              </span>
              <span className="text-xs font-black bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full uppercase">
                NEW
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              LINGOVERSE LIVING WORLD
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-extrabold mt-1">
              Learn Any Language, Anywhere!
            </p>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 max-w-xl leading-relaxed">
              Step into an interactive 3D virtual city. Chat with smart AI characters who remember your previous visits, past vocabulary, and personal story choices in <strong className="text-white underline">{currentLanguage.name}</strong>.
            </p>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-xs font-bold">
              <button
                onClick={onOpenLanguagePicker}
                className="btn-3d px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span>Target: {currentLanguage.name} {currentLanguage.flag}</span>
                <span className="text-[10px] text-emerald-200">Switch</span>
              </button>
              <span className="px-3 py-1.5 rounded-xl bg-black/20 border border-white/20 text-emerald-100">
                City Locations: {unlockedIds.length} / {WORLD_LOCATIONS.length} Unlocked
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-black/20 border border-white/20 text-emerald-100">
                Completed Missions: {worldProgress.completedMissionCount}
              </span>
            </div>
          </div>

          {/* Floating Panda Companion Graphic */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 shrink-0 bg-white/10 backdrop-blur-md">
            <img
              src="/src/assets/images/polypanda_mascot_logo_1794049862453.jpg"
              alt="Pao Mascot"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* View Mode Switcher & Guide Header */}
      <div className="flex items-center justify-between w-full mb-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-black text-white">City Exploration</h2>
        </div>

        {/* 3D View vs Grid View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#161b22] border border-slate-800 rounded-2xl">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('3d');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === '3d'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D City View</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('grid');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Map Directory</span>
          </button>
        </div>
      </div>

      {/* Primary 3D Virtual City View */}
      {viewMode === '3d' ? (
        <div className="w-full mb-8">
          <LivingWorld3DScene
            locations={WORLD_LOCATIONS}
            unlockedLocationIds={unlockedIds}
            userXp={userStats.totalXp}
            onSelectLocation={handleSelectLocation}
            selectedLocation={activeLocation}
          />
        </div>
      ) : null}

      {/* Locations Directory Cards Grid */}
      <div className="w-full mb-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Available World Locations & Resident Characters
          </span>
          <span className="text-xs font-bold text-emerald-400">
            Click any open location to talk
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WORLD_LOCATIONS.map((loc) => {
            const isUnlocked = isLocationUnlocked(loc);
            const charMem = memories[loc.character.id];

            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isUnlocked
                    ? 'bg-[#161b22] hover:bg-[#21262d] border-slate-800 hover:border-emerald-500 shadow-sm hover:scale-[1.02]'
                    : 'bg-[#161b22]/50 border-slate-800/60 opacity-75'
                }`}
              >
                <div>
                  {/* Card Top: Icon & Unlock Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center justify-center text-2xl shadow-xs">
                      {loc.icon}
                    </div>

                    {isUnlocked ? (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Unlocked
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Requires {loc.minXpRequired} XP
                      </span>
                    )}
                  </div>

                  {/* Location Title & Tagline */}
                  <h3 className="text-lg font-black text-white leading-tight">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {loc.description}
                  </p>

                  {/* Character Spotlight */}
                  <div className="mt-4 p-3 rounded-2xl bg-[#0d1117] border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#161b22] flex items-center justify-center text-xl shrink-0">
                      {loc.character.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-xs font-extrabold text-white truncate">
                        {loc.character.name}
                      </span>
                      <span className="block text-[11px] font-semibold text-emerald-400 truncate">
                        {loc.character.role}
                      </span>
                    </div>
                  </div>

                  {/* Persistent Memory Badge if visited */}
                  {charMem && charMem.visitCount > 0 && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">
                        Remembers you ({charMem.visitCount} visits)
                      </span>
                    </div>
                  )}
                </div>

                {/* Enter Button */}
                <button
                  disabled={!isUnlocked}
                  className={`btn-3d mt-5 w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                    isUnlocked
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-2 border-emerald-700 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                  }`}
                >
                  <span>{isUnlocked ? `Talk with ${loc.character.name}` : 'Locked'}</span>
                  {isUnlocked && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panda Guide Companion Info Box */}
      <div className="w-full p-6 rounded-3xl bg-[#161b22] border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-3xl shrink-0">
          🐾
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-base font-black text-white">
            Pao's Living World Guide
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            "Every resident in the city speaks your active study language (<strong>{currentLanguage.name}</strong>). Speak using your microphone or type your responses. Mateo, Zara, and Elena will remember what you like and teach you natural native phrases!"
          </p>
        </div>
      </div>

      {/* Active Dialogue Modal */}
      {activeLocation && (
        <WorldDialogueModal
          location={activeLocation}
          currentLanguage={currentLanguage}
          userStats={userStats}
          characterMemory={memories[activeLocation.character.id]}
          initialCefrLevel={worldProgress.selectedCefrLevel || 'A2'}
          onClose={() => setActiveLocation(null)}
          onMissionCompleted={handleMissionCompleted}
        />
      )}
    </div>
  );
};
