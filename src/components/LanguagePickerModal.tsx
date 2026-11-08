import React, { useState, useMemo } from 'react';
import { Language, RegionCategory, LanguageDifficulty } from '../types';
import { ALL_LANGUAGES } from '../data/languages';
import { sound } from '../utils/audio';
import { X, Search, Volume2, Check, Sparkles, Filter } from 'lucide-react';

interface LanguagePickerModalProps {
  currentLanguageId: string;
  onSelectLanguage: (language: Language) => void;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  currentLanguageId,
  onSelectLanguage,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories: (RegionCategory | 'All')[] = [
    'All',
    'Popular',
    'Europe',
    'Asia-Pacific',
    'Africa',
    'Americas',
    'Middle East',
    'Ancient & Classical',
    'Constructed',
  ];

  const filteredLanguages = useMemo(() => {
    return ALL_LANGUAGES.filter((lang) => {
      // Region match
      if (selectedRegion !== 'All') {
        if (selectedRegion === 'Popular') {
          if (lang.region !== 'Popular') return false;
        } else if (lang.region !== selectedRegion) {
          return false;
        }
      }

      // Difficulty match
      if (selectedDifficulty !== 'All' && lang.difficulty !== selectedDifficulty) {
        return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = lang.name.toLowerCase().includes(q);
        const matchesNative = lang.nativeName.toLowerCase().includes(q);
        const matchesFamily = lang.family.toLowerCase().includes(q);
        const matchesScript = lang.script.toLowerCase().includes(q);
        return matchesName || matchesNative || matchesFamily || matchesScript;
      }

      return true;
    });
  }, [searchQuery, selectedRegion, selectedDifficulty]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl h-[90vh] bg-[#0d1117] text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header with World Illustration */}
        <div className="relative p-6 sm:p-7 border-b border-slate-800 shrink-0 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-[#0d1117]">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#161b22] cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>The Global Odyssey · {ALL_LANGUAGES.length}+ Languages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Choose a Language to Learn
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Explore major world languages, indigenous voices, ancient classical scriptures, and creative tongues.
              </p>
            </div>
          </div>

          {/* Search bar & filters */}
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages by name, script (e.g. Japanese, Quechua, Cyrillic)..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#161b22] border border-slate-700/60 text-sm font-semibold text-slate-100 placeholder:text-slate-500 focus:outline-emerald-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Difficulty selector */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-[#161b22] border border-slate-700/60 text-xs font-bold text-slate-200 shadow-xs cursor-pointer focus:outline-emerald-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner Friendly">Beginner Friendly</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedRegion === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSelectedRegion(cat);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-[#161b22] text-slate-300 hover:bg-[#21262d] hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0b0e14]">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {filteredLanguages.length} Languages Available
            </span>
          </div>

          {filteredLanguages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-4xl mb-2">🔍</span>
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-200">
                No languages match "{searchQuery}"
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for another country, alphabet, or reset your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredLanguages.map((lang) => {
                const isCurrent = lang.id === currentLanguageId;
                return (
                  <div
                    key={lang.id}
                    className={`btn-3d p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-[#161b22] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* Top Row: Flag & Difficulty Tag */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-3xl leading-none">{lang.flag}</span>
                          <div>
                            <h4 className="text-base font-black text-white leading-tight">
                              {lang.name}
                            </h4>
                            <span className="text-xs font-bold text-emerald-400">
                              {lang.nativeName}
                            </span>
                          </div>
                        </div>

                        {/* Pronunciation speech button */}
                        <button
                          onClick={() => {
                            sound.speak(lang.greeting, lang.code || 'en-US');
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[#21262d] transition-colors cursor-pointer"
                          title={`Listen to greeting: "${lang.greeting}"`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Linguistic details */}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {lang.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 font-semibold mb-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#21262d] text-slate-300">
                          {lang.family.split(' ')[0]}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#21262d] text-slate-300">
                          {lang.speakers}
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectLanguage(lang);
                        onClose();
                      }}
                      className={`btn-3d w-full py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs border-b-2 border-emerald-800'
                          : 'bg-[#21262d] text-slate-200 hover:bg-emerald-600 hover:text-white border-b-2 border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" /> Current Course
                        </>
                      ) : (
                        'Start Course'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
