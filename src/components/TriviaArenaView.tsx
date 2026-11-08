import React, { useState, useEffect } from 'react';
import { Language, UserStats } from '../types';
import {
  Swords,
  Coins,
  Trophy,
  Zap,
  Timer,
  CheckCircle2,
  XCircle,
  Flame,
  Award,
  Crown,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TriviaArenaViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenShop: () => void;
}

interface RivalChallenger {
  name: string;
  avatar: string;
  country: string;
  flag: string;
  winRate: string;
  rankTitle: string;
}

const CHALLENGERS: RivalChallenger[] = [
  { name: 'Elena Rossi', avatar: '🦊', country: 'Spain', flag: '🇪🇸', winRate: '78%', rankTitle: 'Ruby Gladiator' },
  { name: 'Kenji Sato', avatar: '⚡', country: 'Japan', flag: '🇯🇵', winRate: '84%', rankTitle: 'Diamond Duelist' },
  { name: 'Chloe Dubois', avatar: '👑', country: 'France', flag: '🇫🇷', winRate: '72%', rankTitle: 'Emerald Striker' },
  { name: 'Mateo Silva', avatar: '🔥', country: 'Brazil', flag: '🇧🇷', winRate: '80%', rankTitle: 'Sapphire Champion' },
];

const ARENA_QUESTIONS: Record<string, { q: string; options: string[]; answer: string; hint: string }[]> = {
  es: [
    { q: 'How do you say "The Golden Sunset" in Spanish?', options: ['La puesta de sol dorada', 'El amanecer dorado', 'La noche dorada', 'El mediodía sol'], answer: 'La puesta de sol dorada', hint: 'Puesta de sol means sunset.' },
    { q: 'Choose the correct conjugation: "Nosotros _____ cinco idiomas."', options: ['hablamos', 'hablan', 'hablo', 'habláis'], answer: 'hablamos', hint: 'First person plural -amos' },
    { q: 'What is the opposite of "Siempre" (Always)?', options: ['Nunca', 'A veces', 'Quizás', 'Pronto'], answer: 'Nunca', hint: 'Means never.' },
    { q: 'Translate: "I would like to order coffee."', options: ['Me gustaría pedir café', 'Yo quiero comer café', 'Me gusta comprar agua', 'Bebo un café ahora'], answer: 'Me gustaría pedir café', hint: 'Polite conditional form.' },
    { q: 'Which word is feminine in Spanish?', options: ['La costumbre', 'El mapa', 'El día', 'El problema'], answer: 'La costumbre', hint: 'Words ending in -umbre are feminine.' },
  ],
  default: [
    { q: 'Which greeting means "Good Morning"?', options: ['Buenos días', 'Buenas noches', 'Hola amigo', 'Hasta luego'], answer: 'Buenos días', hint: 'Used before noon.' },
    { q: 'Select the word for "Thank you very much":', options: ['Muchas gracias', 'Por favor', 'De nada', 'Disculpe'], answer: 'Muchas gracias', hint: 'Gratitude phrase.' },
    { q: 'What does "La biblioteca" mean?', options: ['The library', 'The bookstore', 'The school', 'The museum'], answer: 'The library', hint: 'Place with free lending books.' },
    { q: 'Choose the word that means "Water":', options: ['El agua', 'El fuego', 'La tierra', 'El aire'], answer: 'El agua', hint: 'H2O' },
    { q: 'Select the correct farewell for "See you tomorrow":', options: ['Hasta mañana', 'Hasta pronto', 'Adiós para siempre', 'Buenas tardes'], answer: 'Hasta mañana', hint: 'Mañana means tomorrow.' },
  ],
};

