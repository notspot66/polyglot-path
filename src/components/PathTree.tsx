import React, { useState } from 'react';
import { Unit, PathNode, Language } from '../types';
import { sound } from '../utils/audio';
import { Star, BookOpen, Gift, Trophy, Check, Lock, Sparkles, BookMarked } from 'lucide-react';

interface PathTreeProps {
  units: Unit[];
  currentLanguage: Language;
  onSelectNode: (node: PathNode, unit: Unit) => void;
  onClaimChest: (node: PathNode) => void;
  activeNodeId?: string;
}

export const PathTree: React.FC<PathTreeProps> = ({
  units,
  currentLanguage,
  onSelectNode,
  onClaimChest,
  activeNodeId,
}) => {
  const [activeGuidebook, setActiveGuidebook] = useState<Unit | null>(null);

  // Compute horizontal winding curve offset (px) for each node index
  const getOffsetStyle = (index: number) => {
    const cycle = index % 8;
    // Creates a smooth S-curve wave: 0 -> +48 -> +85 -> +48 -> 0 -> -48 -> -85 -> -48
    const offsets = [0, 48, 85, 48, 0, -48, -85, -48];
    const x = offsets[cycle] || 0;
    return { transform: `translateX(${x}px)` };
  };

  // Compute the single active milestone node across the entire path
  let firstUncompletedNodeId: string | null = null;
  for (const u of units) {
    for (const n of u.nodes) {
      if (!n.isCompleted && !n.isLocked) {
        firstUncompletedNodeId = n.id;
        break;
      }
    }
    if (firstUncompletedNodeId) break;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto py-6 px-4 pb-28">
      {/* Units Loop */}
      {units.map((unit) => (
        <section key={unit.id} className="w-full flex flex-col items-center mb-16">
          {/* Unit Header Card */}
          <div
            className={`w-full rounded-3xl p-5 sm:p-6 text-white shadow-xl mb-10 flex items-center justify-between transition-all border border-white/10 ${unit.color}`}
          >
            <div className="flex flex-col gap-1 pr-4">
              <span className="text-xs font-black uppercase tracking-wider text-white/80">
                Unit {unit.unitNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight">{unit.title}</h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium mt-0.5 max-w-md">
                {unit.topic}
              </p>
            </div>

            {/* Guidebook Button */}
            <button
              onClick={() => {
                sound.playClick();
                setActiveGuidebook(unit);
              }}
              className="btn-3d flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs uppercase tracking-wider border border-white/30 backdrop-blur-xs shrink-0 cursor-pointer"
            >
              <BookMarked className="w-4 h-4" />
              <span className="hidden sm:inline">Guidebook</span>
            </button>
          </div>

          {/* Stepping Stones Path */}
          <div className="flex flex-col items-center gap-7 relative w-full py-4">
            {unit.nodes.map((node, nIdx) => {
              const isLocked = node.isLocked;
              const isCompleted = node.isCompleted;
              const isCurrent = activeNodeId ? activeNodeId === node.id : firstUncompletedNodeId === node.id;

              // Stone Node Rendering
              return (
                <div
                  key={node.id}
                  style={getOffsetStyle(nIdx)}
                  className="relative flex flex-col items-center transition-transform duration-200"
                >
                  {/* Floating "START" Speech Bubble for the single active node */}
                  {isCurrent && !isCompleted && !isLocked && (
                    <div className="absolute -top-11 z-20 flex flex-col items-center animate-bounce pointer-events-none">
                      <div className="px-3.5 py-1 rounded-xl bg-slate-900 text-emerald-400 font-black text-xs uppercase tracking-wider shadow-xl border-2 border-emerald-500 whitespace-nowrap">
                        Start!
                      </div>
                      <div className="w-2.5 h-2.5 bg-slate-900 border-r-2 border-b-2 border-emerald-500 rotate-45 -mt-1.5" />
                    </div>
                  )}

                  {/* Node Button */}
                  <button
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      if (node.kind === 'chest') {
                        onClaimChest(node);
                      } else {
                        sound.playClick();
                        onSelectNode(node, unit);
                      }
                    }}
                    className={`btn-3d group relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                      isLocked
                        ? 'bg-[#161b22] border-b-4 border-slate-800 text-slate-600 cursor-not-allowed opacity-75'
                        : node.kind === 'chest'
                        ? 'bg-amber-400 hover:bg-amber-300 border-b-6 border-amber-600 text-amber-950 animate-pulse'
                        : node.kind === 'story'
                        ? 'bg-purple-600 hover:bg-purple-500 border-b-6 border-purple-800 text-white'
                        : node.kind === 'review'
                        ? 'bg-sky-600 hover:bg-sky-500 border-b-6 border-sky-800 text-white'
                        : isCompleted
                        ? 'bg-amber-400 hover:bg-amber-300 border-b-6 border-amber-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 border-b-6 border-emerald-700 text-white ring-4 ring-emerald-500/20'
                    }`}
                  >
                    {/* Ring for completed or active progress */}
                    {!isLocked && (
                      <div className="absolute -inset-1 rounded-full border-2 border-dashed border-emerald-400/40 pointer-events-none" />
                    )}

                    {/* Node Icon */}
                    {isLocked ? (
                      <Lock className="w-8 h-8 text-slate-600" />
                    ) : node.kind === 'chest' ? (
                      <Gift className="w-9 h-9 fill-amber-100 text-amber-900 animate-spin-slow" />
                    ) : node.kind === 'story' ? (
                      <BookOpen className="w-9 h-9 text-white" />
                    ) : node.kind === 'review' ? (
                      <Trophy className="w-9 h-9 text-white" />
                    ) : isCompleted ? (
                      <Check className="w-10 h-10 stroke-[3.5] text-amber-900" />
                    ) : (
                      <Star className="w-9 h-9 fill-white text-white" />
                    )}

                    {/* Crown counter on top-right of completed standard node */}
                    {isCompleted && node.crownsEarned > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-amber-400 border-2 border-[#0b0e14] rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black text-amber-950 shadow-xs">
                        👑
                      </div>
                    )}
                  </button>

                  {/* Node Title & Subtitle Below */}
                  <div className="mt-2.5 text-center max-w-[150px]">
                    <span className="block text-xs font-extrabold text-slate-100 leading-snug">
                      {node.title}
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                      {node.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unit Milestone Trophy */}
          <div className="mt-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-3xl bg-[#161b22] border-4 border-amber-500/40 flex items-center justify-center shadow-xl p-3">
              <Trophy className="w-14 h-14 text-amber-500" />
            </div>
            <span className="text-xs font-extrabold text-slate-300 mt-2.5">
              Unit {unit.unitNumber} Mastery Trophy
            </span>
          </div>
        </section>
      ))}

      {/* Guidebook Modal */}
      {activeGuidebook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0d1117] text-slate-100 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black">
                  📖
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Unit {activeGuidebook.unitNumber} Guidebook
                  </span>
                  <h3 className="text-lg font-black text-white leading-tight">
                    {activeGuidebook.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="my-5 text-sm text-slate-300 space-y-3 leading-relaxed">
              <div className="p-4 bg-[#161b22] border border-emerald-500/30 rounded-2xl">
                <span className="font-extrabold text-emerald-400 block mb-1">
                  💡 Key Learning Tip:
                </span>
                <p>{activeGuidebook.guidebook}</p>
              </div>

              <div className="p-4 bg-[#161b22] border border-slate-800 rounded-2xl">
                <span className="font-extrabold text-slate-200 block mb-1">
                  🌐 Language Family Context:
                </span>
                <p>
                  {currentLanguage.name} is part of the <strong className="text-white">{currentLanguage.family}</strong> family, spoken by over {currentLanguage.speakers} worldwide.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveGuidebook(null)}
              className="btn-3d w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-emerald-700 cursor-pointer"
            >
              Got it, let's learn!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
