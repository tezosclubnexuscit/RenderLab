import React from 'react';
import {
  Code2,
  Sparkles,
  Settings,
  Flame,
  LayoutGrid,
  BarChart3,
  CheckCircle2,
  Cpu,
  Key,
} from 'lucide-react';
import { LLMConfig, UserProgress } from '../types';

interface HeaderProps {
  activeTab: 'workspace' | 'browser' | 'progress';
  setActiveTab: (tab: 'workspace' | 'browser' | 'progress') => void;
  onOpenSettings: () => void;
  onOpenGenerator: () => void;
  llmConfig: LLMConfig | null;
  progress: UserProgress | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenGenerator,
  llmConfig,
  progress,
}) => {
  const isCloudProvider =
    llmConfig?.provider && ['gemini', 'openai', 'groq', 'anthropic'].includes(llmConfig.provider);

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
      {/* Brand & Main Navigation */}
      <div className="flex items-center space-x-6">
        <div
          onClick={() => setActiveTab('workspace')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                DevForge
              </span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Suite
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'workspace'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Practice Workspace</span>
          </button>
          <button
            onClick={() => setActiveTab('browser')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'browser'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Challenges</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === 'progress'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Progress & Stats</span>
          </button>
        </nav>
      </div>

      {/* Right Controls: Stats, AI Generator, Provider Settings */}
      <div className="flex items-center space-x-3">
        {/* Solved Counter badge */}
        {progress && (
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-slate-850 border border-slate-800 text-xs">
            <div className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="font-semibold">{progress.solved_count}</span>
              <span className="text-slate-400">/{progress.total_challenges}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center space-x-1 text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span className="font-semibold">{progress.accuracy_percent}%</span>
            </div>
          </div>
        )}

        {/* AI Generator CTA */}
        <button
          onClick={onOpenGenerator}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Generate Challenge</span>
        </button>

        {/* Active Provider Badge & Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-md bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs text-slate-300 transition-colors"
          title="Configure Local LLM or Cloud API Key"
        >
          {isCloudProvider ? (
            <Key className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="font-medium capitalize">
            {llmConfig ? `${llmConfig.provider}` : 'AI Settings'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              isCloudProvider && !llmConfig?.api_key
                ? 'bg-amber-500'
                : 'bg-emerald-400 animate-pulse'
            }`}
          />
          <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200 ml-0.5" />
        </button>
      </div>
    </header>
  );
};
