import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Send } from 'lucide-react';
import { Challenge, LLMConfig } from '../types';
import { api } from '../services/api';
import { marioSound } from '../services/soundService';
import { useTheme } from '../context/ThemeContext';

interface AIHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  html: string;
  css: string;
  javascript: string;
  failedTests: string[];
  llmConfig: LLMConfig | null;
}

export const AIHintModal: React.FC<AIHintModalProps> = ({
  isOpen,
  onClose,
  challenge,
  html,
  css,
  javascript,
  failedTests,
  llmConfig,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'tutor'; text: string }>>([]);

  useEffect(() => {
    if (isOpen && challenge) {
      marioSound.playBlockBump();
      loadHint();
    } else {
      setUserQuestion('');
      setHistory([]);
      setHint(null);
      setError(null);
    }
  }, [isOpen, challenge?.id]);

  const loadHint = async (customQ?: string) => {
    setLoading(true);
    setError(null);
    const qToSend = customQ || userQuestion;

    if (customQ) {
      setHistory((prev) => [...prev, { role: 'user', text: customQ }]);
      setUserQuestion('');
    }

    try {
      const res = await api.getAIHint({
        challenge_id: challenge.id,
        code_html: html,
        code_css: css,
        code_js: javascript,
        failed_tests: failedTests,
        user_question: qToSend || undefined,
      });

      setHint(res.hint);
      setHistory((prev) => [...prev, { role: 'tutor', text: res.hint }]);
      marioSound.playCoin();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI tutor hint. Please check your AI Settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim() || loading) return;
    loadHint(userQuestion.trim());
  };

  if (!isOpen) return null;

  // Modal Container style per theme
  const modalContainerClass = isLight
    ? 'bg-white border-4 border-black text-slate-900 shadow-[8px_8px_0px_#000]'
    : isUnderground
    ? 'bg-[#050710] border-4 border-[#2038ec] text-slate-100 shadow-[8px_8px_0px_#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-4 border-[#d82800] text-amber-100 shadow-[8px_8px_0px_#d82800]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 text-white shadow-[8px_8px_0px_#000]'
    : 'bg-[#000000] border-4 border-white text-white shadow-[8px_8px_0px_#000]';

  // Chat bubbles styling
  const userBubbleClass = isLight
    ? 'bg-blue-50 border-blue-400 text-slate-900'
    : isUnderground
    ? 'bg-[#12182b] border-[#2038ec] text-cyan-200'
    : isCastle
    ? 'bg-[#1c0a0a] border-[#d82800] text-amber-200'
    : 'bg-slate-900 border-slate-600 text-cyan-200';

  const tutorBubbleClass = isLight
    ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-[3px_3px_0px_#000]'
    : isUnderground
    ? 'bg-[#0b0f20] border-[#fcd800] text-slate-100 shadow-[3px_3px_0px_#2038ec]'
    : isCastle
    ? 'bg-[#120404] border-[#fc9838] text-amber-100 shadow-[3px_3px_0px_#d82800]'
    : 'bg-black border-[#fcd800] text-slate-100 shadow-[3px_3px_0px_#000]';

  // Bottom form container
  const formContainerClass = isLight
    ? 'bg-slate-100 border-t-2 border-black'
    : isUnderground
    ? 'bg-[#050710] border-t-2 border-[#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-t-2 border-[#d82800]'
    : 'bg-slate-950 border-t-2 border-white';

  const inputClass = isLight
    ? 'bg-white border-2 border-black text-slate-900 placeholder:text-slate-400 focus:border-[#fcb400]'
    : isUnderground
    ? 'bg-[#0b0f20] border-2 border-[#2038ec] text-white placeholder:text-slate-500 focus:border-[#5c94fc]'
    : isCastle
    ? 'bg-[#120404] border-2 border-[#d82800] text-amber-100 placeholder:text-amber-500/50 focus:border-[#fc9838]'
    : 'bg-black border-2 border-slate-700 text-white placeholder:text-slate-500 focus:border-[#fcd800]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-lg flex flex-col max-h-[85vh] ${modalContainerClass}`}>
        {/* Header: Toad's House */}
        <div className="px-4 py-3 border-b-2 border-black flex items-center justify-between bg-[#e52521] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="text-2xl">🍄</div>
            <div>
              <h3 className="font-arcade text-xs text-[#fcd800] !text-[#fcd800] drop-shadow-[1px_1px_0px_#000]">
                TOAD'S HOUSE OF HINTS
              </h3>
              <p className="font-pixel text-[11px] text-white/90">
                AI Powered by {llmConfig?.provider || 'Active Engine'}
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

        {/* Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 font-pixel">
          {/* Failed tests alert */}
          {failedTests.length > 0 && (
            <div
              className={`p-3 border-2 text-xs ${
                isLight
                  ? 'bg-red-50 border-red-500 text-red-900'
                  : 'bg-red-950/60 border-red-600 text-red-200'
              }`}
            >
              <span
                className={`font-arcade text-[9px] block mb-1 ${
                  isLight ? 'text-red-700 font-bold' : 'text-[#fcd800]'
                }`}
              >
                TARGETING FAILED CHECKS:
              </span>
              <ul className="list-disc list-inside space-y-0.5">
                {failedTests.map((t, idx) => (
                  <li key={idx} className="text-[11px] font-mono">{t}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conversation History / Hint */}
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 border-2 leading-relaxed ${
                    msg.role === 'user'
                      ? `ml-4 ${userBubbleClass}`
                      : `mr-2 whitespace-pre-line ${tutorBubbleClass}`
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-arcade text-[9px] mb-1">
                    {msg.role === 'user' ? (
                      <span className={isLight ? 'text-blue-700 font-bold' : 'text-cyan-400'}>
                        YOUR QUESTION:
                      </span>
                    ) : (
                      <span className={isLight ? 'text-amber-800 font-bold' : 'text-[#fcd800]'}>
                        TOAD'S ADVICE:
                      </span>
                    )}
                  </div>
                  <p className="text-xs">{msg.text}</p>
                </div>
              ))}
            </div>
          ) : hint && !loading ? (
            <div className={`p-3 border-2 text-xs leading-relaxed space-y-1.5 whitespace-pre-line ${tutorBubbleClass}`}>
              <div className={`font-arcade text-[9px] ${isLight ? 'text-amber-800 font-bold' : 'text-[#fcd800]'}`}>
                TOAD'S ADVICE:
              </div>
              <p>{hint}</p>
            </div>
          ) : null}

          {/* Loading State */}
          {loading && (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-[#fcd800] font-arcade text-[10px]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className={isLight ? 'text-amber-700 font-bold' : 'text-[#fcd800]'}>
                CONSULTING THE TOAD SAGES...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div
              className={`p-3 border-2 text-xs ${
                isLight
                  ? 'bg-red-50 border-red-500 text-red-900'
                  : 'bg-red-950 border-red-600 text-red-200'
              }`}
            >
              {error}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleAskQuestion} className={`p-3 flex gap-2 ${formContainerClass}`}>
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask Toad for advice without spoiling..."
            className={`flex-1 px-3 py-1.5 text-xs font-pixel focus:outline-none ${inputClass}`}
          />
          <button
            type="submit"
            disabled={loading || !userQuestion.trim()}
            className="mario-btn mario-btn-yellow px-3 py-1.5 text-[10px] font-arcade text-black disabled:opacity-50 flex items-center space-x-1"
          >
            <span>ASK</span>
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>
    </div>
  );
};
