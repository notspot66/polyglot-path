import React, { useState } from 'react';
import { UserStats, Language } from '../types';
import { sound } from '../utils/audio';
import { Dumbbell, Heart, Headphones, Sparkles, BookOpen, Volume2, CheckCircle2 } from 'lucide-react';

interface PracticeHubViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onRefillHeart: () => void;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({
  userStats,
  currentLanguage,
  onRefillHeart,
}) => {
  const [activeSession, setActiveSession] = useState<'none' | 'hearts' | 'listening'>('none');
  const [practiceStep, setPracticeStep] = useState(0);
  const [userSelected, setUserSelected] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Practice drill questions
  const practiceQuestions = [
    {
      q: `What is the traditional greeting in ${currentLanguage.name}?`,
      options: [currentLanguage.greeting, 'Adios', 'Good night', 'Where is it?'],
      correct: currentLanguage.greeting,
      audio: currentLanguage.greeting,
    },
    {
      q: `What does "${currentLanguage.greeting}" mean in English?`,
      options: [currentLanguage.greetingMeaning, 'Cold water', 'Train station', 'Goodbye friend'],
      correct: currentLanguage.greetingMeaning,
      audio: currentLanguage.greeting,
    },
    {
      q: `Which language family does ${currentLanguage.name} belong to?`,
      options: [currentLanguage.family, 'Latin Vulgar', 'Binary Conlang', 'Old High Gothic'],
      correct: currentLanguage.family,
      audio: currentLanguage.name,
    },
  ];

  const currentQ = practiceQuestions[practiceStep];

  const handleStartHeartWorkout = () => {
    sound.playClick();
    setActiveSession('hearts');
    setPracticeStep(0);
    setUserSelected(null);
    setIsAnswerChecked(false);
    setSessionCompleted(false);
  };

  const handleCheckAnswer = () => {
    if (!userSelected) return;
    setIsAnswerChecked(true);
    if (userSelected === currentQ.correct) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }
  };

  const handleNextStep = () => {
    if (practiceStep < practiceQuestions.length - 1) {
      setPracticeStep((s) => s + 1);
      setUserSelected(null);
      setIsAnswerChecked(false);
    } else {
      sound.playFanfare();
      setSessionCompleted(true);
      onRefillHeart();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 px-4 pb-28">
      {/* Practice Header */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-xl mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-100">
            Fluency Gym
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-0.5">Practice Hub</h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            Strengthen your weak words, train your ear, and restore lost hearts!
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-3xl shrink-0">
          🏋️
        </div>
      </div>

      {/* Active Practice Session Modal / Inline View */}
      {activeSession === 'hearts' && (
        <div className="w-full bg-[#161b22] rounded-3xl border-2 border-emerald-500 p-6 shadow-xl mb-8 animate-in zoom-in-95 duration-150">
          {!sessionCompleted ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Heart Recovery Drill {practiceStep + 1} of {practiceQuestions.length}</span>
                </div>
                <button
                  onClick={() => setActiveSession('none')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Exit Drill
                </button>
              </div>

              {/* Question */}
              <div className="mb-5">
                <h4 className="text-lg font-black text-white">
                  {currentQ.q}
                </h4>
                {currentQ.audio && (
                  <button
                    onClick={() => sound.speak(currentQ.audio, currentLanguage.code)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#21262d] text-xs font-bold text-slate-300 hover:text-emerald-400 cursor-pointer border border-slate-700"
                  >
                    <Volume2 className="w-4 h-4" /> Listen Audio
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5 mb-6">
                {currentQ.options.map((opt, i) => {
                  const isSelected = userSelected === opt;
                  return (
                    <button
                      key={i}
                      disabled={isAnswerChecked}
                      onClick={() => {
                        sound.playClick();
                        setUserSelected(opt);
                      }}
                      className={`btn-3d p-4 rounded-2xl border-2 text-left font-extrabold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                          : 'bg-[#0d1117] border-slate-800 text-slate-100 hover:border-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Check / Next */}
              {!isAnswerChecked ? (
                <button
                  disabled={!userSelected}
                  onClick={handleCheckAnswer}
                  className={`btn-3d w-full py-3.5 font-black uppercase rounded-2xl text-xs tracking-wider cursor-pointer ${
                    userSelected
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-b-4 border-emerald-700'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border-none'
                  }`}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="btn-3d w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase rounded-2xl text-xs tracking-wider shadow-md border-b-4 border-emerald-700 cursor-pointer"
                >
                  {practiceStep < practiceQuestions.length - 1 ? 'Next Question' : 'Complete Workout'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-3">
                <Heart className="w-9 h-9 fill-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white">
                Heart Restored! (+1 ❤️)
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Great job! You reviewed your core fundamentals in {currentLanguage.name}.
              </p>
              <button
                onClick={() => setActiveSession('none')}
                className="btn-3d w-full py-3 bg-emerald-500 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 cursor-pointer"
              >
                Back to Practice Hub
              </button>
            </div>
          )}
        </div>
      )}

      {/* Practice Options Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Heart Workout */}
        <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-3">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <h4 className="text-base font-black text-white">
              Heart Recharge Drill
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Answer 3 quick review questions to refill +1 Heart without spending gems.
            </p>
          </div>

          <button
            onClick={handleStartHeartWorkout}
            className="btn-3d mt-5 w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs border-b-2 border-rose-700 cursor-pointer"
          >
            Start Heart Drill (+1 ❤️)
          </button>
        </div>

        {/* Card 2: Listening Gym */}
        <div className="p-5 rounded-3xl bg-[#161b22] border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-950/40 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white">
              Listening & Ear Trainer
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Listen to native pronunciation clips at normal and slow speeds to sharpen comprehension.
            </p>
          </div>

          <button
            onClick={() => {
              sound.speak(currentLanguage.greeting, currentLanguage.code);
            }}
            className="btn-3d mt-5 w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs border-b-2 border-sky-700 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Volume2 className="w-4 h-4" /> Listen to {currentLanguage.name}
          </button>
        </div>
      </div>
    </div>
  );
};
