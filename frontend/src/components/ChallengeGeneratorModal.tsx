import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Key,
  Globe,
  Palette,
  Zap,
  Check,
  BookOpen,
  Search,
} from 'lucide-react';
import { Challenge, Difficulty, ChallengeMode, LLMConfig } from '../types';
import { api } from '../services/api';
import {
  GENERATOR_BLUEPRINTS,
  MODE_EXPLANATIONS,
  GeneratorBlueprint,
} from '../data/generatorBlueprints';

interface ChallengeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeGenerated: (challenge: Challenge) => void;
  llmConfig: LLMConfig | null;
}

export const ChallengeGeneratorModal: React.FC<ChallengeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onChallengeGenerated,
  llmConfig,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'html' | 'css' | 'javascript'>('html');
  const [blueprintSearch, setBlueprintSearch] = useState('');
  const [selectedBlueprintId, setSelectedBlueprintId] = useState<string>('html-001');

  const [topic, setTopic] = useState('#1. Semantic Header & Nav Landmark');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<ChallengeMode>('fill_blanks');
  const [learningObjective, setLearningObjective] = useState(
    'Use a semantic <header> for the top branding area. Use a semantic <nav> element wrapping navigation links. Include at least 3 navigation links.'
  );
  const [customPrompt, setCustomPrompt] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepMsg, setStepMsg] = useState('');
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [startingOllama, setStartingOllama] = useState(false);

  React.useEffect(() => {
    if (isOpen && llmConfig?.provider === 'ollama') {
      api
        .getLocalModels(llmConfig.base_url)
        .then((res) => setOllamaOnline(res.online))
        .catch(() => setOllamaOnline(false));
    }
  }, [isOpen, llmConfig]);

  const extractNum = (str: string): number => {
    const m = str.match(/#?(\d+)/);
    return m ? parseInt(m[1], 10) : 999999;
  };

  const activeBlueprints = useMemo(() => {
    const list = GENERATOR_BLUEPRINTS[selectedCategory] || [];
    return [...list].sort((a, b) => extractNum(a.heading) - extractNum(b.heading));
  }, [selectedCategory]);

  const filteredBlueprints = useMemo(() => {
    let list = activeBlueprints;
    if (blueprintSearch.trim()) {
      const q = blueprintSearch.toLowerCase();
      list = list.filter(
        (b) =>
          b.heading.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.topics.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => extractNum(a.heading) - extractNum(b.heading));
  }, [activeBlueprints, blueprintSearch]);

  const handleSelectCategory = (cat: 'html' | 'css' | 'javascript') => {
    setSelectedCategory(cat);
    setBlueprintSearch('');
    const list = [...(GENERATOR_BLUEPRINTS[cat] || [])].sort(
      (a, b) => extractNum(a.heading) - extractNum(b.heading)
    );
    const firstBlueprint = list[0];
    if (firstBlueprint) {
      handleSelectBlueprint(firstBlueprint);
    }
  };

  const handleSelectBlueprint = (bp: GeneratorBlueprint) => {
    setSelectedBlueprintId(bp.id);
    setTopic(bp.heading);
    setDifficulty(bp.defaultDifficulty);
    setMode(bp.defaultMode);
    setLearningObjective(bp.howToResolve);
  };

  const handleStartOllama = async () => {
    setStartingOllama(true);
    try {
      await api.startOllamaDaemon();
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        const res = await api
          .getLocalModels(llmConfig?.base_url)
          .catch(() => ({ online: false }));
        if (res.online) {
          setOllamaOnline(true);
          break;
        }
      }
    } catch (e: any) {
      alert(
        `Could not automatically start Ollama: ${e.message}\nPlease launch Ollama from your desktop or start menu.`
      );
    } finally {
      setStartingOllama(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setStepMsg('Synthesizing challenge prompt, starter code, and automated tests...');

    try {
      const newChallenge = await api.generateChallenge({
        topic,
        category: selectedCategory,
        difficulty,
        mode,
        learning_objective: learningObjective || undefined,
        custom_prompt: customPrompt || undefined,
      });

      setStepMsg('Challenge validated and added to library!');
      setTimeout(() => {
        onChallengeGenerated(newChallenge);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Challenge generation failed. Check your LLM settings.');
    } finally {
      setLoading(false);
    }
  };

  const isCloud =
    llmConfig?.provider &&
    ['gemini', 'openai', 'groq', 'anthropic'].includes(llmConfig.provider);

  const activeModeInfo = MODE_EXPLANATIONS[mode] || {
    label: mode,
    badge: 'Custom',
    description: 'Custom challenge mode.',
  };

  const htmlCount = GENERATOR_BLUEPRINTS.html?.length || 0;
  const cssCount = GENERATOR_BLUEPRINTS.css?.length || 0;
  const jsCount = GENERATOR_BLUEPRINTS.javascript?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Custom Practice Challenge</h2>
              <p className="text-xs text-slate-400">
                Browse all 311 curriculum blueprints across HTML, CSS, &amp; JS to generate a custom problem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Active LLM Provider info banner */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              {isCloud ? (
                <Key className="w-4 h-4 text-amber-400" />
              ) : (
                <Cpu className="w-4 h-4 text-emerald-400" />
              )}
              <span>Active Model:</span>
              <span className="font-mono text-white font-semibold">
                {llmConfig?.model || 'deepseek-coder:6.7b'}
              </span>
              <span className="text-slate-500 capitalize">({llmConfig?.provider || 'ollama'})</span>
            </div>

            {!isCloud && ollamaOnline === false && (
              <button
                type="button"
                onClick={handleStartOllama}
                disabled={startingOllama}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 text-[11px] font-semibold transition-colors disabled:opacity-50"
              >
                {startingOllama ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>▶</span>}
                <span>{startingOllama ? 'Starting...' : 'Start Ollama'}</span>
              </button>
            )}
          </div>

          {!isCloud && ollamaOnline === false && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Local Ollama is offline.</span> RenderLab will use
                its built-in blueprint synthesis to produce a verified challenge immediately, or launch Ollama from your desktop.
              </div>
            </div>
          )}

          {/* ================= STEP 1: CATEGORY SELECTION TABS ================= */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              1. Select Category ({htmlCount + cssCount + jsCount} Blueprints Available)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectCategory('html')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  selectedCategory === 'html'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Globe className="w-4 h-4 text-rose-400" />
                <span>HTML ({htmlCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('css')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  selectedCategory === 'css'
                    ? 'bg-sky-500/20 border-sky-500/40 text-sky-300 shadow-sm shadow-sky-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Palette className="w-4 h-4 text-sky-400" />
                <span>CSS ({cssCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('javascript')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                  selectedCategory === 'javascript'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>JavaScript ({jsCount})</span>
              </button>
            </div>
          </div>

          {/* ================= STEP 2: BLUEPRINT RECIPES MAP WITH SEARCH ================= */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>2. Select Problem Statement Blueprint</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {filteredBlueprints.length} of {activeBlueprints.length} showing
              </span>
            </div>

            {/* Quick search filter for the 311 blueprints */}
            <div className="relative mb-2">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={blueprintSearch}
                onChange={(e) => setBlueprintSearch(e.target.value)}
                placeholder={`Search ${activeBlueprints.length} ${selectedCategory.toUpperCase()} blueprints...`}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {blueprintSearch && (
                <button
                  type="button"
                  onClick={() => setBlueprintSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Blueprints rendered as a sequential list based on challenge number */}
            <div className="flex flex-col space-y-1.5 max-h-56 overflow-y-auto pr-1.5 scrollbar-thin">
              {filteredBlueprints.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800/60">
                  No problem blueprints found matching &ldquo;{blueprintSearch}&rdquo;
                </div>
              ) : (
                filteredBlueprints.map((bp) => {
                  const isSelected = selectedBlueprintId === bp.id;
                  const numMatch = bp.heading.match(/^#(\d+)\.\s*(.*)$/);
                  const numStr = numMatch ? `#${numMatch[1]}` : `#${extractNum(bp.heading)}`;
                  const titleStr = numMatch ? numMatch[2] : bp.heading.replace(/^#?\d+\.\s*/, '');

                  return (
                    <div
                      key={bp.id}
                      onClick={() => handleSelectBlueprint(bp)}
                      className={`group p-2.5 px-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500/60 shadow-sm shadow-indigo-950/40 ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                    >
                      {/* Left: Number Badge + Title & Description */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <span
                          className={`shrink-0 inline-flex items-center justify-center min-w-[3.25rem] px-2 py-1 rounded-md font-mono text-xs font-bold border transition-colors ${
                            isSelected
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-800/90 text-slate-300 border-slate-700/60 group-hover:text-indigo-300 group-hover:border-slate-600'
                          }`}
                        >
                          {numStr}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-semibold leading-tight truncate transition-colors ${
                              isSelected
                                ? 'text-white'
                                : 'text-slate-200 group-hover:text-white'
                            }`}
                          >
                            {titleStr}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-snug">
                            {bp.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Badges & Selection Indicator */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            bp.defaultDifficulty === 'easy'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : bp.defaultDifficulty === 'medium'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {bp.defaultDifficulty === 'easy'
                            ? 'Beginner'
                            : bp.defaultDifficulty === 'medium'
                            ? 'Intermediate'
                            : 'Advanced'}
                        </span>

                        <span className="hidden md:inline-block px-2 py-0.5 rounded text-[10px] bg-slate-800 text-indigo-300 border border-slate-700/50 font-medium">
                          {MODE_EXPLANATIONS[bp.defaultMode]?.label || bp.defaultMode}
                        </span>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/50'
                              : 'border border-slate-700 text-transparent group-hover:border-slate-500'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= STEP 3: TOPIC & CUSTOMIZATION ================= */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Problem Statement Title / Topic
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. #1. Semantic Header & Nav Landmark"
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Difficulty & Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="easy">Beginner (10-15 mins)</option>
                  <option value="medium">Intermediate (15-25 mins)</option>
                  <option value="hard">Advanced (30+ mins)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Challenge Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ChallengeMode)}
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="fill_blanks">Fill in the Blanks</option>
                  <option value="build_component">Build Component from Scratch</option>
                  <option value="fix_broken">Diagnose &amp; Fix Broken Code</option>
                  <option value="recreate_page">Recreate Target Design</option>
                </select>
              </div>
            </div>

            {/* Mode Description Alert Box (For user and passed to LLM) */}
            <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/25 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300 text-[11px] uppercase tracking-wide">
                  Mode: {activeModeInfo.label}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                  {activeModeInfo.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeModeInfo.description}
              </p>
            </div>

            {/* How Problem Statement Should Be Resolved / Objective */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                How Problem Statement Should Be Resolved (Learning Objective)
              </label>
              <textarea
                rows={2}
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                placeholder="e.g. Specify which semantic tags, CSS properties, or DOM methods the user must implement"
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
              />
            </div>

            {/* Custom Extra Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Additional Instructions or Constraints{' '}
                <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Include mobile responsive tests or dark theme styling"
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Generation Error: </span>
                {error}
              </div>
            </div>
          )}

          {stepMsg && (
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center space-x-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>{stepMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{loading ? 'Synthesizing...' : 'Generate Challenge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
