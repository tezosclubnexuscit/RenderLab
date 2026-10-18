import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Trash2,
  Palette,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { ChallengeListItem, Difficulty } from '../types';
import { useTheme } from '../context/ThemeContext';
import { marioSound } from '../services/soundService';

export type ChallengeCategory = 'all' | 'html' | 'css' | 'javascript';

export function extractChallengeNumber(title: string): number | null {
  const m = title.match(/^#(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'World 1 (Easy)',
  medium: 'World 2 (Med)',
  hard: 'Bowser (Hard)',
};

export function getChallengeCategory(c: { topics: string[]; title?: string }): 'html' | 'css' | 'javascript' {
  const topics = (c.topics || []).map((t) => t.toLowerCase());
  if (
    topics.includes('html') ||
    topics.includes('semantic-html') ||
    topics.includes('forms') ||
    topics.includes('markup') ||
    topics.includes('figure') ||
    topics.includes('accessibility')
  ) {
    return 'html';
  }
  if (
    topics.includes('javascript') ||
    topics.includes('js') ||
    topics.includes('events') ||
    topics.includes('timer') ||
    topics.includes('setinterval') ||
    topics.includes('state')
  ) {
    return 'javascript';
  }
  if (
    topics.includes('css') ||
    topics.includes('flexbox') ||
    topics.includes('grid') ||
    topics.includes('transitions') ||
    topics.includes('hover') ||
    topics.includes('animation')
  ) {
    return 'css';
  }
  const title = (c.title || '').toLowerCase();
  if (title.includes('html') || title.includes('form') || title.includes('semantic')) return 'html';
  if (title.includes('css') || title.includes('flexbox') || title.includes('grid') || title.includes('button')) return 'css';
  return 'javascript';
}

interface ChallengeBrowserProps {
  challenges: ChallengeListItem[];
  onSelectChallenge: (id: string) => void;
  onOpenGenerator: () => void;
  onDeleteChallenge?: (id: string) => void;
}

export const ChallengeBrowser: React.FC<ChallengeBrowserProps> = ({
  challenges,
  onSelectChallenge,
  onOpenGenerator,
  onDeleteChallenge,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>('all');
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: challenges.length, html: 0, css: 0, javascript: 0 };
    challenges.forEach((c) => {
      const cat = getChallengeCategory(c);
      counts[cat]++;
    });
    return counts;
  }, [challenges]);

  // Extract unique topics
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    challenges.forEach((c) => c.topics.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [challenges]);

  // Filtered challenges
  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      if (selectedCategory !== 'all' && getChallengeCategory(c) !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;
      if (selectedMode !== 'all' && c.mode !== selectedMode) return false;
      if (selectedTopic !== 'all' && !c.topics.includes(selectedTopic)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchDesc = c.description.toLowerCase().includes(q);
        const matchTopic = c.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTopic) return false;
      }
      return true;
    });
  }, [challenges, selectedCategory, selectedDifficulty, selectedMode, selectedTopic, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const numA = extractChallengeNumber(a.title);
      const numB = extractChallengeNumber(b.title);
      if (numA !== null && numB !== null) return numA - numB;
      if (numA !== null) return -1;
      if (numB !== null) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [filtered]);

  const handleCategorySwitch = (cat: ChallengeCategory) => {
    marioSound.playPipe();
    setSelectedCategory(cat);
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'easy':
        return {
          icon: '🍄',
          text: 'WORLD 1',
          cls: 'bg-[#00a800] text-white border-black',
        };
      case 'medium':
        return {
          icon: '🔥',
          text: 'WORLD 2',
          cls: 'bg-[#fc9838] text-black border-black',
        };
      case 'hard':
        return {
          icon: '👑',
          text: 'BOWSER',
          cls: 'bg-[#e52521] text-white border-black',
        };
    }
  };

  // Top banner theme classes
  const bannerClass = isLight
    ? 'bg-white border-4 border-black p-5 md:p-6 shadow-[6px_6px_0px_#000] text-slate-900'
    : isUnderground
    ? 'bg-[#050710] border-4 border-[#2038ec] p-5 md:p-6 shadow-[6px_6px_0px_#2038ec] text-white'
    : isCastle
    ? 'bg-[#080202] border-4 border-[#d82800] p-5 md:p-6 shadow-[6px_6px_0px_#d82800] text-amber-100'
    : 'bg-[#000000] border-4 border-white p-5 md:p-6 shadow-[6px_6px_0px_#000] text-white';

  // Filter bar theme classes
  const filterBarClass = isLight
    ? 'bg-white border-4 border-black p-3.5 shadow-[4px_4px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] p-3.5 shadow-[4px_4px_0px_#050710]'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] p-3.5 shadow-[4px_4px_0px_#080202]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 p-3.5 shadow-[4px_4px_0px_#000]'
    : 'bg-white border-4 border-black p-3.5 shadow-[4px_4px_0px_#000]';

  // Input & Select elements style
  const inputControlClass = isLight
    ? 'bg-slate-100 border-2 border-black text-black'
    : isUnderground
    ? 'bg-[#0b0f20] border-2 border-[#2038ec] text-slate-100'
    : isCastle
    ? 'bg-[#120404] border-2 border-[#d82800] text-amber-200'
    : isDark
    ? 'bg-[#0b0f17] border-2 border-slate-700 text-white'
    : 'bg-slate-100 border-2 border-black text-black';

  // Inactive Category button class
  const inactiveCategoryClass = isLight
    ? 'bg-white text-slate-800 border-black hover:bg-slate-100'
    : isUnderground
    ? 'bg-[#050710] text-slate-300 border-[#2038ec] hover:text-white hover:bg-[#12182b]'
    : isCastle
    ? 'bg-[#080202] text-amber-200 border-[#d82800] hover:text-amber-100 hover:bg-[#1c0a0a]'
    : 'bg-black text-slate-300 border-black hover:text-white';

  // Card theme classes
  const cardClass = isLight
    ? 'bg-white border-4 border-black p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] p-4 shadow-[5px_5px_0px_#050710] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#2038ec] hover:border-[#5c94fc]'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] p-4 shadow-[5px_5px_0px_#080202] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#d82800] hover:border-[#fc9838]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] hover:border-slate-500'
    : 'bg-white border-4 border-black p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000]';

  const cardDividerClass = isUnderground
    ? 'border-[#2038ec]/50'
    : isCastle
    ? 'border-[#d82800]/50'
    : isDark
    ? 'border-slate-700'
    : 'border-black';

  const cardTitleClass = isLight
    ? 'text-slate-900 group-hover:text-[#e52521]'
    : isUnderground
    ? 'text-slate-100 group-hover:text-[#5c94fc]'
    : isCastle
    ? 'text-amber-100 group-hover:text-[#fcd800]'
    : isDark
    ? 'text-slate-100 group-hover:text-[#fcd800]'
    : 'text-slate-900 group-hover:text-[#e52521]';

  const cardDescClass = isLight
    ? 'text-slate-600'
    : isUnderground
    ? 'text-slate-400'
    : isCastle
    ? 'text-amber-200/70'
    : isDark
    ? 'text-slate-400'
    : 'text-slate-600';

  const cardTagClass = isLight
    ? 'bg-slate-100 border-slate-300 text-slate-700'
    : isUnderground
    ? 'bg-[#050710] border-[#2038ec]/50 text-slate-300'
    : isCastle
    ? 'bg-[#080202] border-[#d82800]/50 text-amber-300'
    : isDark
    ? 'bg-slate-900 border-slate-700 text-slate-300'
    : 'bg-slate-100 border-slate-300 text-slate-700';

  const cardFooterTextClass = isLight
    ? 'text-slate-600'
    : isUnderground
    ? 'text-slate-400'
    : isCastle
    ? 'text-amber-300/70'
    : isDark
    ? 'text-slate-400'
    : 'text-slate-600';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Top Mario Warp Zone Banner */}
      <div className={`${bannerClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[#fcd800] text-xs font-arcade">
            <span>⭐</span>
            <span className={isLight ? 'text-amber-700 font-bold' : 'text-[#fcd800]'}>WARP ZONE: STAGE SELECTOR</span>
          </div>
          <h1
            className={`font-arcade text-lg sm:text-2xl drop-shadow-[2px_2px_0px_#b84418] ${
              isLight ? 'text-[#b84418]' : 'text-[#fcd800]'
            }`}
          >
            CHOOSE YOUR WORLD &amp; LEVEL
          </h1>
          <p className={`font-pixel text-xs max-w-xl ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
            Choose a stage below to begin your coding run. Test your HTML, CSS, and JS prowess and earn bonus coins!
          </p>
        </div>

        <button
          onClick={() => {
            marioSound.playBlockBump();
            onOpenGenerator();
          }}
          className="mario-btn mario-btn-yellow px-4 py-2 text-xs font-arcade flex items-center space-x-2 text-black self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>GENERATE CUSTOM LEVEL [?]</span>
        </button>
      </div>

      {/* World Category Selector Tabs */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 ${cardDividerClass} pb-3`}>
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {/* All */}
          <button
            onClick={() => handleCategorySwitch('all')}
            className={`mario-btn px-3 py-1.5 text-[10px] font-arcade shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === 'all'
                ? 'mario-btn-red text-white'
                : inactiveCategoryClass
            }`}
          >
            <span>ALL WORLDS</span>
            <span className="px-1.5 bg-black/40 text-white text-[9px] border border-white">
              {categoryCounts.all}
            </span>
          </button>

          {/* HTML Category */}
          <button
            onClick={() => handleCategorySwitch('html')}
            className={`mario-btn px-3 py-1.5 text-[10px] font-arcade shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === 'html'
                ? 'mario-btn-yellow text-black'
                : inactiveCategoryClass
            }`}
          >
            <span>🍄 HTML</span>
            <span className="px-1.5 bg-black/40 text-white text-[9px] border border-white">
              {categoryCounts.html}
            </span>
          </button>

          {/* CSS Category */}
          <button
            onClick={() => handleCategorySwitch('css')}
            className={`mario-btn px-3 py-1.5 text-[10px] font-arcade shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === 'css'
                ? 'mario-btn-blue text-white'
                : inactiveCategoryClass
            }`}
          >
            <span>🎨 CSS</span>
            <span className="px-1.5 bg-black/40 text-white text-[9px] border border-white">
              {categoryCounts.css}
            </span>
          </button>

          {/* JavaScript Category */}
          <button
            onClick={() => handleCategorySwitch('javascript')}
            className={`mario-btn px-3 py-1.5 text-[10px] font-arcade shrink-0 flex items-center space-x-1.5 ${
              selectedCategory === 'javascript'
                ? 'mario-btn-green text-white'
                : inactiveCategoryClass
            }`}
          >
            <span>⚡ JAVASCRIPT</span>
            <span className="px-1.5 bg-black/40 text-white text-[9px] border border-white">
              {categoryCounts.javascript}
            </span>
          </button>
        </div>

        <div className="font-arcade text-[10px] text-black bg-[#fcd800] px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_#000]">
          STAGES FOUND: {filtered.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`${filterBarClass} flex flex-col md:flex-row gap-3 items-center justify-between`}>
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search level name or topic..."
            className={`w-full pl-9 pr-3 py-1.5 text-xs font-pixel font-bold focus:outline-none ${inputControlClass}`}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={`text-[10px] font-arcade px-2 py-1.5 focus:outline-none ${inputControlClass}`}
          >
            <option value="all">ALL LEVELS</option>
            <option value="easy">WORLD 1 (EASY)</option>
            <option value="medium">WORLD 2 (MED)</option>
            <option value="hard">BOWSER (HARD)</option>
          </select>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className={`text-[10px] font-arcade px-2 py-1.5 focus:outline-none ${inputControlClass}`}
          >
            <option value="all">ALL MODES</option>
            <option value="fill_blanks">Fill in Blanks</option>
            <option value="fix_broken">Fix Bugs</option>
            <option value="build_component">Build Component</option>
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className={`text-[10px] font-arcade px-2 py-1.5 focus:outline-none ${inputControlClass}`}
          >
            <option value="all">ALL TOPICS</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {/* View Mode Switcher */}
          <div
            className={`flex items-center space-x-1 border-2 p-0.5 ${
              isLight
                ? 'bg-slate-200 border-black'
                : isUnderground
                ? 'bg-[#050710] border-[#2038ec]'
                : isCastle
                ? 'bg-[#080202] border-[#d82800]'
                : 'bg-slate-900 border-slate-700'
            }`}
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 border transition-all ${
                viewMode === 'grid'
                  ? 'bg-black text-white border-black'
                  : isLight
                  ? 'text-slate-700 hover:text-black border-transparent'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
              title="Cards Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 border transition-all ${
                viewMode === 'list'
                  ? 'bg-black text-white border-black'
                  : isLight
                  ? 'text-slate-700 hover:text-black border-transparent'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
              title="List View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= CHALLENGES: CARD GRID VIEW ================= */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((c) => {
            const seqNum = extractChallengeNumber(c.title);
            const badge = getDifficultyBadge(c.difficulty);
            const category = getChallengeCategory(c);

            return (
              <div
                key={c.id}
                onClick={() => {
                  marioSound.playJump();
                  onSelectChallenge(c.id);
                }}
                className={`${cardClass} transition-all cursor-pointer flex flex-col justify-between group`}
              >
                <div>
                  {/* Top Badges */}
                  <div className={`flex items-center justify-between mb-3 border-b-2 ${cardDividerClass} pb-2`}>
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className="font-arcade text-[9px] bg-black text-[#fcd800] px-1.5 py-0.5 border border-black">
                        #{seqNum ?? '-'}
                      </span>
                      <span className="font-arcade text-[9px] bg-[#0050d0] text-white px-1.5 py-0.5 border border-black uppercase">
                        {category}
                      </span>
                      <span className={`font-arcade text-[9px] px-1.5 py-0.5 border ${badge.cls}`}>
                        {badge.icon} {badge.text}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {c.is_solved && (
                        <span className="text-xs font-arcade text-[#00a800]" title="Cleared!">
                          ⭐
                        </span>
                      )}
                      {onDeleteChallenge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            marioSound.playBlockBump();
                            if (window.confirm(`Delete level "${c.title}"?`)) {
                              onDeleteChallenge(c.id);
                            }
                          }}
                          className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-arcade text-xs leading-snug mb-2 transition-colors ${cardTitleClass}`}>
                    {c.title}
                  </h3>
                  <p className={`font-pixel text-xs line-clamp-3 leading-relaxed mb-3 ${cardDescClass}`}>
                    {c.description}
                  </p>

                  {/* Topics */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {c.topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className={`font-arcade text-[8px] px-1.5 py-0.5 border ${cardTagClass}`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className={`pt-2 border-t-2 ${cardDividerClass} flex items-center justify-between text-xs`}>
                  <span className={`font-arcade text-[9px] ${cardFooterTextClass}`}>
                    ⏱ {c.estimated_minutes}M • {c.tests_count} CHECKS
                  </span>
                  <button className="mario-btn mario-btn-yellow px-2 py-0.5 text-[9px] font-arcade flex items-center space-x-1 text-black">
                    <span>{c.is_solved ? 'REPLAY' : 'START'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= CHALLENGES: LIST VIEW ================= */
        <div
          className={`border-4 divide-y-2 shadow-[5px_5px_0px_#000] ${
            isLight
              ? 'bg-white border-black divide-black text-slate-900'
              : isUnderground
              ? 'bg-[#12182b] border-[#2038ec] divide-[#2038ec]/50 text-slate-100'
              : isCastle
              ? 'bg-[#1c0a0a] border-[#d82800] divide-[#d82800]/50 text-amber-100'
              : isDark
              ? 'bg-[#111726] border-slate-700 divide-slate-800 text-slate-100'
              : 'bg-white border-black divide-black text-slate-900'
          }`}
        >
          {sorted.map((c) => {
            const seqNum = extractChallengeNumber(c.title);
            const badge = getDifficultyBadge(c.difficulty);
            const category = getChallengeCategory(c);

            return (
              <div
                key={c.id}
                onClick={() => {
                  marioSound.playJump();
                  onSelectChallenge(c.id);
                }}
                className={`p-3 flex items-center justify-between cursor-pointer transition-colors group ${
                  isLight || !isDark
                    ? 'hover:bg-yellow-50'
                    : isUnderground
                    ? 'hover:bg-[#1a2340]'
                    : isCastle
                    ? 'hover:bg-[#280f0f]'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                  <span className="font-arcade text-[10px] bg-black text-[#fcd800] px-1.5 py-0.5 border border-black shrink-0">
                    #{seqNum ?? '-'}
                  </span>
                  <div className="truncate">
                    <div className={`font-arcade text-xs transition-colors truncate ${cardTitleClass}`}>
                      {c.title}
                    </div>
                    <div className={`font-pixel text-xs truncate ${cardDescClass}`}>
                      {c.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-arcade text-[9px] bg-[#0050d0] text-white px-1.5 py-0.5 border border-black">
                    {category.toUpperCase()}
                  </span>
                  <span className={`font-arcade text-[9px] px-1.5 py-0.5 border ${badge.cls}`}>
                    {badge.text}
                  </span>
                  <button className="mario-btn mario-btn-yellow px-2.5 py-1 text-[9px] font-arcade text-black">
                    {c.is_solved ? 'RETRY' : 'PLAY'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div
          className={`text-center py-12 border-4 p-6 shadow-[4px_4px_0px_#000] ${
            isLight
              ? 'bg-white border-black text-slate-800'
              : isUnderground
              ? 'bg-[#12182b] border-[#2038ec] text-slate-200'
              : isCastle
              ? 'bg-[#1c0a0a] border-[#d82800] text-amber-200'
              : isDark
              ? 'bg-[#111726] border-slate-700 text-slate-200'
              : 'bg-white border-black text-slate-800'
          }`}
        >
          <p className="font-arcade text-xs mb-3">NO STAGES MATCH YOUR ACTIVE FILTERS!</p>
          <button
            onClick={() => {
              marioSound.playBlockBump();
              onOpenGenerator();
            }}
            className="mario-btn mario-btn-yellow px-4 py-2 text-xs font-arcade text-black"
          >
            GENERATE ONE WITH AI [?]
          </button>
        </div>
      )}
    </div>
  );
};
