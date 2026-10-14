import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Lightbulb, Send, RefreshCw, MessageSquare } from 'lucide-react';
import { Challenge, LLMConfig } from '../types';
import { api } from '../services/api';

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
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  const [history, setHistory] = useState<Array<{ role: 'user' | 'tutor'; text: string }>>([]);

  useEffect(() => {
    if (isOpen && challenge) {
      // Load initial pedagogical hint when modal opens
      loadHint();
    } else {
      // Clear state when closed
      setUserQuestion('');
    }
  }, [isOpen, challenge.id]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-750 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>AI Tutor Guidance</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Interactive
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Powered by {llmConfig?.model || 'active model'} ({llmConfig?.provider || 'local'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Failed tests alert */}
          {failedTests.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs">
              <span className="font-semibold text-rose-300">Targeting Failed Checks:</span>
              <ul className="list-disc list-inside mt-1 text-slate-300 space-y-0.5">
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
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600/15 border border-indigo-500/30 text-indigo-200 ml-6'
                      : 'bg-slate-900/90 border border-slate-750 text-slate-200 mr-2 whitespace-pre-line'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-semibold text-[10px] uppercase tracking-wider mb-1.5">
                    {msg.role === 'user' ? (
                      <>
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        <span className="text-indigo-300">Your Question</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-amber-400">Tutor Guidance</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300">{msg.text}</p>
                </div>
              ))}
            </div>
          ) : hint && !loading ? (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-750 text-slate-200 text-xs leading-relaxed space-y-2 whitespace-pre-line">
              <div className="flex items-center space-x-1.5 text-amber-400 font-semibold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedagogical Hint</span>
              </div>
              <p className="text-slate-300">{hint}</p>
            </div>
          ) : null}

          {/* Loading State */}
          {loading && (
            <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
              <span>Analyzing code and generating targeted hint...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {/* Built-in static clues */}
          {challenge.hints && challenge.hints.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase">
                Challenge Static Clues:
              </span>
              <div className="space-y-1.5">
                {challenge.hints.map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400"
                  >
                    💡 {h}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Custom Question Form */}
        <form onSubmit={handleAskQuestion} className="p-3 border-t border-slate-800 bg-slate-900/70 flex gap-2">
          <input
            type="text"
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask a specific question (e.g. How do I fix the transition?)"
            className="flex-1 bg-slate-950 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !userQuestion.trim()}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center space-x-1"
          >
            <Send className="w-3 h-3" />
            <span>Ask</span>
          </button>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={() => loadHint()}
            disabled={loading}
            className="text-xs text-amber-400 hover:underline flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Analyze latest code</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Got it, back to coding
          </button>
        </div>
      </div>
    </div>
  );
};
