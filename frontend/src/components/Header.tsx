import React, { useState } from 'react';
import {
  Sparkles,
  Settings,
  Cpu,
  Key,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { LLMConfig, UserProgress } from '../types';
import { useTheme } from '../context/ThemeContext';
import { marioSound } from '../services/soundService';

export type NavTab = 'landing' | 'workspace' | 'browser' | 'progress';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
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
  const { theme, toggleTheme } = useTheme();
  const [isMuted, setIsMuted] = useState(marioSound.isMuted());

  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';

  const isCloudProvider =
    llmConfig?.provider && ['gemini', 'openai', 'groq', 'anthropic'].includes(llmConfig.provider);

  const handleTabClick = (tab: NavTab) => {
    marioSound.playPipe();
    setActiveTab(tab);
  };

  const handleCoinClick = () => {
    marioSound.playCoin();
  };

  const handleToggleSound = () => {
    const enabled = marioSound.toggleMute();
    setIsMuted(!enabled);
  };

  // Calculate Mario Score and Coins from user progress
  const score = progress
    ? (progress.solved_count * 1000 + (progress.streak || 0) * 200).toString().padStart(6, '0')
    : '000000';
  const coins = progress ? (progress.solved_count * 5 + 3).toString().padStart(2, '0') : '03';

  const getThemeLabel = () => {
    switch (theme) {
      case 'mario-overworld':
        return 'WORLD 1-1';
      case 'mario-underground':
        return 'WORLD 1-2';
      case 'mario-castle':
        return 'WORLD 8-4';
      case 'dark':
        return 'RETRO DARK';
      case 'light':
        return 'CLASSIC LIGHT';
      default:
        return 'MARIO';
    }
  };

  // Header background & border classes per theme
  const headerThemeClass = isLight
    ? 'bg-white text-slate-900 border-b-4 border-[#fcb400] shadow-sm'
    : isUnderground
    ? 'bg-[#050710] text-slate-100 border-b-4 border-[#2038ec] shadow-[0_4px_0_0_#2038ec]'
    : isCastle
    ? 'bg-[#080202] text-amber-100 border-b-4 border-[#d82800] shadow-[0_4px_0_0_#d82800]'
    : 'bg-[#000000] text-white border-b-4 border-[#fcb400] shadow-[0_4px_0_0_rgba(0,0,0,0.5)]';

  // Inactive tab styling per theme
  const inactiveTabClass = isLight
    ? 'text-slate-700 hover:text-black hover:bg-slate-100 border-2 border-transparent'
    : isUnderground
    ? 'text-slate-400 hover:text-white hover:bg-[#12182b] border-2 border-transparent'
    : isCastle
    ? 'text-amber-300/70 hover:text-amber-100 hover:bg-[#1c0a0a] border-2 border-transparent'
    : 'text-slate-300 hover:text-white hover:bg-slate-800 border-2 border-transparent';

  return (
    <header
      className={`h-16 ${headerThemeClass} sticky top-0 z-40 px-3 md:px-6 flex items-center justify-between select-none`}
    >
      {/* Left: Mario Brand Logo & NES Navigation */}
      <div className="flex items-center space-x-3 md:space-x-6">
        {/* Retro Mario Badge Logo */}
        <div
          onClick={() => handleTabClick('landing')}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Super RenderLab — Title Screen"
        >
          {/* Super Mario Mushroom Icon */}
          <div className="w-9 h-9 flex items-center justify-center group-hover:scale-110 transition-transform drop-shadow-[2px_2px_0px_#000000]">
            <img src="/favicon.svg" alt="Super Mario Mushroom" className="w-8 h-8 [image-rendering:pixelated]" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center space-x-1">
              <span
                className={`font-arcade text-xs md:text-sm tracking-wider ${
                  isLight
                    ? 'text-[#b84418] drop-shadow-[1px_1px_0px_#fcd800]'
                    : isCastle
                    ? 'text-[#fcd800] drop-shadow-[2px_2px_0px_#d82800]'
                    : isUnderground
                    ? 'text-[#5c94fc] drop-shadow-[2px_2px_0px_#2038ec]'
                    : 'text-[#fcd800] drop-shadow-[2px_2px_0px_#b84418]'
                }`}
              >
                SUPER RENDERLAB
              </span>
            </div>
            <div
              className={`text-[8px] font-arcade tracking-widest ${
                isLight
                  ? 'text-[#0050d0]'
                  : isUnderground
                  ? 'text-[#38bdf8]'
                  : isCastle
                  ? 'text-amber-400'
                  : 'text-[#5c94fc]'
              }`}
            >
              WEB PRACTICE SUITE
            </div>
          </div>
        </div>

        {/* Mario HUD Navigation Tabs */}
        <nav className="flex items-center space-x-1 md:space-x-2">
          <button
            onClick={() => handleTabClick('landing')}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade transition-all ${
              activeTab === 'landing'
                ? 'bg-[#e52521] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            <span className="hidden md:inline">1P </span>TITLE
          </button>

          <button
            onClick={() => handleTabClick('workspace')}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade transition-all ${
              activeTab === 'workspace'
                ? 'bg-[#00a800] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            STAGE
          </button>

          <button
            onClick={() => handleTabClick('browser')}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade transition-all ${
              activeTab === 'browser'
                ? 'bg-[#0050d0] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            WARP ZONE
          </button>

          <button
            onClick={() => handleTabClick('progress')}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-arcade transition-all ${
              activeTab === 'progress'
                ? 'bg-[#fc9838] text-black border-2 border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            SCORE
          </button>
        </nav>
      </div>

      {/* Center/Right HUD: Score & Coins */}
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mario HUD Display */}
        <div className="hidden sm:flex items-center space-x-4 font-arcade text-xs">
          {/* MARIO & SCORE */}
          <div className="text-center">
            <div className="text-[#e52521] text-[10px] font-arcade" style={{ color: '#e52521' }}>
              MARIO
            </div>
            <div
              className={`font-arcade tracking-widest text-xs font-bold ${
                isLight
                  ? 'text-slate-950'
                  : isCastle
                  ? 'text-amber-200'
                  : isUnderground
                  ? 'text-slate-100'
                  : 'text-white'
              }`}
            >
              {score}
            </div>
          </div>

          {/* COINS COUNTER */}
          <div
            onClick={handleCoinClick}
            className={`flex items-center space-x-1.5 cursor-pointer px-2 py-1 border-2 shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform select-none ${
              isLight
                ? 'bg-amber-50 text-slate-950 border-[#fcb400]'
                : isUnderground
                ? 'bg-[#12182b] text-[#5c94fc] border-[#2038ec]'
                : isCastle
                ? 'bg-[#1c0a0a] text-amber-300 border-[#d82800]'
                : 'bg-[#000000] text-white border-[#fcb400]'
            }`}
            title="Click for Mario Coin Chime!"
          >
            {/* Pixel Mario Coin SVG */}
            <svg className="w-3.5 h-3.5 mario-coin shrink-0" viewBox="0 0 16 16" fill="none">
              <rect x="5" y="1" width="6" height="14" fill="#fc9838" stroke="#000" strokeWidth="0.8" />
              <rect x="3" y="3" width="10" height="10" fill="#fcd800" stroke="#000" strokeWidth="0.8" />
              <rect x="6" y="4" width="4" height="8" fill="#fcb400" />
              <rect x="7" y="5" width="2" height="6" fill="#ffffff" />
            </svg>
            <span
              className={`font-arcade text-[10px] font-bold ${
                isLight
                  ? 'text-amber-950'
                  : isCastle
                  ? 'text-amber-300'
                  : isUnderground
                  ? 'text-cyan-300'
                  : 'text-[#fcd800]'
              }`}
            >
              x{coins}
            </span>
          </div>
        </div>

        {/* AI Question Block CTA */}
        <button
          onClick={() => {
            marioSound.playBlockBump();
            onOpenGenerator();
          }}
          className="mario-btn mario-question-block px-2.5 md:px-3 py-1.5 text-[10px] md:text-xs font-arcade flex items-center space-x-1 text-black font-extrabold cursor-pointer"
          title="Hit the Question Block to Generate a Challenge with AI!"
        >
          <span className="text-amber-900 font-black animate-pulse">[ ? ]</span>
          <span className="hidden sm:inline">AI LEVEL</span>
        </button>

        {/* AI Settings / Pipe Config */}
        <button
          onClick={() => {
            marioSound.playJump();
            onOpenSettings();
          }}
          className={`mario-btn px-2 py-1.5 text-[10px] font-arcade flex items-center space-x-1 ${
            isLight
              ? 'bg-slate-100 text-slate-800 border-2 border-black hover:bg-slate-200'
              : isUnderground
              ? 'bg-[#12182b] text-slate-200 border-[#2038ec]'
              : isCastle
              ? 'bg-[#1c0a0a] text-amber-200 border-[#d82800]'
              : 'bg-[#1e293b] text-white'
          }`}
          title="Configure AI Provider (Local Ollama / Cloud API)"
        >
          {isCloudProvider ? (
            <Key className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          )}
          <span className="hidden md:inline uppercase text-[9px]">
            {llmConfig?.provider || 'AI'}
          </span>
          <Settings className={`w-3 h-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
        </button>

        {/* Sound SFX Toggle */}
        <button
          onClick={handleToggleSound}
          className={`p-1.5 border-2 border-black text-xs font-arcade transition-all ${
            isMuted
              ? isLight
                ? 'bg-slate-200 text-slate-600 shadow-[2px_2px_0px_#000]'
                : isUnderground
                ? 'bg-[#12182b] text-slate-500 shadow-[2px_2px_0px_#000]'
                : isCastle
                ? 'bg-[#1c0a0a] text-amber-500/50 shadow-[2px_2px_0px_#000]'
                : 'bg-slate-800 text-slate-400 shadow-[2px_2px_0px_#000]'
              : 'bg-[#00a800] text-white shadow-[2px_2px_0px_#000]'
          }`}
          title={isMuted ? 'Unmute 8-Bit Mario SFX' : 'Mute Mario SFX'}
          aria-label="Toggle Sound"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Theme World Switcher */}
        <button
          onClick={() => {
            marioSound.playJump();
            toggleTheme();
          }}
          className={`px-2 py-1.5 text-[9px] font-arcade border-2 border-black shadow-[2px_2px_0px_#000] transition-colors ${
            isUnderground
              ? 'bg-[#2038ec] text-white hover:bg-[#3850fc]'
              : isCastle
              ? 'bg-[#d82800] text-white hover:bg-[#f04020]'
              : isLight
              ? 'bg-[#0050d0] text-white hover:bg-[#2070f0]'
              : 'bg-[#b84418] text-white hover:bg-[#d85820]'
          }`}
          title="Switch Mario Theme World"
          aria-label="Switch Theme"
        >
          {getThemeLabel()}
        </button>
      </div>
    </header>
  );
};
