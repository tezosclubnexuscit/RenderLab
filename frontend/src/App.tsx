import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { ChallengeBrowser } from './components/ChallengeBrowser';
import { ProgressDashboard } from './components/ProgressDashboard';
import { LLMSettingsModal } from './components/LLMSettingsModal';
import { ChallengeGeneratorModal } from './components/ChallengeGeneratorModal';
import { LandingPage } from './components/LandingPage';
import { NavTab } from './components/Header';
import {
  Challenge,
  ChallengeListItem,
  LLMConfig,
  UserProgress,
} from './types';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';
import { useTheme } from './context/ThemeContext';

export const App: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [challenges, setChallenges] = useState<ChallengeListItem[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [llmConfig, setLlmConfig] = useState<LLMConfig | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [chList, cfg, prog] = await Promise.all([
        api.getChallenges(),
        api.getLLMConfig().catch(() => null),
        api.getProgress().catch(() => null),
      ]);

      setChallenges(chList);
      if (cfg) setLlmConfig(cfg);
      if (prog) setProgress(prog);

      // Select first challenge
      if (chList.length > 0) {
        const fullCh = await api.getChallenge(chList[0].id);
        setCurrentChallenge(fullCh);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSelectChallenge = async (id: string) => {
    setChallengeLoading(true);
    try {
      const ch = await api.getChallenge(id);
      setCurrentChallenge(ch);
      setActiveTab('workspace');
    } catch (err) {
      alert('Could not load challenge');
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleChallengeSolved = async () => {
    // Refresh challenges list and progress
    try {
      const [chList, prog] = await Promise.all([
        api.getChallenges(),
        api.getProgress(),
      ]);
      setChallenges(chList);
      setProgress(prog);
    } catch (e) {}
  };

  const handleChallengeGenerated = (newChallenge: Challenge) => {
    setCurrentChallenge(newChallenge);
    setActiveTab('workspace');
    // Refresh challenge list in background
    api.getChallenges().then(setChallenges).catch(() => {});
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      await api.deleteChallenge(id);
      const [chList, prog] = await Promise.all([
        api.getChallenges(),
        api.getProgress().catch(() => null),
      ]);
      setChallenges(chList);
      if (prog) setProgress(prog);

      if (currentChallenge?.id === id) {
        if (chList.length > 0) {
          const nextCh = await api.getChallenge(chList[0].id);
          setCurrentChallenge(nextCh);
        } else {
          setCurrentChallenge(null);
        }
      }
    } catch (err) {
      alert('Failed to delete challenge');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'light'
          ? 'bg-[#f8fafc] text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-700'
          : 'bg-[#0b0f17] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300'
      }`}
    >
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        llmConfig={llmConfig}
        progress={progress}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0">
        {initialLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-xs text-slate-400">Loading RenderLab Practice Suite...</p>
          </div>
        ) : (
          <>
            {activeTab === 'landing' && (
              <LandingPage
                onStartPracticing={() => setActiveTab('workspace')}
                onExploreChallenges={() => setActiveTab('browser')}
                onOpenGenerator={() => setIsGeneratorOpen(true)}
                onSelectChallenge={handleSelectChallenge}
                challenges={challenges}
              />
            )}

            {activeTab === 'workspace' && currentChallenge && (
              <Workspace
                challenge={currentChallenge}
                onChallengeSolved={handleChallengeSolved}
                llmConfig={llmConfig}
                loading={challengeLoading}
              />
            )}

            {activeTab === 'browser' && (
              <ChallengeBrowser
                challenges={challenges}
                onSelectChallenge={handleSelectChallenge}
                onOpenGenerator={() => setIsGeneratorOpen(true)}
                onDeleteChallenge={handleDeleteChallenge}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressDashboard
                progress={progress}
                challenges={challenges}
                onSelectChallenge={handleSelectChallenge}
              />
            )}
          </>
        )}
      </main>

      {/* AI Settings Modal (Dual LLM: Local vs Cloud API Key) */}
      <LLMSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={llmConfig}
        onConfigSaved={(updated) => setLlmConfig(updated)}
      />

      {/* AI Challenge Generator Modal */}
      <ChallengeGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onChallengeGenerated={handleChallengeGenerated}
        llmConfig={llmConfig}
      />
    </div>
  );
};

export default App;
