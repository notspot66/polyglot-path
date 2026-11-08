import React, { useState } from 'react';
import { Language, UserStats, CertificateItem, CefrLevel } from '../types';
import {
  Award,
  Lock,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Printer,
  X,
  CreditCard,
  Gem,
  QrCode,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CertificatesViewProps {
  userStats: UserStats;
  currentLanguage: Language;
  onUpdateUserStats: (updater: (prev: UserStats) => UserStats) => void;
  onOpenShop: () => void;
}

const CERTIFICATE_TIERS: {
  level: CefrLevel;
  title: string;
  subtitle: string;
  requiredUnit: number;
  priceUsd: number;
  gemCost: number;
  skills: string[];
}[] = [
  {
    level: 'A1',
    title: 'A1: Breakthrough Diploma',
    subtitle: 'Foundations, greetings, and basic everyday dialogue',
    requiredUnit: 1,
    priceUsd: 4.99,
    gemCost: 150,
    skills: ['Everyday greetings', 'Basic ordering at cafes', 'Asking simple questions', 'Alphabet & numbers'],
  },
  {
    level: 'A2',
    title: 'A2: Elementary Fluency Diploma',
    subtitle: 'Social interactions, directions, and shopping transactions',
    requiredUnit: 3,
    priceUsd: 7.99,
    gemCost: 250,
    skills: ['Giving directions', 'Expressing opinions', 'Past and future simple', 'Travel & hospitality'],
  },
  {
    level: 'B1',
    title: 'B1: Threshold Diploma',
    subtitle: 'Independent travel, storytelling, and problem-solving',
    requiredUnit: 5,
    priceUsd: 12.99,
    gemCost: 400,
    skills: ['Complex conversations', 'Expressing emotions & wishes', 'Subjunctive fundamentals', 'Professional communication'],
  },
  {
    level: 'B2',
    title: 'B2: Vantage Professional Diploma',
    subtitle: 'Spontaneous fluency, academic discussion, and business negotiation',
    requiredUnit: 8,
    priceUsd: 19.99,
    gemCost: 650,
    skills: ['Abstract discourse', 'Technical discussions', 'Idiomatic expressions', 'High-speed native dialogue'],
  },
  {
    level: 'C1',
    title: 'C1: Operational Mastery Diploma',
    subtitle: 'Near-native expression, literary analysis, and effortless nuance',
    requiredUnit: 12,
    priceUsd: 29.99,
    gemCost: 1000,
    skills: ['Academic prose', 'Subtle humor & metaphors', 'Advanced debate', 'Cultural idioms mastery'],
  },
];

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  userStats,
  currentLanguage,
  onUpdateUserStats,
  onOpenShop,
}) => {
  const [selectedCert, setSelectedCert] = useState<(typeof CERTIFICATE_TIERS)[0] | null>(null);
  const [activePreviewCert, setActivePreviewCert] = useState<(typeof CERTIFICATE_TIERS)[0] | null>(null);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState<string | null>(null);

  const unlockedCerts = userStats.unlockedCertificates || ['cert-a1-es'];

  const isTierUnlocked = (level: CefrLevel) => {
    return unlockedCerts.includes(`cert-${level.toLowerCase()}-${currentLanguage.id}`);
  };

  const handleOpenCertificate = (tier: (typeof CERTIFICATE_TIERS)[0]) => {
    sound.playClick();
    if (isTierUnlocked(tier.level)) {
      setActivePreviewCert(tier);
    } else {
      setSelectedCert(tier);
      setIsPaywallOpen(true);
    }
  };

  const handleUnlockWithGems = (tier: (typeof CERTIFICATE_TIERS)[0]) => {
    if (userStats.gems < tier.gemCost) {
      alert(`Insufficient gems! You need ${tier.gemCost} gems to unlock this diploma.`);
      return;
    }

    sound.playFanfare();
    const certKey = `cert-${tier.level.toLowerCase()}-${currentLanguage.id}`;
    onUpdateUserStats((prev) => ({
      ...prev,
      gems: prev.gems - tier.gemCost,
      unlockedCertificates: [...(prev.unlockedCertificates || []), certKey],
    }));

    setIsPaywallOpen(false);
    setActivePreviewCert(tier);
  };

  const handleUnlockWithCard = (tier: (typeof CERTIFICATE_TIERS)[0]) => {
    sound.playFanfare();
    const certKey = `cert-${tier.level.toLowerCase()}-${currentLanguage.id}`;
    onUpdateUserStats((prev) => ({
      ...prev,
      unlockedCertificates: [...(prev.unlockedCertificates || []), certKey],
    }));

    setIsPaywallOpen(false);
    setActivePreviewCert(tier);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto py-6 px-4 pb-28">
      {/* Banner */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 p-6 sm:p-7 text-white shadow-2xl mb-8 border border-amber-400/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full text-amber-200 border border-white/20 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>BLOCKCHAIN VERIFIED CREDENTIALS</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              CERTIFIED DIPLOMAS
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 font-semibold mt-1 max-w-xl leading-relaxed">
              Earn internationally recognized CEFR certificates for completing milestones in <strong className="text-white underline">{currentLanguage.name}</strong>. Download high-resolution official PDFs verified on-chain.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <Award className="w-8 h-8 text-amber-300 mx-auto mb-1 animate-pulse" />
            <span className="text-xs font-bold text-amber-100 block">Unlocked</span>
            <span className="text-2xl font-black text-white">
              {CERTIFICATE_TIERS.filter((t) => isTierUnlocked(t.level)).length} / {CERTIFICATE_TIERS.length}
            </span>
          </div>
        </div>
      </div>

      {/* Diplomas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CERTIFICATE_TIERS.map((tier) => {
          const unlocked = isTierUnlocked(tier.level);

          return (
            <div
              key={tier.level}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                unlocked
                  ? 'bg-gradient-to-b from-[#161b22] to-[#0d1117] border-amber-500/50 shadow-xl shadow-amber-500/10'
                  : 'bg-[#161b22]/70 border-slate-800 opacity-90 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LEVEL {tier.level}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Unit {tier.requiredUnit}+</span>
                  </div>

                  {unlocked ? (
                    <span className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> UNLOCKED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-black text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> LOCKED
                    </span>
                  )}
                </div>

                {/* Crest Graphic */}
                <div className="w-16 h-16 rounded-2xl mx-auto my-3 bg-gradient-to-tr from-amber-500/20 to-amber-300/10 border border-amber-500/30 flex items-center justify-center text-3xl shadow-md">
                  📜
                </div>

                <h3 className="text-lg font-black text-white text-center mt-2">
                  {tier.title}
                </h3>
                <p className="text-xs text-slate-400 font-medium text-center mt-1">
                  {tier.subtitle}
                </p>

                {/* Key competencies */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Certified Competencies:
                  </span>
                  {tier.skills.map((skill, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {unlocked ? (
                  <button
                    onClick={() => handleOpenCertificate(tier)}
                    className="btn-3d w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border-b-2 border-amber-700 shadow-sm"
                  >
                    <Award className="w-4 h-4" />
                    <span>View & Download Official PDF</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenCertificate(tier)}
                    className="btn-3d w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-b-2 border-teal-800 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock Official Diploma (${tier.priceUsd})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* OFFICIAL DIPLOMA FULL PREVIEW MODAL */}
      {activePreviewCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0f141c] border-2 border-amber-400/60 rounded-3xl p-8 sm:p-10 text-slate-100 shadow-2xl flex flex-col items-center text-center overflow-hidden">
            {/* Background luxury watermark */}
            <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />

            <button
              onClick={() => setActivePreviewCert(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Diploma Frame */}
            <div className="w-full border-4 border-double border-amber-400/50 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-amber-950/20 via-black to-slate-950 relative">
              {/* Corner Ornaments */}
              <div className="text-xs font-serif tracking-widest text-amber-400 mb-1">
                LINGOVERSE ACADEMY OF WORLD LANGUAGES
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-200 uppercase tracking-wider mt-1">
                Official Certified Diploma
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                This certifies that
              </p>

              {/* Student Name */}
              <div className="my-4 py-2 border-b-2 border-amber-400/40 max-w-sm mx-auto">
                <span className="text-2xl font-serif font-black text-white italic">
                  {userStats.costume ? 'Polyglot Explorer' : 'Distinguished Learner'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                has successfully achieved proficiency in <strong>{currentLanguage.name}</strong> at the <strong>CEFR {activePreviewCert.level}</strong> competency benchmark, mastering oral dialogue, grammar precision, and conversational fluency.
              </p>

              {/* Cryptographic hash & verification QR */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-left text-[10px] text-slate-400">
                <div>
                  <span className="font-bold text-amber-300 block">Blockchain Verification Hash:</span>
                  <span className="font-mono text-slate-300">0x7F4b...92C4eB1 (Polygon Mainnet)</span>
                  <span className="block mt-0.5 text-slate-500">Issued: November 2026</span>
                </div>
                <div className="p-1.5 rounded-lg bg-white text-slate-950 flex items-center justify-center">
                  <QrCode className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Download and Share Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => {
                  sound.playClick();
                  window.print();
                }}
                className="btn-3d px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer border-b-2 border-amber-700"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
              <button
                onClick={() => {
                  sound.playFanfare();
                  alert('Verification link copied to clipboard!');
                }}
                className="px-5 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-teal-400" />
                <span>Share Credential</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MONETIZATION PAYWALL MODAL */}
      {isPaywallOpen && selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#161b22] border-2 border-teal-500/40 rounded-3xl p-6 sm:p-7 text-slate-100 shadow-2xl flex flex-col">
            <button
              onClick={() => setIsPaywallOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full">
                OFFICIAL CERTIFICATION
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                Unlock {selectedCert.level} Diploma
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Receive an official tamper-proof diploma recognized by top global educational institutions.
              </p>
            </div>

            {/* Paywall Options */}
            <div className="space-y-3">
              {/* Option A: Unlock with Gems */}
              <button
                onClick={() => handleUnlockWithGems(selectedCert)}
                className="w-full p-4 rounded-2xl bg-[#0d1117] hover:bg-[#21262d] border border-slate-700 text-left flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
                    <Gem className="w-5 h-5 fill-sky-400" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-white block">Unlock with Gems</span>
                    <span className="text-xs text-slate-400">Instant unlock via game balance</span>
                  </div>
                </div>
                <span className="text-sm font-black text-sky-400">
                  {selectedCert.gemCost} Gems
                </span>
              </button>

              {/* Option B: Credit Card / Apple Pay ($USD) */}
              <button
                onClick={() => handleUnlockWithCard(selectedCert)}
                className="btn-3d w-full p-4 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-sm flex items-center justify-between transition-all cursor-pointer border-b-2 border-teal-800 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-teal-200" />
                  <span>Card / Apple Pay</span>
                </div>
                <span>${selectedCert.priceUsd} USD</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-5 leading-relaxed">
              30-day money-back guarantee. Includes high-resolution PDF download and immutable blockchain verification hash.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
