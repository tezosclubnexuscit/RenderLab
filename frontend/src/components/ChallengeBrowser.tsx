import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Code2,
  Wrench,
  Layers,
  SlidersHorizontal,
  Trash2,
  FileCode2,
  Palette,
  FileText,
  LayoutList,
  LayoutGrid,
} from 'lucide-react';
import { ChallengeListItem, Difficulty, ChallengeMode } from '../types';
import { useTheme } from '../context/ThemeContext';

export type ChallengeCategory = 'all' | 'html' | 'css' | 'javascript';

export function extractChallengeNumber(title: string): number | null {
  const m = title.match(/^#(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Beginner',
  medium: 'Intermediate',
  hard: 'Advanced',
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
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
  }, [challenges, selectedCategory, search, selectedDifficulty, selectedMode, selectedTopic]);

  // Sorted challenges strictly by sequence number (#1 to #311)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const numA = extractChallengeNumber(a.title) ?? 99999;
      const numB = extractChallengeNumber(b.title) ?? 99999;
      return numA - numB;
    });
  }, [filtered]);

  const difficultyColors: Record<Difficulty, { badge: string; border: string }> = {
    easy: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', border: 'hover:border-emerald-500/50' },
    medium: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30', border: 'hover:border-amber-500/50' },
    hard: { badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30', border: 'hover:border-rose-500/50' },
  };

  const modeLabels: Record<ChallengeMode, { label: string; icon: any }> = {
    fill_blanks: { label: 'Fill in Blanks', icon: Code2 },
    fix_broken: { label: 'Fix Bugs', icon: Wrench },
    build_component: { label: 'Build Component', icon: Layers },
    recreate_page: { label: 'Recreate Page', icon: Layers },
  };

  const { theme } = useTheme();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors ${
          theme === 'light'
            ? 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200 shadow-slate-200/60'
            : 'bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-slate-800'
        }`}
      >
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-emerald-500 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frontend Practice Library</span>
          </div>
          <h1
            className={`text-2xl font-black tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Curated & AI-Generated Challenges
          </h1>
          <p
            className={`text-sm max-w-2xl ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Complete real-world frontend tasks, verify styling and DOM mechanics with automated tests,
            and sharpen your skills with instant feedback.
          </p>
        </div>
        <button
          onClick={onOpenGenerator}
          className="self-start md:self-center flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 !text-white shadow-lg shadow-indigo-600/30 transition-all z-10"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="!text-white">Generate Custom Challenge</span>
        </button>
      </div>

      {/* 3 Core Categories Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {/* All */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
              selectedCategory === 'all'
                ? theme === 'light'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Categories</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300">
              {categoryCounts.all}
            </span>
          </button>

          {/* HTML Category */}
          <button
            onClick={() => setSelectedCategory('html')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              selectedCategory === 'html'
                ? 'bg-orange-500/15 text-orange-500 border-orange-500/40 shadow-md shadow-orange-500/10'
                : theme === 'light'
                ? 'text-slate-600 hover:text-orange-500 hover:bg-orange-50 border-transparent'
                : 'text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 border-transparent'
            }`}
          >
            <span className="font-mono text-xs font-black text-orange-500">&lt;/&gt;</span>
            <span>HTML</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
              {categoryCounts.html}
            </span>
          </button>

          {/* CSS Category */}
          <button
            onClick={() => setSelectedCategory('css')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              selectedCategory === 'css'
                ? 'bg-sky-500/15 text-sky-500 border-sky-500/40 shadow-md shadow-sky-500/10'
                : theme === 'light'
                ? 'text-slate-600 hover:text-sky-500 hover:bg-sky-50 border-transparent'
                : 'text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 border-transparent'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-sky-500" />
            <span>CSS</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400">
              {categoryCounts.css}
            </span>
          </button>

          {/* JavaScript Category */}
          <button
            onClick={() => setSelectedCategory('javascript')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 border ${
              selectedCategory === 'javascript'
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/40 shadow-md shadow-amber-500/10'
                : theme === 'light'
                ? 'text-slate-600 hover:text-amber-500 hover:bg-amber-50 border-transparent'
                : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border-transparent'
            }`}
          >
            <span className="font-mono text-[10px] font-black px-1 rounded bg-amber-500/20 text-amber-500">JS</span>
            <span>JavaScript</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
              {categoryCounts.javascript}
            </span>
          </button>
        </div>

        {/* Current Active Category Summary Label */}
        <div className="text-xs text-slate-400 hidden md:block">
          Showing <span className="font-semibold text-emerald-400">{filtered.length}</span> {selectedCategory === 'all' ? 'total' : selectedCategory.toUpperCase()} challenges
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-center justify-between transition-colors ${
          theme === 'light'
            ? 'bg-white border-slate-200 shadow-sm'
            : 'bg-slate-900/60 border-slate-800'
        }`}
      >
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, topic, or title..."
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-emerald-500 border ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-slate-950 border-slate-750 text-white placeholder-slate-500'
            }`}
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 border ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-750 text-slate-300'
            }`}
          >
            <option value="all">All Levels</option>
            <option value="easy">Beginner</option>
            <option value="medium">Intermediate</option>
            <option value="hard">Advanced</option>
          </select>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 border ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-750 text-slate-300'
            }`}
          >
            <option value="all">All Modes</option>
            <option value="fill_blanks">Fill in Blanks</option>
            <option value="fix_broken">Fix Bugs</option>
            <option value="build_component">Build Component</option>
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 border ${
              theme === 'light'
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-750 text-slate-300'
            }`}
          >
            <option value="all">All Topics</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {/* View Mode Switcher: Line by Line vs Cards */}
          <div
            className={`flex items-center rounded-lg p-0.5 border ${
              theme === 'light'
                ? 'bg-slate-100 border-slate-300'
                : 'bg-slate-950 border-slate-750'
            }`}
          >
            <button
              onClick={() => setViewMode('list')}
              title="Line by Line (List View)"
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-500 !text-slate-950 shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>Line by Line</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 !text-slate-950 shadow-sm'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>

          {(selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedMode !== 'all' || selectedTopic !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedMode('all');
                setSelectedTopic('all');
                setSearch('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-500 px-2 py-1 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ================= CHALLENGES: LINE BY LINE LIST VIEW ================= */}
      {viewMode === 'list' ? (
        <div
          className={`rounded-xl border overflow-hidden shadow-sm transition-colors divide-y ${
            theme === 'light'
              ? 'bg-white border-slate-200 divide-slate-100 shadow-slate-200/50'
              : 'bg-slate-900/60 border-slate-800 divide-slate-800/60'
          }`}
        >
          {/* List Header */}
          <div
            className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
              theme === 'light'
                ? 'bg-slate-50 text-slate-600 border-b border-slate-200'
                : 'bg-slate-950/80 text-slate-400 border-b border-slate-800'
            }`}
          >
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <span className="w-16 shrink-0"># Problem</span>
              <span className="flex-1">Title & Topics</span>
            </div>
            <div className="flex items-center space-x-3 text-right shrink-0">
              <span className="w-20 text-center">Category</span>
              <span className="w-28 text-center">Level</span>
              <span className="w-28 text-center hidden md:inline-block">Practice Mode</span>
              <span className="w-16 text-center hidden sm:inline-block">Time</span>
              <span className="w-24 text-center">Action</span>
            </div>
          </div>

          {/* List Rows */}
          {sorted.map((c) => {
            const seqNum = extractChallengeNumber(c.title);
            const diffCfg = difficultyColors[c.difficulty] || difficultyColors.easy;
            const ModeIcon = modeLabels[c.mode]?.icon || Code2;
            const modeName = modeLabels[c.mode]?.label || c.mode;
            const category = getChallengeCategory(c);
            const levelLabel = difficultyLabels[c.difficulty] || c.difficulty;

            return (
              <div
                key={c.id}
                onClick={() => onSelectChallenge(c.id)}
                className={`px-4 py-3.5 flex items-center justify-between transition-colors cursor-pointer group ${
                  theme === 'light'
                    ? 'hover:bg-emerald-50/40'
                    : 'hover:bg-slate-850/80'
                }`}
              >
                {/* Left: Number + Title + Description + Topics */}
                <div className="flex items-center space-x-4 flex-1 min-w-0 pr-4">
                  <span
                    className={`w-16 shrink-0 font-mono font-black text-xs px-2 py-1 rounded text-center border ${
                      category === 'html'
                        ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                        : category === 'css'
                        ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    #{seqNum ?? '-'}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3
                        className={`text-sm font-semibold truncate group-hover:text-emerald-500 transition-colors ${
                          theme === 'light' ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {c.title}
                      </h3>
                      {c.is_solved && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p
                      className={`text-xs truncate mt-0.5 ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {c.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.topics.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`text-[9px] px-1.5 py-0.5 rounded border ${
                            theme === 'light'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-slate-950 text-slate-400 border-slate-800'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Action */}
                <div className="flex items-center space-x-3 shrink-0 text-right">
                  <span
                    className={`w-20 text-center text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                      category === 'html'
                        ? 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                        : category === 'css'
                        ? 'bg-sky-500/15 text-sky-500 border-sky-500/30'
                        : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    }`}
                  >
                    {category.toUpperCase()}
                  </span>

                  <span
                    className={`w-28 text-center text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${diffCfg.badge}`}
                  >
                    {levelLabel}
                  </span>

                  <span
                    className={`w-28 text-center text-[11px] font-medium px-2 py-0.5 rounded-full border hidden md:inline-flex items-center justify-center space-x-1 ${
                      theme === 'light'
                        ? 'bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <ModeIcon className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{modeName}</span>
                  </span>

                  <span
                    className={`w-16 text-center text-xs font-mono hidden sm:inline-block ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    ~{c.estimated_minutes}m
                  </span>

                  <div className="w-24 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectChallenge(c.id);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500 hover:!text-slate-950 border border-emerald-500/30 transition-all flex items-center justify-center space-x-1 mx-auto"
                    >
                      <span>{c.is_solved ? 'Again' : 'Solve'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= CHALLENGES: CARD GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((c) => {
            const seqNum = extractChallengeNumber(c.title);
            const diffCfg = difficultyColors[c.difficulty] || difficultyColors.easy;
            const ModeIcon = modeLabels[c.mode]?.icon || Code2;
            const modeName = modeLabels[c.mode]?.label || c.mode;
            const category = getChallengeCategory(c);
            const levelLabel = difficultyLabels[c.difficulty] || c.difficulty;

            return (
              <div
                key={c.id}
                onClick={() => onSelectChallenge(c.id)}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer group shadow-sm hover:shadow-xl ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850'
                } ${diffCfg.border}`}
              >
                <div>
                  {/* Badges row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      {/* Number badge */}
                      <span
                        className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                          category === 'html'
                            ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                            : category === 'css'
                            ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        #{seqNum ?? '-'}
                      </span>

                      {/* Category badge */}
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                          category === 'html'
                            ? 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                            : category === 'css'
                            ? 'bg-sky-500/15 text-sky-500 border-sky-500/30'
                            : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        <span>{category.toUpperCase()}</span>
                      </span>

                      {/* Level badge */}
                      <span
                        className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${diffCfg.badge}`}
                      >
                        {levelLabel}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center space-x-1.5 transition-colors ${
                          theme === 'light'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <ModeIcon
                          className={`w-3 h-3 ${
                            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                          }`}
                        />
                        <span>{modeName}</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {c.is_solved && (
                        <div className="flex items-center space-x-1 text-emerald-500 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Solved</span>
                        </div>
                      )}
                      {onDeleteChallenge && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to delete "${c.title}"?`)) {
                              onDeleteChallenge(c.id);
                            }
                          }}
                          title="Delete challenge"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-60 hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-base font-bold group-hover:text-emerald-500 transition-colors line-clamp-1 mb-1.5 ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}
                  >
                    {c.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {c.description}
                  </p>

                  {/* Topics pills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {c.topics.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className={`text-[10px] px-2 py-0.5 rounded-md border ${
                          theme === 'light'
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                    {c.topics.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-slate-500">
                        +{c.topics.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    theme === 'light'
                      ? 'border-slate-200 text-slate-500'
                      : 'border-slate-800/80 text-slate-400'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.estimated_minutes}m</span>
                    </span>
                    <span>{c.tests_count} checks</span>
                  </div>

                  <div className="flex items-center space-x-1 text-emerald-500 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{c.is_solved ? 'Practice Again' : 'Solve'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
          <p className="text-sm text-slate-400 mb-3">No challenges match your active filters.</p>
          <button
            onClick={onOpenGenerator}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Generate one with AI now
          </button>
        </div>
      )}
    </div>
  );
};
