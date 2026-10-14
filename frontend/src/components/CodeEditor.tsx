import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { RotateCcw, Copy, Check, FileCode2, Play } from 'lucide-react';

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
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#111726] border-x border-slate-800">
      {/* Editor Header Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between">
        {/* Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('html')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-md text-xs font-mono font-medium border-t-2 transition-colors ${
              activeTab === 'html'
                ? 'bg-[#111726] text-amber-400 border-amber-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850'
            }`}
          >
            <span className="text-amber-500 font-bold">&lt;/&gt;</span>
            <span>index.html</span>
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-md text-xs font-mono font-medium border-t-2 transition-colors ${
              activeTab === 'css'
                ? 'bg-[#111726] text-cyan-400 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850'
            }`}
          >
            <span className="text-cyan-500 font-bold">#</span>
            <span>styles.css</span>
          </button>
          <button
            onClick={() => setActiveTab('javascript')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-t-md text-xs font-mono font-medium border-t-2 transition-colors ${
              activeTab === 'javascript'
                ? 'bg-[#111726] text-yellow-400 border-yellow-500'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-850'
            }`}
          >
            <span className="text-yellow-500 font-bold">&#123;&#125;</span>
            <span>script.js</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Run Preview CTA */}
          <button
            onClick={onRunPreview}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-semibold transition-colors"
            title="Refresh preview immediately (Ctrl + Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy current tab code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Reset Starter Code */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      {showResetConfirm && (
        <div className="bg-amber-950/90 border-b border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-200 animate-in fade-in">
          <span>Are you sure you want to reset all tabs back to starter code?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onResetStarter();
                setShowResetConfirm(false);
              }}
              className="px-2 py-0.5 rounded bg-amber-600 text-white font-semibold hover:bg-amber-500"
            >
              Yes, Reset
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
          theme="vs-dark"
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