export const TriviaArenaView: React.FC<TriviaArenaViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenShop,
}) => {
  const [matchState, setMatchState] = useState<'lobby' | 'matchmaking' | 'playing' | 'result'>('lobby');
  const [wagerAmount, setWagerAmount] = useState<number>(100);
  const [rival, setRival] = useState<RivalChallenger>(CHALLENGERS[0]);

  // Round states
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [userScore, setUserScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roundResolved, setRoundResolved] = useState(false);

  const questions = ARENA_QUESTIONS[currentLanguage.id] || ARENA_QUESTIONS.default;

  // Countdown timer during match
  useEffect(() => {
    if (matchState !== 'playing' || roundResolved) return;

    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [matchState, timeLeft, roundResolved]);

  const startMatchmaking = () => {
    if ((userStats.coins || 0) < wagerAmount) {
      alert('Insufficient wager coins! Earn coins by completing lessons or exchange gems in the Shop.');
      return;
    }

    sound.playClick();
    setMatchState('matchmaking');
    const randomRival = CHALLENGERS[Math.floor(Math.random() * CHALLENGERS.length)];
    setRival(randomRival);

    // Deduct wager
    onUpdateUserStats((prev) => ({
      ...prev,
      coins: (prev.coins || 0) - wagerAmount,
    }));

    setTimeout(() => {
      sound.playFanfare();
      setCurrentRound(0);
      setUserScore(0);
      setRivalScore(0);
      setTimeLeft(10);
      setSelectedAnswer(null);
      setRoundResolved(false);
      setMatchState('playing');
    }, 2200);
  };

  const handleSelectOption = (option: string) => {
    if (selectedAnswer !== null || roundResolved) return;

    sound.playClick();
    setSelectedAnswer(option);
    setRoundResolved(true);

    const isCorrect = option === questions[currentRound].answer;
    if (isCorrect) {
      sound.playFanfare();
      setUserScore((prev) => prev + 100 + timeLeft * 10);
    } else {
      sound.playWrong();
      // Auto register weak word in SRS deck!
      onUpdateUserStats((prev) => {
        const existing = prev.weakWordsDeck.find((w) => w.term === questions[currentRound].q);
        if (existing) {
          return {
            ...prev,
            weakWordsDeck: prev.weakWordsDeck.map((w) =>
              w.id === existing.id
                ? { ...w, incorrectCount: w.incorrectCount + 1, masteryLevel: Math.max(1, w.masteryLevel - 1) }
                : w
            ),
          };
        }
        return {
          ...prev,
          weakWordsDeck: [
            ...prev.weakWordsDeck,
            {
              id: `ww-${Date.now()}`,
              term: questions[currentRound].options[0],
              meaning: questions[currentRound].answer,
              languageId: currentLanguage.id,
              incorrectCount: 1,
              correctStreak: 0,
              masteryLevel: 1,
              lastReviewedAt: new Date().toISOString(),
              nextReviewAt: new Date(Date.now() + 3600000 * 2).toISOString(),
            },
          ],
        };
      });
    }

    // Rival simulated answer (75% probability of correct)
    const rivalCorrect = Math.random() < 0.75;
    if (rivalCorrect) {
      setRivalScore((prev) => prev + 100 + Math.floor(Math.random() * 6) * 10);
    }

    // Move to next round after 1.8s
    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((prev) => prev + 1);
        setTimeLeft(10);
        setSelectedAnswer(null);
        setRoundResolved(false);
      } else {
        finishMatch();
      }
    }, 1800);
  };

  const handleTimeout = () => {
    setRoundResolved(true);
    sound.playWrong();

    const rivalCorrect = Math.random() < 0.7;
    if (rivalCorrect) {
      setRivalScore((prev) => prev + 80);
    }

    setTimeout(() => {
      if (currentRound + 1 < questions.length) {
        setCurrentRound((prev) => prev + 1);
        setTimeLeft(10);
        setSelectedAnswer(null);
        setRoundResolved(false);
      } else {
        finishMatch();
      }
    }, 1800);
  };

  const finishMatch = () => {
    setMatchState('result');
    const userWon = userScore >= rivalScore;

    if (userWon) {
      sound.playFanfare();
      const prizePool = wagerAmount * 2;
      onUpdateUserStats((prev) => ({
        ...prev,
        coins: (prev.coins || 0) + prizePool,
        totalXp: prev.totalXp + 60,
      }));
    } else {
      sound.playWrong();
    }
  };

  const currentQ = questions[currentRound] || questions[0];
  const potSize = wagerAmount * 2;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto py-6 px-4 pb-28">
      {/* Top Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 p-6 sm:p-7 text-white shadow-2xl mb-6 relative overflow-hidden border border-rose-400/30">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-rose-200 border border-white/20 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-300" />
                <span>1v1 WAGER ARENA</span>
              </span>
              <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                Real-Time Bets
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">TRIVIA ARENA</h1>
            <p className="text-xs sm:text-sm text-rose-100 font-semibold mt-1">
              Wager virtual coins on 5-round speed duels. Winner takes the whole pot!
            </p>
          </div>

          {/* User Coin Balance Badge */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
            <Coins className="w-7 h-7 text-amber-400 animate-bounce" />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
                Your Arena Wallet
              </span>
              <span className="text-2xl font-black text-white tabular-nums">
                {userStats.coins || 0} <span className="text-xs font-bold text-amber-400">Coins</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOBBY: Wager Selection & Challenger Preview */}
      {matchState === 'lobby' && (
        <div className="w-full bg-[#161b22] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col items-center text-center animate-in fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-900/30">
            <Swords className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white">Select Your Wager Stake</h2>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold mt-1 max-w-md">
            Choose your wager tier. You and your opponent contribute equally. Win the speed duel to take home double!
          </p>

          {/* Wager Tier Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full my-6 max-w-xl">
            {[50, 100, 250, 500, 1000].map((amt) => {
              const isSelected = wagerAmount === amt;
              return (
                <button
                  key={amt}
                  onClick={() => {
                    sound.playClick();
                    setWagerAmount(amt);
                  }}
                  className={`p-3.5 rounded-2xl font-black text-sm flex flex-col items-center gap-1 transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-[#0d1117] text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Coins className={`w-5 h-5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                  <span>{amt}</span>
                  <span className="text-[10px] font-bold opacity-80">Win {amt * 2}</span>
                </button>
              );
            })}
          </div>

          {/* Pot summary */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black mb-6">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Guaranteed Match Winner Pot: {wagerAmount * 2} Coins (+60 XP)</span>
          </div>

          {/* Enter Matchmaking Button */}
          <button
            onClick={startMatchmaking}
            className="btn-3d w-full max-w-md py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 hover:opacity-95 active:translate-y-0.5 text-white font-black text-base uppercase tracking-wider shadow-xl shadow-rose-900/30 flex items-center justify-center gap-2 cursor-pointer border-b-4 border-rose-800"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>Find Challenger (Wager {wagerAmount} Coins)</span>
          </button>
        </div>
      )}

      {/* MATCHMAKING RADAR */}
      {matchState === 'matchmaking' && (
        <div className="w-full bg-[#161b22] rounded-3xl p-10 border border-slate-800 shadow-xl flex flex-col items-center text-center animate-in zoom-in-95">
          <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-4xl shadow-xl">
              ⚔️
            </div>
          </div>

          <h3 className="text-2xl font-black text-white">Searching Global Opponent...</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Matching with rival polyglot learners in <strong className="text-teal-400">{currentLanguage.name}</strong>
          </p>

          <div className="mt-6 flex items-center gap-4 bg-[#0d1117] p-4 rounded-2xl border border-slate-800">
            <span className="text-3xl">{rival.avatar}</span>
            <div className="text-left">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                {rival.name} {rival.flag}
              </span>
              <span className="text-[11px] font-bold text-amber-400 block">{rival.rankTitle} • Winrate: {rival.winRate}</span>
            </div>
            <span className="text-xs font-black text-emerald-400 ml-4 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              CONNECTED
            </span>
          </div>
        </div>
      )}

      {/* LIVE 1V1 QUIZ MATCH */}
      {matchState === 'playing' && (
        <div className="w-full bg-[#161b22] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col animate-in fade-in">
          {/* Match Scoreboard */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-2xl font-black text-white border-2 border-teal-400">
                👤
              </div>
              <div>
                <span className="text-sm font-black text-white block">You</span>
                <span className="text-xl font-black text-teal-400 tabular-nums">{userScore} pts</span>
              </div>
            </div>

            {/* Timer & Pot Center */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full ${
                timeLeft <= 3 ? 'bg-rose-500 text-white animate-bounce' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                <Timer className="w-4 h-4" />
                <span>{timeLeft}s</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-1">Round {currentRound + 1} of {questions.length}</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-0.5">Pot: {potSize} Coins</span>
            </div>

            {/* Rival Info */}
            <div className="flex items-center gap-3 text-right">
              <div>
                <span className="text-sm font-black text-white block">{rival.name} {rival.flag}</span>
                <span className="text-xl font-black text-rose-400 tabular-nums">{rivalScore} pts</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-2xl border-2 border-rose-400">
                {rival.avatar}
              </div>
            </div>
          </div>

          {/* Question Box */}
          <div className="text-center my-4">
            <span className="text-xs font-black uppercase tracking-wider text-teal-400 mb-1 block">
              Question {currentRound + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white max-w-xl mx-auto leading-relaxed">
              {currentQ.q}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mt-1 italic">
              Hint: {currentQ.hint}
            </p>
          </div>

          {/* 4 Multi-Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrectAnswer = opt === currentQ.answer;

              let btnStyle = 'bg-[#0d1117] text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-[#161b22]';
              if (roundResolved) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-[1.02]';
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = 'bg-rose-600 text-white border-rose-400';
                }
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={roundResolved}
                  className={`p-4 rounded-2xl font-extrabold text-sm text-left transition-all cursor-pointer border-2 flex items-center justify-between ${btnStyle} disabled:cursor-not-allowed`}
                >
                  <span>{opt}</span>
                  {roundResolved && isCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  {roundResolved && isSelected && !isCorrectAnswer && <XCircle className="w-5 h-5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FINAL MATCH RESULT */}
      {matchState === 'result' && (
        <div className="w-full bg-[#161b22] rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95">
          {userScore >= rivalScore ? (
            <>
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-4 shadow-xl shadow-amber-500/30">
                🏆
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full mb-1">
                VICTORY ROYALE!
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">You Won the Duel!</h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
                You outperformed {rival.name} ({userScore} vs {rivalScore} pts).
              </p>

              <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">Coins Won</span>
                    <span className="text-xl font-black text-amber-300">+{potSize}</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-teal-400" />
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 font-bold block">XP Earned</span>
                    <span className="text-xl font-black text-teal-300">+60 XP</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-4xl mb-4">
                ⚔️
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-rose-400 bg-rose-500/20 px-3 py-1 rounded-full mb-1">
                DEFEAT
              </span>
              <h2 className="text-3xl font-black text-white">Close Match!</h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
                {rival.name} edged ahead with {rivalScore} pts to your {userScore} pts.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Missed questions have been automatically added to your <strong>SRS Weak Words Deck</strong> for spaced repetition practice!
              </p>
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setMatchState('lobby')}
              className="btn-3d px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 border-amber-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Duel</span>
            </button>
            <button
              onClick={onOpenShop}
              className="px-5 py-3 rounded-2xl bg-[#0d1117] hover:bg-[#21262d] text-slate-200 border border-slate-700 font-bold text-sm cursor-pointer"
            >
              Refill Coins in Shop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
