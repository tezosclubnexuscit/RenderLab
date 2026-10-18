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
import { marioSound } from '../services/soundService';
import {
  GENERATOR_BLUEPRINTS,
  MODE_EXPLANATIONS,
  GeneratorBlueprint,
} from '../data/generatorBlueprints';
import { useTheme } from '../context/ThemeContext';

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
    marioSound.playPipe();
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
    marioSound.playBlockBump();
    setSelectedBlueprintId(bp.id);
    setTopic(bp.heading);
    setDifficulty(bp.defaultDifficulty);
    setMode(bp.defaultMode);
    setLearningObjective(bp.learningObjective);
  };

  const handleStartOllama = async () => {
    setStartingOllama(true);
    try {
      const res = await api.startOllama();
      if (res.status === 'success' || (res as any).success) {
        setOllamaOnline(true);
      }
    } catch {
      setOllamaOnline(false);
    } finally {
      setStartingOllama(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    marioSound.playJump();
    setLoading(true);
    setError(null);
    setStepMsg('Contacting AI synthesis pipe...');

    try {
      const newChallenge = await api.generateChallenge({
        topic: topic.trim(),
        difficulty,
        mode,
        category: selectedCategory,
        blueprint_id: selectedBlueprintId,
        learning_objective: learningObjective.trim(),
        custom_prompt: customPrompt.trim() || undefined,
      });

      marioSound.playStageClear();
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

  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl border-4 shadow-[8px_8px_0px_#000] flex flex-col font-pixel ${
          isLight ? 'bg-white border-black text-slate-900' : 'bg-[#000000] border-white text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b-2 border-black flex items-center justify-between bg-[#e52521] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 mario-question-block flex items-center justify-center text-black font-arcade font-black text-xs shrink-0">
              ?
            </div>
            <div>
              <h2 className="font-arcade text-xs text-[#fcd800] !text-[#fcd800] drop-shadow-[1px_1px_0px_#000]">
                GENERATE CUSTOM PRACTICE CHALLENGE
              </h2>
              <p className="font-pixel text-[11px] text-white/90">
                Browse 300+ blueprints across HTML, CSS, &amp; JS to generate custom levels
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              marioSound.playBlockBump();
              onClose();
            }}
            className="mario-btn mario-btn-dark px-2 py-0.5 text-xs font-arcade"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Active LLM Provider info banner */}
          <div
            className={`p-2.5 border-2 flex items-center justify-between text-xs ${
              isLight ? 'bg-slate-100 border-black text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {isCloud ? (
                <Key className="w-4 h-4 text-amber-500" />
              ) : (
                <Cpu className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-[#00d800]'}`} />
              )}
              <span
                className={`font-arcade text-[9px] ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                MODEL:
              </span>
              <span
                className={`font-mono font-semibold ${
                  isLight ? 'text-slate-950 font-bold' : 'text-white'
                }`}
              >
                {llmConfig?.model || 'deepseek-coder:6.7b'}
              </span>
              <span
                className={`font-arcade text-[9px] capitalize ${
                  isLight ? 'text-slate-600 font-bold' : 'text-slate-400'
                }`}
              >
                ({llmConfig?.provider || 'ollama'})
              </span>
            </div>

            {!isCloud && ollamaOnline === false && (
              <button
                type="button"
                onClick={handleStartOllama}
                disabled={startingOllama}
                className="mario-btn mario-btn-yellow px-2 py-0.5 text-[9px] font-arcade text-black"
              >
                {startingOllama ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>▶</span>}
                <span>START OLLAMA</span>
              </button>
            )}
          </div>

          {!isCloud && ollamaOnline === false && (
            <div className="p-2.5 bg-red-100 border-2 border-red-600 text-red-900 text-xs flex items-start space-x-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-arcade text-[9px] text-[#b84418]">LOCAL OLLAMA OFFLINE: </span>
                RenderLab will use fallback blueprint synthesis or launch Ollama from desktop.
              </div>
            </div>
          )}

          {/* ================= STEP 1: CATEGORY SELECTION TABS ================= */}
          <div>
            <label
              className={`block font-arcade text-[10px] mb-2 ${
                isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
              }`}
            >
              1. SELECT CATEGORY ({htmlCount + cssCount + jsCount} BLUEPRINTS)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectCategory('html')}
                className={`mario-btn py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-1.5 ${
                  selectedCategory === 'html'
                    ? 'mario-btn-red text-white'
                    : isLight
                    ? 'bg-slate-100 border-2 border-black text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <span>🍄 HTML ({htmlCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('css')}
                className={`mario-btn py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-1.5 ${
                  selectedCategory === 'css'
                    ? 'mario-btn-blue text-white'
                    : isLight
                    ? 'bg-slate-100 border-2 border-black text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <span>🎨 CSS ({cssCount})</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('javascript')}
                className={`mario-btn py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-1.5 ${
                  selectedCategory === 'javascript'
                    ? 'mario-btn-yellow text-black'
                    : isLight
                    ? 'bg-slate-100 border-2 border-black text-slate-700 hover:text-black hover:bg-slate-200'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <span>⚡ JS ({jsCount})</span>
              </button>
            </div>
          </div>

          {/* ================= STEP 2: BLUEPRINT RECIPES MAP WITH SEARCH ================= */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                className={`font-arcade text-[10px] ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                2. SELECT PROBLEM STATEMENT BLUEPRINT
              </label>
              <span
                className={`font-arcade text-[9px] ${
                  isLight ? 'text-slate-700 font-bold' : 'text-slate-400'
                }`}
              >
                {filteredBlueprints.length}/{activeBlueprints.length}
              </span>
            </div>

            {/* Quick search filter for the 311 blueprints */}
            <div className="relative mb-2">
              <Search
                className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              />
              <input
                type="text"
                value={blueprintSearch}
                onChange={(e) => setBlueprintSearch(e.target.value)}
                placeholder={`Search ${activeBlueprints.length} ${selectedCategory.toUpperCase()} blueprints...`}
                className={`w-full border-2 pl-8 pr-3 py-1.5 text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-black text-slate-900 font-bold placeholder-slate-400 focus:border-[#0050d0]'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#fcd800]'
                }`}
              />
              {blueprintSearch && (
                <button
                  type="button"
                  onClick={() => setBlueprintSearch('')}
                  className={`absolute right-2.5 top-2 text-xs font-arcade ${
                    isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  &times;
                </button>
              )}
            </div>

            {/* Blueprints rendered as a sequential list based on challenge number */}
            <div className="flex flex-col space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredBlueprints.length === 0 ? (
                <div
                  className={`text-center py-6 text-xs border-2 border-dashed font-arcade ${
                    isLight
                      ? 'bg-slate-50 border-slate-400 text-slate-700'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  NO BLUEPRINTS MATCH &ldquo;{blueprintSearch}&rdquo;
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
                      className={`p-2.5 border-2 text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-100/90 border-black shadow-[2px_2px_0px_#000]'
                            : 'bg-[#fc9838]/20 border-[#fc9838] shadow-[2px_2px_0px_#000]'
                          : isLight
                          ? 'bg-slate-50 border-slate-300 hover:border-black'
                          : 'bg-slate-900 border-slate-700 hover:border-white'
                      }`}
                    >
                      {/* Left: Number Badge + Title & Description */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span
                          className={`shrink-0 font-arcade text-[9px] px-1.5 py-0.5 border ${
                            isSelected
                              ? 'bg-[#fc9838] text-black border-black'
                              : isLight
                              ? 'bg-slate-200 text-slate-800 border-slate-400 font-bold'
                              : 'bg-black text-[#fcd800] border-slate-700'
                          }`}
                        >
                          {numStr}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-semibold leading-tight truncate ${
                              isLight ? 'text-slate-950 font-bold' : 'text-white'
                            }`}
                          >
                            {titleStr}
                          </h4>
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {bp.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-1.5 py-0.5 font-arcade text-[8px] border ${
                            bp.defaultDifficulty === 'easy'
                              ? 'bg-[#00a800] text-white border-black'
                              : bp.defaultDifficulty === 'medium'
                              ? 'bg-[#fc9838] text-black border-black'
                              : 'bg-[#e52521] text-white border-black'
                          }`}
                        >
                          {bp.defaultDifficulty === 'easy'
                            ? 'WORLD 1'
                            : bp.defaultDifficulty === 'medium'
                            ? 'WORLD 2'
                            : 'BOWSER'}
                        </span>

                        <div
                          className={`w-4 h-4 flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#00a800] text-white border-black'
                              : isLight
                              ? 'border-slate-400 text-transparent'
                              : 'border-slate-600 text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ================= STEP 3: TOPIC & CUSTOMIZATION ================= */}
          <div className="space-y-3 pt-2 border-t-2 border-black">
            <div>
              <label
                className={`block font-arcade text-[10px] mb-1 ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                PROBLEM STATEMENT TITLE / TOPIC
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. #1. Semantic Header & Nav Landmark"
                className={`w-full border-2 px-3 py-1.5 text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-black text-slate-900 font-bold placeholder-slate-400 focus:border-[#0050d0]'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#fcd800]'
                }`}
              />
            </div>

            {/* Difficulty & Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block font-arcade text-[10px] mb-1 ${
                    isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                  }`}
                >
                  DIFFICULTY
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className={`w-full border-2 px-2 py-1.5 text-xs font-pixel focus:outline-none ${
                    isLight
                      ? 'bg-white border-black text-slate-900 font-bold focus:border-[#0050d0]'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#fcd800]'
                  }`}
                >
                  <option value="easy">WORLD 1 (Beginner, 10-15m)</option>
                  <option value="medium">WORLD 2 (Intermediate, 15-25m)</option>
                  <option value="hard">BOWSER (Advanced, 30+m)</option>
                </select>
              </div>

              <div>
                <label
                  className={`block font-arcade text-[10px] mb-1 ${
                    isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                  }`}
                >
                  CHALLENGE MODE
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ChallengeMode)}
                  className={`w-full border-2 px-2 py-1.5 text-xs font-pixel focus:outline-none ${
                    isLight
                      ? 'bg-white border-black text-slate-900 font-bold focus:border-[#0050d0]'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#fcd800]'
                  }`}
                >
                  <option value="fill_blanks">Fill in the Blanks</option>
                  <option value="build_component">Build Component</option>
                  <option value="fix_broken">Diagnose &amp; Fix Bugs</option>
                  <option value="recreate_page">Recreate Target Design</option>
                </select>
              </div>
            </div>

            {/* Learning Objective */}
            <div>
              <label
                className={`block font-arcade text-[10px] mb-1 ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                LEARNING OBJECTIVE
              </label>
              <textarea
                rows={2}
                value={learningObjective}
                onChange={(e) => setLearningObjective(e.target.value)}
                className={`w-full border-2 px-3 py-1.5 text-xs focus:outline-none resize-none leading-relaxed ${
                  isLight
                    ? 'bg-white border-black text-slate-900 font-bold placeholder-slate-400 focus:border-[#0050d0]'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#fcd800]'
                }`}
              />
            </div>

            {/* Custom Extra Instructions */}
            <div>
              <label
                className={`block font-arcade text-[10px] mb-1 ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                ADDITIONAL CONSTRAINTS (OPTIONAL)
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Include mobile responsive tests or dark theme styling"
                className={`w-full border-2 px-3 py-1.5 text-xs focus:outline-none ${
                  isLight
                    ? 'bg-white border-black text-slate-900 font-bold placeholder-slate-400 focus:border-[#0050d0]'
                    : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-[#fcd800]'
                }`}
              />
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="p-3 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-bold">
              <span className="font-arcade text-[9px] text-[#b84418] block mb-0.5">GENERATION ERROR:</span>
              {error}
            </div>
          )}

          {stepMsg && (
            <div
              className={`p-2.5 border-2 font-arcade text-[10px] flex items-center space-x-2 ${
                isLight ? 'bg-emerald-50 border-[#00a800] text-emerald-950 font-bold' : 'bg-black border-[#00d800] text-[#00d800]'
              }`}
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>{stepMsg}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div
            className={`pt-3 border-t-2 flex items-center justify-end space-x-2 ${
              isLight ? 'border-black' : 'border-white'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                marioSound.playBlockBump();
                onClose();
              }}
              disabled={loading}
              className={`mario-btn px-3 py-1.5 text-[10px] font-arcade ${
                isLight ? 'bg-slate-200 text-slate-800 border-2 border-black hover:bg-slate-300' : 'mario-btn-dark'
              }`}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="mario-btn mario-btn-yellow px-4 py-1.5 text-[10px] font-arcade text-black flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{loading ? 'SYNTHESIZING...' : 'GENERATE LEVEL ▶'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
