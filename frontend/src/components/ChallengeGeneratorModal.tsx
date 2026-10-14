import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, AlertCircle, CheckCircle2, Cpu, Key } from 'lucide-react';
import { Challenge, Difficulty, ChallengeMode, LLMConfig } from '../types';
import { api } from '../services/api';

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
  const [topic, setTopic] = useState('CSS Flexbox Holy Grail Layout');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [mode, setMode] = useState<ChallengeMode>('fill_blanks');
  const [learningObjective, setLearningObjective] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepMsg, setStepMsg] = useState('');
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [startingOllama, setStartingOllama] = useState(false);

  React.useEffect(() => {
    if (isOpen && llmConfig?.provider === 'ollama') {
      api.getLocalModels(llmConfig.base_url)
        .then((res) => setOllamaOnline(res.online))
        .catch(() => setOllamaOnline(false));
    }
  }, [isOpen, llmConfig]);

  const handleStartOllama = async () => {
    setStartingOllama(true);
    try {
      await api.startOllamaDaemon();
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        const res = await api.getLocalModels(llmConfig?.base_url).catch(() => ({ online: false }));
        if (res.online) {
          setOllamaOnline(true);
          break;
        }
      }
    } catch (e: any) {
      alert(`Could not automatically start Ollama: ${e.message}\nPlease launch Ollama from your desktop or start menu.`);
    } finally {
      setStartingOllama(false);
    }
  };

  if (!isOpen) return null;

  const topicPresets = [
    'CSS Grid Photo Gallery',
    'Animated Toggle Switch',
    'Debounced Search Filter',
    'Accessible Tab Navigation',
    'CSS Tooltip with Hover Delay',
    'Countdown Timer with Pause',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setStepMsg('Synthesizing challenge prompt and automated tests...');

    try {
      const newChallenge = await api.generateChallenge({
        topic,
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

  const isCloud = llmConfig?.provider && ['gemini', 'openai', 'groq', 'anthropic'].includes(llmConfig.provider);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-750 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Practice Challenge</h2>
              <p className="text-xs text-slate-400">
                Use your configured LLM or intelligent template engine to craft a personalized challenge
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
        <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
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
                <span className="font-semibold">Local Ollama is currently offline.</span> DevForge will automatically use its smart offline template synthesis so you get a full challenge instantly, or you can start Ollama or configure a free Cloud API key (Gemini/Groq) in AI Settings.
              </div>
            </div>
          )}

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Topic / Concept to Practice
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. CSS Grid holy grail layout, DOM event delegation, etc."
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {/* Quick Topic Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500 self-center">Suggestions:</span>
              {topicPresets.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Mode Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="easy">Easy (10-15 mins)</option>
                <option value="medium">Medium (15-25 mins)</option>
                <option value="hard">Hard (30+ mins)</option>
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
                <option value="fill_blanks">Fill in the Blanks (Mode A)</option>
                <option value="fix_broken">Fix the Broken Code (Mode B)</option>
                <option value="build_component">Build Component (Mode C)</option>
                <option value="recreate_page">Recreate Page (Mode D)</option>
              </select>
            </div>
          </div>

          {/* Optional Learning Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific Learning Objective <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={learningObjective}
              onChange={(e) => setLearningObjective(e.target.value)}
              placeholder="e.g. Master align-self and flex-wrap under responsive viewports"
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Additional Guidance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Custom Prompt or Constraints <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Ensure mobile viewport test cases are included"
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
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
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{loading ? 'Synthesizing...' : 'Generate with AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
