import React, { useState, useEffect } from 'react';
import { PathNode, Exercise, UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import { X, Heart, Volume2, Snail, CheckCircle2, XCircle, Sparkles, Award } from 'lucide-react';

interface LessonModalProps {
  node: PathNode;
  currentLanguage: Language;
  userStats: UserStats;
  onFinishLesson: (xpGained: number, accuracy: number, perfect: boolean) => void;
  onHeartLost: (exercise?: Exercise) => void;
  onClose: () => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  node,
  currentLanguage,
  userStats,
  onFinishLesson,
  onHeartLost,
  onClose,
}) => {
  const [exercises] = useState<Exercise[]>(node.exercises || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heartsLeft, setHeartsLeft] = useState(userStats.hearts);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [mistakesCount, setMistakesCount] = useState(0);

  // Exercise interactive states
  const [selectedWordBank, setSelectedWordBank] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [selectedFirstPair, setSelectedFirstPair] = useState<{ id: string; text: string; side: 'target' | 'native' } | null>(null);

  // Status of the current exercise submission: 'idle' | 'correct' | 'wrong'
  const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Story mode state
  const isStory = node.kind === 'story' && node.storyLines && node.storyLines.length > 0;
  const [storyLineIndex, setStoryLineIndex] = useState(0);

  const currentExercise = exercises[currentIndex];

  // Initialize exercise state whenever currentIndex changes
  useEffect(() => {
    if (!currentExercise) return;
    setCheckStatus('idle');
    setSelectedOption(null);
    setSelectedWordBank([]);
    setMatchedPairIds([]);
    setSelectedFirstPair(null);

    if (currentExercise.wordBank) {
      // Shuffle slightly for realism
      setAvailableWords([...currentExercise.wordBank].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, currentExercise]);

  // Audio prompt helper
  const playCurrentAudio = (slow: boolean = false) => {
    if (!currentExercise) return;
    const textToSpeak = currentExercise.audioText || currentExercise.targetSentence || currentExercise.prompt;
    const voice = currentExercise.voiceLang || currentLanguage.code || 'en-US';
    sound.speak(textToSpeak, voice, slow);
  };

  // Word Bank tile interaction
  const handleSelectWord = (word: string, index: number) => {
    if (checkStatus !== 'idle') return;
    sound.playClick();
    setSelectedWordBank((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReturnWord = (word: string, index: number) => {
    if (checkStatus !== 'idle') return;
    sound.playClick();
    setSelectedWordBank((prev) => prev.filter((_, i) => i !== index));
    setAvailableWords((prev) => [...prev, word]);
  };

  // Pair Matching interaction
  const handleTilePairClick = (item: { id: string; text: string; side: 'target' | 'native' }) => {
    if (checkStatus !== 'idle' || matchedPairIds.includes(item.id)) return;
    sound.playClick();

    if (!selectedFirstPair) {
      setSelectedFirstPair(item);
      return;
    }

    if (selectedFirstPair.side === item.side) {
      setSelectedFirstPair(item);
      return;
    }

    // Check if matched
    if (selectedFirstPair.id === item.id) {
      sound.playCorrect();
      setMatchedPairIds((prev) => [...prev, item.id]);
      setSelectedFirstPair(null);
    } else {
      sound.playWrong();
      setSelectedFirstPair(null);
    }
  };

  // Handle checking the answer
  const handleCheckAnswer = () => {
    if (!currentExercise || checkStatus !== 'idle') return;

    let isCorrect = false;

    if (currentExercise.type === 'word_bank' || currentExercise.type === 'audio_listen') {
      const userSentence = selectedWordBank.join(' ').trim().toLowerCase();
      const targetSentence = (currentExercise.correctWords || []).join(' ').trim().toLowerCase();
      isCorrect = userSentence === targetSentence;
    } else if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'dialogue_complete') {
      isCorrect = selectedOption === currentExercise.correctOption;
    } else if (currentExercise.type === 'match_pairs') {
      const totalPairs = (currentExercise.pairs || []).length;
      isCorrect = matchedPairIds.length === totalPairs;
    }

    if (isCorrect) {
      sound.playCorrect();
      setCheckStatus('correct');
    } else {
      sound.playWrong();
      setCheckStatus('wrong');
      setMistakesCount((c) => c + 1);
      const nextHearts = heartsLeft - 1;
      setHeartsLeft(nextHearts);
      onHeartLost(currentExercise);
    }
  };

  // Continue to next question or finish
  const handleContinue = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // Finished all exercises!
      sound.playFanfare();
      setIsCompleted(true);
    }
  };

  // Handle story progression
  const handleStoryNext = () => {
    sound.playClick();
    if (storyLineIndex < (node.storyLines?.length || 1) - 1) {
      setStoryLineIndex((i) => i + 1);
    } else {
      sound.playFanfare();
      setIsCompleted(true);
    }
  };

  // Determine if check button should be disabled
  const isCheckDisabled = () => {
    if (!currentExercise) return true;
    if (currentExercise.type === 'word_bank' || currentExercise.type === 'audio_listen') {
      return selectedWordBank.length === 0;
    }
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'dialogue_complete') {
      return selectedOption === null;
    }
    if (currentExercise.type === 'match_pairs') {
      return matchedPairIds.length < (currentExercise.pairs || []).length;
    }
    return false;
  };

  // Progress percentage
  const progressPercent = isStory
    ? ((storyLineIndex + 1) / (node.storyLines?.length || 1)) * 100
    : exercises.length > 0
    ? ((currentIndex + (checkStatus === 'correct' ? 1 : 0)) / exercises.length) * 100
    : 100;

  // Render Story Mode
  if (isStory && !isCompleted) {
    const currentLine = node.storyLines![storyLineIndex];
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e14] text-slate-100 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800 bg-[#0d1117]">
          <button
            onClick={() => setShowQuitConfirm(true)}
            className="p-2 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Story Body */}
        <div className="flex-1 max-w-xl w-full mx-auto p-6 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center text-3xl mb-6 shadow-md">
            📖
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-purple-400 mb-1">
            {node.title} · Step {storyLineIndex + 1} of {node.storyLines!.length}
          </span>
          <span className="text-sm font-bold text-slate-400 mb-6">{currentLine.speaker} says:</span>

          {/* Target speech bubble */}
          <div className="p-6 bg-[#161b22] border-2 border-slate-800 rounded-3xl shadow-lg max-w-md w-full relative mb-4">
            <div className="text-xl sm:text-2xl font-black text-white leading-relaxed">
              "{currentLine.text}"
            </div>
            <button
              onClick={() => sound.speak(currentLine.text, currentLanguage.code)}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-[#21262d] rounded-xl text-xs font-extrabold text-emerald-400 border border-slate-700 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Listen
            </button>
          </div>

          {/* Translation hint */}
          <div className="text-sm text-slate-400 italic">
            "{currentLine.translation}"
          </div>
        </div>

        {/* Bottom continue */}
        <div className="p-6 border-t border-slate-800 bg-[#0d1117] flex justify-center">
          <button
            onClick={handleStoryNext}
            className="btn-3d w-full max-w-md py-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-purple-800 cursor-pointer"
          >
            {storyLineIndex < node.storyLines!.length - 1 ? 'Next' : 'Finish Story'}
          </button>
        </div>
      </div>
    );
  }

  // Render Lesson Victory Screen
  if (isCompleted) {
    const accuracy = Math.max(10, Math.round(((exercises.length - mistakesCount) / Math.max(1, exercises.length)) * 100));
    const perfect = mistakesCount === 0;

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#0b0e14] text-slate-100">
        <div className="max-w-md w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400 mb-6">
            <img
              src="/src/assets/images/polypanda_mascot_logo_1794049862453.jpg"
              alt="Pao Cheering"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            <span>LESSON COMPLETED!</span>
          </div>

          <h2 className="text-3xl font-black text-white mb-2">
            {perfect ? 'Flawless Victory!' : 'Outstanding Effort!'}
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            You just expanded your linguistic power in {currentLanguage.name}. Pao is proud of you!
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            <div className="p-4 rounded-2xl bg-[#161b22] border border-amber-500/30 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-400">Total XP</span>
              <span className="block text-2xl font-black text-amber-400 mt-1">+{node.xpReward}</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#161b22] border border-emerald-500/30 text-center">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400">Accuracy</span>
              <span className="block text-2xl font-black text-emerald-400 mt-1">{accuracy}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#161b22] border border-sky-500/30 text-center">
              <span className="text-[10px] font-extrabold uppercase text-sky-400">Streak</span>
              <span className="block text-2xl font-black text-sky-400 mt-1">🔥 {userStats.streak}</span>
            </div>
          </div>

          <button
            onClick={() => onFinishLesson(node.xpReward, accuracy, perfect)}
            className="btn-3d w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-lg border-b-4 border-emerald-700 cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Render Out of Hearts Screen
  if (heartsLeft <= 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#0b0e14] text-slate-100">
        <div className="max-w-md w-full flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-4xl mb-4">
            💔
          </div>
          <h2 className="text-3xl font-black text-white mb-2">Out of Hearts!</h2>
          <p className="text-sm text-slate-400 mb-8 max-w-xs">
            Mistakes are part of learning. You can practice to restore hearts without losing gems!
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onClose}
              className="btn-3d w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 cursor-pointer"
            >
              Practice in Practice Hub
            </button>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Back to Path
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0e14] text-slate-100 overflow-y-auto">
      {/* Top Header Bar */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-800 bg-[#0d1117]">
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="p-1.5 text-slate-400 hover:text-white cursor-pointer rounded-lg hover:bg-[#161b22]"
          title="Quit Lesson"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Bar */}
        <div className="flex-1 h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hearts Life counter */}
        <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-sm pl-2">
          <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          <span className="tabular-nums">{heartsLeft}</span>
        </div>
      </div>

      {/* Main Exercise Canvas */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-8 flex flex-col justify-center">
        {currentExercise && (
          <div>
            {/* Prompt */}
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {currentExercise.prompt}
              </h3>
              {currentExercise.nativeSentence && (
                <div className="flex items-center gap-3 mt-4 p-4 rounded-2xl bg-[#161b22] border border-slate-800">
                  <button
                    onClick={() => playCurrentAudio(false)}
                    className="btn-3d p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs cursor-pointer"
                    title="Listen pronunciation"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-bold text-slate-100">
                    {currentExercise.nativeSentence}
                  </span>
                </div>
              )}
            </div>

            {/* Exercise Type 1: Word Bank Builder & Audio Listen */}
            {(currentExercise.type === 'word_bank' || currentExercise.type === 'audio_listen') && (
              <div className="flex flex-col gap-6">
                {currentExercise.type === 'audio_listen' && (
                  <div className="flex items-center justify-center gap-4 my-2">
                    <button
                      onClick={() => playCurrentAudio(false)}
                      className="btn-3d p-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-4 border-emerald-700 cursor-pointer flex items-center gap-2"
                    >
                      <Volume2 className="w-8 h-8" />
                      <span className="font-extrabold text-sm">Play Audio</span>
                    </button>
                    <button
                      onClick={() => playCurrentAudio(true)}
                      className="btn-3d p-4 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-md border-b-4 border-amber-600 cursor-pointer flex items-center gap-2"
                      title="Slow pronunciation"
                    >
                      <Snail className="w-8 h-8" />
                      <span className="font-extrabold text-sm">Slow</span>
                    </button>
                  </div>
                )}

                {/* Selected Words Tray */}
                <div className="min-h-16 p-3 bg-[#161b22]/70 rounded-2xl border-2 border-slate-800 flex flex-wrap gap-2 items-center">
                  {selectedWordBank.length === 0 ? (
                    <span className="text-sm font-semibold text-slate-500 italic px-2">
                      Tap tiles below to build the sentence...
                    </span>
                  ) : (
                    selectedWordBank.map((word, idx) => (
                      <button
                        key={`${word}-${idx}`}
                        onClick={() => handleReturnWord(word, idx)}
                        className="btn-3d px-4 py-2.5 bg-[#21262d] text-slate-100 font-extrabold text-sm rounded-xl border border-slate-700 shadow-xs hover:border-rose-400 cursor-pointer"
                      >
                        {word}
                      </button>
                    ))
                  )}
                </div>

                {/* Word Bank Pool */}
                <div className="flex flex-wrap justify-center gap-2.5 pt-4">
                  {availableWords.map((word, idx) => (
                    <button
                      key={`${word}-${idx}`}
                      onClick={() => handleSelectWord(word, idx)}
                      className="btn-3d px-4 py-2.5 bg-[#161b22] hover:bg-[#21262d] text-slate-100 font-extrabold text-sm rounded-2xl border-2 border-slate-800 hover:border-emerald-500 shadow-sm transition-all cursor-pointer"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Type 2: Match Pairs */}
            {currentExercise.type === 'match_pairs' && currentExercise.pairs && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Interleaved target and native tiles */}
                {(() => {
                  const items: { id: string; text: string; side: 'target' | 'native' }[] = [];
                  currentExercise.pairs.forEach((p) => {
                    items.push({ id: p.id, text: p.target, side: 'target' });
                    items.push({ id: p.id, text: p.native, side: 'native' });
                  });
                  return items.map((item, idx) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedFirstPair?.id === item.id && selectedFirstPair.side === item.side;

                    return (
                      <button
                        key={`${item.id}-${item.side}-${idx}`}
                        disabled={isMatched}
                        onClick={() => handleTilePairClick(item)}
                        className={`btn-3d p-4 rounded-2xl font-extrabold text-sm border-2 transition-all cursor-pointer text-center ${
                          isMatched
                            ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 opacity-60 cursor-default'
                            : isSelected
                            ? 'bg-sky-950/70 border-sky-400 text-sky-200 scale-102 shadow-sm'
                            : 'bg-[#161b22] hover:bg-[#21262d] border-slate-800 text-slate-100 hover:border-slate-600'
                        }`}
                      >
                        {item.text}
                      </button>
                    );
                  });
                })()}
              </div>
            )}

            {/* Exercise Type 3: Multiple Choice & Dialogue Complete */}
            {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'dialogue_complete') && currentExercise.options && (
              <div className="flex flex-col gap-3 pt-2">
                {currentExercise.dialogueContext && (
                  <div className="p-4 bg-[#161b22] rounded-2xl border border-slate-800 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {currentExercise.dialogueSpeaker || 'Speaker'}:
                    </span>
                    <span className="text-lg font-black text-white">
                      "{currentExercise.dialogueContext}"
                    </span>
                  </div>
                )}
                {currentExercise.options.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (checkStatus !== 'idle') return;
                        sound.playClick();
                        setSelectedOption(option);
                      }}
                      className={`btn-3d flex items-center justify-between p-4 rounded-2xl border-2 text-left font-extrabold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-[#161b22] hover:bg-[#21262d] border-slate-800 text-slate-100 hover:border-slate-600'
                      }`}
                    >
                      <span>{option}</span>
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-[#21262d] text-slate-400 font-bold border border-slate-700/60">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tactile Feedback Bar */}
      <div
        className={`p-6 border-t transition-colors ${
          checkStatus === 'correct'
            ? 'bg-emerald-950/90 border-emerald-800/80 text-emerald-200'
            : checkStatus === 'wrong'
            ? 'bg-rose-950/90 border-rose-800/80 text-rose-200'
            : 'bg-[#0d1117] border-slate-800 text-slate-100'
        }`}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {checkStatus === 'idle' ? (
            <>
              <button
                onClick={() => {
                  // Skip question
                  sound.playClick();
                  handleContinue();
                }}
                className="text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Skip
              </button>
              <button
                disabled={isCheckDisabled()}
                onClick={handleCheckAnswer}
                className={`btn-3d px-10 py-3.5 font-black uppercase tracking-wider rounded-2xl text-sm transition-all cursor-pointer ${
                  isCheckDisabled()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-4 border-emerald-700'
                }`}
              >
                Check
              </button>
            </>
          ) : checkStatus === 'correct' ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <div>
                  <span className="block text-lg font-black text-emerald-200">
                    Nicely done!
                  </span>
                  <span className="block text-xs font-semibold text-emerald-400">
                    Great accuracy!
                  </span>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="btn-3d px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-md border-b-4 border-emerald-700 cursor-pointer"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-rose-400" />
                <div>
                  <span className="block text-lg font-black text-rose-200">
                    Not quite
                  </span>
                  <span className="block text-xs font-semibold text-rose-300">
                    Correct solution: {currentExercise?.targetSentence || currentExercise?.correctOption || 'See answer'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleContinue}
                className="btn-3d px-8 py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-wider rounded-2xl shadow-md border-b-4 border-rose-700 cursor-pointer"
              >
                Got It
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quit Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0d1117] rounded-3xl p-6 shadow-2xl border border-slate-800 text-center">
            <h3 className="text-xl font-black text-white mb-2">
              Quit lesson?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              All progress in this session will be lost if you leave now.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="btn-3d w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-emerald-700 cursor-pointer"
              >
                Keep Learning
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
