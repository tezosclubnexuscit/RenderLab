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
} from 'lucide-react';
import { ChallengeListItem, Difficulty, ChallengeMode } from '../types';

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
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  // Extract unique topics
  const allTopics = useMemo(() => {
    const set = new Set<string>();
    challenges.forEach((c) => c.topics.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [challenges]);

  // Filtered challenges
  const filtered = useMemo(() => {
    return challenges.filter((c) => {
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
  }, [challenges, search, selectedDifficulty, selectedMode, selectedTopic]);

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

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Frontend Practice Library</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Curated & AI-Generated Challenges
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Complete real-world frontend tasks, verify styling and DOM mechanics with automated tests,
            and sharpen your skills with instant feedback.
          </p>
        </div>
        <button
          onClick={onOpenGenerator}
          className="self-start md:self-center flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all z-10"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Generate Custom Challenge</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by keyword, topic, or title..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-750 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-950 border border-slate-750 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Mode Filter */}
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="bg-slate-950 border border-slate-750 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
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
            className="bg-slate-950 border border-slate-750 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Topics</option>
            {allTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>

          {(selectedDifficulty !== 'all' || selectedMode !== 'all' || selectedTopic !== 'all' || search) && (
            <button
              onClick={() => {
                setSelectedDifficulty('all');
                setSelectedMode('all');
                setSelectedTopic('all');
                setSearch('');
              }}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const diffCfg = difficultyColors[c.difficulty] || difficultyColors.easy;
          const ModeIcon = modeLabels[c.mode]?.icon || Code2;
          const modeName = modeLabels[c.mode]?.label || c.mode;

          return (
            <div
              key={c.id}
              onClick={() => onSelectChallenge(c.id)}
              className={`p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between transition-all cursor-pointer group hover:bg-slate-850 hover:shadow-xl ${diffCfg.border}`}
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${diffCfg.badge}`}
                    >
                      {c.difficulty}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-1">
                      <ModeIcon className="w-3 h-3 text-slate-400" />
                      <span>{modeName}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {c.is_solved && (
                      <div className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
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
                        className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-60 hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 mb-1.5">
                  {c.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {c.description}
                </p>

                {/* Topics pills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {c.topics.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800"
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
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.estimated_minutes}m</span>
                  </span>
                  <span>{c.tests_count} checks</span>
                </div>

                <div className="flex items-center space-x-1 text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>{c.is_solved ? 'Practice Again' : 'Solve'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
