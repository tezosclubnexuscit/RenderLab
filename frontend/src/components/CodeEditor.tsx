import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { marioSound } from '../services/soundService';

export type EditorTab = 'html' | 'css' | 'javascript';

interface CodeEditorProps {
  html: string;
  css: string;
  javascript: string;
  onCodeChange: (tab: EditorTab, value: string) => void;
  onResetStarter: () => void;
  onRunPreview: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  html,
  css,
  javascript,
  onCodeChange,
  onResetStarter,
  onRunPreview,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';

  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const getLanguage = (tab: EditorTab) => {
    switch (tab) {
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'javascript':
        return 'javascript';
    }
  };

  const getCurrentCode = () => {
    switch (activeTab) {
      case 'html':
        return html;
      case 'css':
        return css;
      case 'javascript':
        return javascript;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentCode());
    marioSound.playCoin();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTabSwitch = (tab: EditorTab) => {
    marioSound.playPipe();
    setActiveTab(tab);
  };

  // Header and container classes
  const containerClass = isLight
    ? 'flex flex-col h-full bg-white border-x-4 border-black'
    : isUnderground
    ? 'flex flex-col h-full bg-[#050710] border-x-4 border-[#2038ec]'
    : isCastle
    ? 'flex flex-col h-full bg-[#080202] border-x-4 border-[#d82800]'
    : 'flex flex-col h-full bg-[#000000] border-x-4 border-black';

  const headerClass = isLight
    ? 'h-11 bg-slate-100 border-b-2 border-black px-3 flex items-center justify-between text-slate-900 select-none'
    : isUnderground
    ? 'h-11 bg-[#050710] border-b-2 border-[#2038ec] px-3 flex items-center justify-between text-slate-100 select-none'
    : isCastle
    ? 'h-11 bg-[#080202] border-b-2 border-[#d82800] px-3 flex items-center justify-between text-amber-100 select-none'
    : 'h-11 bg-black border-b-2 border-black px-3 flex items-center justify-between text-white select-none';

  const inactiveTabClass = isLight
    ? 'bg-white text-slate-700 border-slate-300 hover:text-black hover:border-black font-bold'
    : isUnderground
    ? 'bg-[#12182b] text-slate-400 border-[#2038ec]/50 hover:text-white'
    : isCastle
    ? 'bg-[#1c0a0a] text-amber-200/60 border-[#d82800]/50 hover:text-amber-100'
    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white';

  const iconBtnClass = isLight
    ? 'p-1.5 bg-slate-200 border border-slate-300 text-slate-700 hover:text-black hover:bg-slate-300 transition-colors'
    : isUnderground
    ? 'p-1.5 bg-[#12182b] border border-[#2038ec] text-slate-300 hover:text-white transition-colors'
    : isCastle
    ? 'p-1.5 bg-[#1c0a0a] border border-[#d82800] text-amber-200 hover:text-amber-100 transition-colors'
    : 'p-1.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors';

  return (
    <div className={containerClass}>
      {/* Editor Header Bar */}
      <div className={headerClass}>
        {/* Arcade Style Tabs */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleTabSwitch('html')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-[10px] font-arcade border-2 transition-all ${
              activeTab === 'html'
                ? 'bg-[#e52521] text-white border-white shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            <span className="text-[#fcd800]">&lt;/&gt;</span>
            <span>HTML</span>
          </button>

          <button
            onClick={() => handleTabSwitch('css')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-[10px] font-arcade border-2 transition-all ${
              activeTab === 'css'
                ? 'bg-[#0050d0] text-white border-white shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            <span className="text-[#38bdf8]">#</span>
            <span>CSS</span>
          </button>

          <button
            onClick={() => handleTabSwitch('javascript')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-[10px] font-arcade border-2 transition-all ${
              activeTab === 'javascript'
                ? 'bg-[#fc9838] text-black border-white shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            <span className="font-bold">&#123;&#125;</span>
            <span>JS</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Run Preview CTA */}
          <button
            onClick={() => {
              marioSound.playJump();
              onRunPreview();
            }}
            className="mario-btn mario-btn-green px-2.5 py-1 text-[10px] font-arcade flex items-center space-x-1"
            title="Refresh preview immediately"
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>RUN</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={iconBtnClass}
            title="Copy current tab code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Starter Code */}
          <button
            onClick={() => {
              marioSound.playBlockBump();
              setShowResetConfirm(true);
            }}
            className={iconBtnClass}
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <div className="bg-[#b84418] border-b-2 border-black px-4 py-2 flex items-center justify-between text-xs font-arcade text-white animate-in fade-in">
          <span>RESET LEVEL BACK TO START?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="mario-btn mario-btn-dark px-2 py-0.5 text-[9px]"
            >
              CANCEL
            </button>
            <button
              onClick={() => {
                marioSound.playPipe();
                onResetStarter();
                setShowResetConfirm(false);
              }}
              className="mario-btn mario-btn-red px-2 py-0.5 text-[9px]"
            >
              YES, RESET
            </button>
          </div>
        </div>
      )}

      {/* Monaco Editor Container */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language={getLanguage(activeTab)}
          value={getCurrentCode()}
          theme={isLight ? 'vs' : 'vs-dark'}
          onChange={(val) => onCodeChange(activeTab, val || '')}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            tabSize: 2,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
};
