import React, { useState } from 'react';
import { UserStats, WeakWord, Language } from '../types';
import {
  Brain,
  X,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Zap,
  ArrowRight,
  Plus,
  Flame,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SRSDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
}

export const SRSDeckModal: React.FC<SRSDeckModalProps> = ({
  isOpen,
  onClose,
  userStats,
  currentLanguage,
  onUpdateUserStats,
}) => {
  const [deck, setDeck] = useState<WeakWord[]>(() => userStats.weakWordsDeck || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');

  if (!isOpen) return null;

  const activeCard = deck[currentIndex];

  const handleFlip = () => {
    sound.playClick();
    setIsFlipped((prev) => !prev);
  };

  const handleSpeak = (text: string) => {
    sound.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLanguage.code || 'es';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRateRetention = (rating: 'hard' | 'good' | 'mastered') => {
    if (!activeCard) return;

    sound.playClick();
    let nextLevel = activeCard.masteryLevel;
    let nextReviewMs = 3600000 * 24; // 1 day default

    if (rating === 'hard') {
      nextLevel = Math.max(1, activeCard.masteryLevel - 1);
      nextReviewMs = 3600000 * 2; // 2 hours
      sound.playWrong();
    } else if (rating === 'good') {
      nextLevel = Math.min(5, activeCard.masteryLevel + 1);
      nextReviewMs = 3600000 * 24 * (activeCard.masteryLevel + 1);
      sound.playClick();
    } else if (rating === 'mastered') {
      nextLevel = 5;
      nextReviewMs = 3600000 * 24 * 14; // 2 weeks
      sound.playFanfare();
    }

    const updatedDeck = deck.map((card, idx) =>
      idx === currentIndex
        ? {
            ...card,
            masteryLevel: nextLevel,
            correctStreak: rating === 'hard' ? 0 : card.correctStreak + 1,
            lastReviewedAt: new Date().toISOString(),
            nextReviewAt: new Date(Date.now() + nextReviewMs).toISOString(),
          }
        : card
    );

    setDeck(updatedDeck);
    onUpdateUserStats((prev) => ({
      ...prev,
      weakWordsDeck: updatedDeck,
      totalXp: prev.totalXp + (rating === 'mastered' ? 15 : 5),
    }));

    setIsFlipped(false);
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newMeaning.trim()) return;

    sound.playFanfare();
    const newWord: WeakWord = {
      id: `custom-${Date.now()}`,
      term: newTerm.trim(),
      meaning: newMeaning.trim(),
      exampleSentence: newExample.trim() || undefined,
      languageId: currentLanguage.id,
      incorrectCount: 1,
      correctStreak: 0,
      masteryLevel: 1,
      lastReviewedAt: new Date().toISOString(),
      nextReviewAt: new Date(Date.now() + 3600000 * 2).toISOString(),
    };

    const nextDeck = [newWord, ...deck];
    setDeck(nextDeck);
    onUpdateUserStats((prev) => ({
      ...prev,
      weakWordsDeck: nextDeck,
    }));

    setNewTerm('');
    setNewMeaning('');
    setNewExample('');
    setShowAddForm(false);
  };

  const masteredCount = deck.filter((w) => w.masteryLevel >= 4).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl bg-[#161b22] border border-teal-500/40 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">SRS Weak Words Deck</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  SPACED REPETITION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {deck.length} words tracked • {masteredCount} mastered
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Progress Bar */}
        <div className="my-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span>Card {deck.length > 0 ? currentIndex + 1 : 0} of {deck.length}</span>
            <span className="text-teal-400">{Math.round((masteredCount / Math.max(1, deck.length)) * 100)}% Fluency Retention</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all"
              style={{ width: `${(masteredCount / Math.max(1, deck.length)) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard Area */}
        {deck.length > 0 && activeCard ? (
          <div
            onClick={handleFlip}
            className="w-full min-h-[220px] rounded-3xl bg-[#0d1117] border-2 border-slate-800 hover:border-teal-500/50 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-xl relative group select-none"
          >
            <span className="absolute top-4 left-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
              {isFlipped ? 'Meaning & Context' : 'Tap Card to Reveal'}
            </span>

            {/* Mastery stars */}
            <div className="absolute top-4 right-4 flex items-center gap-0.5 text-xs text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < activeCard.masteryLevel ? 'opacity-100' : 'opacity-20'}>
                  ★
                </span>
              ))}
            </div>

            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  {activeCard.term}
                </span>
                <span className="text-xs font-bold text-teal-400 flex items-center justify-center gap-1">
                  <span>Language: {currentLanguage.name}</span>
                </span>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in duration-200">
                <span className="text-2xl sm:text-3xl font-black text-teal-300 block">
                  {activeCard.meaning}
                </span>
                {activeCard.exampleSentence && (
                  <p className="text-xs text-slate-300 italic max-w-sm">
                    "{activeCard.exampleSentence}"
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak(activeCard.term);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 font-bold text-xs border border-teal-500/30"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pronounce</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-lg font-black text-white">Your SRS Deck is Clean!</h4>
            <p className="text-xs mt-1">
              Missed exercise terms from Lessons and Trivia Arena will automatically collect here.
            </p>
          </div>
        )}

        {/* Spaced Repetition Rating Buttons */}
        {deck.length > 0 && isFlipped && (
          <div className="grid grid-cols-3 gap-2.5 mt-4 animate-in fade-in">
            <button
              onClick={() => handleRateRetention('hard')}
              className="p-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-black text-xs uppercase cursor-pointer"
            >
              Hard (2h)
            </button>
            <button
              onClick={() => handleRateRetention('good')}
              className="p-3 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-black text-xs uppercase cursor-pointer"
            >
              Good (1d)
            </button>
            <button
              onClick={() => handleRateRetention('mastered')}
              className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black text-xs uppercase cursor-pointer"
            >
              Mastered (2w)
            </button>
          </div>
        )}

        {/* Add custom term collapsible */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setShowAddForm((p) => !p)}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel Adding' : 'Add Custom Term to Deck'}</span>
          </button>
          <span className="text-[11px] text-slate-500 font-medium">SRS Leitner Box Engine</span>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddCustomWord} className="mt-3 space-y-2 bg-[#0d1117] p-3 rounded-2xl border border-slate-800 text-xs">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              placeholder="Foreign Term (e.g., El espejo)"
              required
              className="w-full px-3 py-2 bg-[#161b22] border border-slate-800 rounded-xl text-slate-100 outline-none focus:border-teal-400"
            />
            <input
              type="text"
              value={newMeaning}
              onChange={(e) => setNewMeaning(e.target.value)}
              placeholder="English Translation (e.g., The mirror)"
              required
              className="w-full px-3 py-2 bg-[#161b22] border border-slate-800 rounded-xl text-slate-100 outline-none focus:border-teal-400"
            />
            <button
              type="submit"
              className="btn-3d w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl border-b-2 border-teal-800"
            >
              Save to SRS Deck
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
