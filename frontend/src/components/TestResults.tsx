import React from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Sparkles,
  Clock,
} from 'lucide-react';
import { TestCase, SubmissionResponse } from '../types';
import { marioSound } from '../services/soundService';
import { useTheme } from '../context/ThemeContext';

interface TestResultsProps {
  tests: TestCase[];
  lastSubmission: SubmissionResponse | null;
  submitting: boolean;
  onSubmit: () => void;
  onAskAIHint: (failedTests: string[]) => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  tests,
  lastSubmission,
  submitting,
  onSubmit,
  onAskAIHint,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isOverworld = theme === 'mario-overworld';

  // Panel background: per-theme
  const panelBg = isLight
    ? 'bg-white'
    : isUnderground
    ? 'bg-[#0b0f20]'
    : isCastle
    ? 'bg-[#120404]'
    : 'bg-[#111726]'; // dark & overworld

  // Header bar bg
  const headerBg = isLight
    ? 'bg-slate-100 border-b-2 border-black'
    : isUnderground
    ? 'bg-[#050710] border-b-2 border-[#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-b-2 border-[#d82800]'
    : 'bg-black border-b-2 border-black';

  // Test card base (no result yet)
  const cardBase = isLight
    ? 'bg-white border-slate-300 text-slate-900'
    : isUnderground
    ? 'bg-[#12182b] border-slate-700 text-slate-200'
    : isCastle
    ? 'bg-[#1c0a0a] border-red-900 text-amber-100'
    : 'bg-slate-900 border-slate-700 text-slate-200';

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#e52521', '#00a800', '#fcd800', '#5c94fc'],
    });
  };

  React.useEffect(() => {
    if (lastSubmission) {
      if (lastSubmission.status === 'passed') {
        marioSound.playStageClear();
        triggerConfetti();
      } else {
        marioSound.playBlockBump();
      }
    }
  }, [lastSubmission]);

  const failedTestNames =
    lastSubmission?.results.filter((r) => !r.passed).map((r) => r.description) || [];

  return (
    <div className={`flex flex-col h-full ${panelBg}`}>
      {/* Header & Submit Button */}
      <div className={`p-3 flex items-center justify-between ${headerBg}`}>
        <div className="flex items-center space-x-2">
          <span
            className={`text-[11px] font-arcade tracking-wide ${
              isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
            }`}
          >
            TEST CHECKS
          </span>
          <span
            className={`text-[10px] font-arcade px-1.5 py-0.5 border ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800 font-bold'
                : isUnderground
                ? 'bg-[#12182b] border-[#2038ec] text-[#5c94fc]'
                : isCastle
                ? 'bg-[#1c0a0a] border-[#d82800] text-amber-300'
                : 'bg-slate-800 text-white border-slate-600'
            }`}
          >
            {tests.length}
          </span>
        </div>

        <button
          onClick={() => {
            marioSound.playJump();
            onSubmit();
          }}
          disabled={submitting}
          className="mario-btn mario-btn-green px-3 py-1.5 text-[10px] font-arcade flex items-center space-x-1.5 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3" />
          )}
          <span>{submitting ? 'CHECKING...' : 'RUN & SUBMIT'}</span>
        </button>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Status Banner */}
        {lastSubmission && (
          <div
            className={`p-3 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center justify-between ${
              lastSubmission.status === 'passed'
                ? 'bg-[#00a800] text-white'
                : 'bg-[#e52521] text-white'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="text-xl">
                {lastSubmission.status === 'passed' ? '⭐' : '💀'}
              </div>
              <div>
                <div className="font-arcade text-xs">
                  {lastSubmission.status === 'passed'
                    ? 'COURSE CLEAR! ALL PASSED'
                    : `FAILED: ${lastSubmission.passed_count}/${lastSubmission.total_count} PASSED`}
                </div>
                <div className="text-[10px] font-pixel opacity-90 flex items-center space-x-2 mt-0.5">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{lastSubmission.execution_time_ms} ms</span>
                  </span>
                  <span>•</span>
                  <span>TRY #{lastSubmission.attempt_id}</span>
                </div>
              </div>
            </div>

            {/* AI Hint Button on Failure */}
            {lastSubmission.status !== 'passed' && (
              <button
                onClick={() => {
                  marioSound.playBlockBump();
                  onAskAIHint(failedTestNames);
                }}
                className="mario-btn mario-btn-yellow px-2 py-1 text-[9px] font-arcade text-black"
              >
                <span>HINT ?</span>
              </button>
            )}
          </div>
        )}

        {/* Tests List */}
        <div className="space-y-2">
          {tests.map((test, index) => {
            const result = lastSubmission?.results.find((r) => r.test_id === test.test_id);

            return (
              <div
                key={test.test_id}
                className={`p-3 border-2 text-xs ${
                  result
                    ? result.passed
                      ? isLight
                        ? 'bg-emerald-50 border-emerald-500 shadow-[2px_2px_0px_#000]'
                        : 'bg-emerald-950/40 border-emerald-500/40 shadow-[2px_2px_0px_#000]'
                      : isLight
                      ? 'bg-rose-50 border-rose-500 shadow-[2px_2px_0px_#000]'
                      : 'bg-rose-950/40 border-rose-500/40 shadow-[2px_2px_0px_#000]'
                    : cardBase.replace('border-', 'border-2 border-').includes('border-2 border-')
                    ? `p-3 border-2 ${cardBase}`
                    : `border-2 ${cardBase}`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2">
                    <div className="mt-0.5">
                      {result ? (
                        result.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#00d800] shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[#ff4444] shrink-0" />
                        )
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-none border font-arcade flex items-center justify-center text-[9px] ${
                            isLight
                              ? 'border-slate-400 text-slate-600 font-bold'
                              : isUnderground
                              ? 'border-[#2038ec] text-[#5c94fc]'
                              : isCastle
                              ? 'border-[#d82800] text-amber-400'
                              : 'border-slate-500 text-slate-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        className={`font-pixel font-bold text-sm ${
                          result
                            ? result.passed
                              ? isLight
                                ? 'text-emerald-800'
                                : 'text-emerald-300'
                              : isLight
                              ? 'text-rose-800'
                              : 'text-rose-300'
                            : isLight
                            ? 'text-slate-900 font-semibold'
                            : isUnderground
                            ? 'text-slate-100'
                            : isCastle
                            ? 'text-amber-100'
                            : 'text-slate-100'
                        }`}
                      >
                        {test.description}
                      </div>
                      <div
                        className={`text-[10px] font-mono mt-0.5 ${
                          isLight
                            ? 'text-slate-600'
                            : isUnderground
                            ? 'text-slate-400'
                            : isCastle
                            ? 'text-orange-400/70'
                            : 'text-slate-400'
                        }`}
                      >
                        Type: {test.test_type}
                        {test.selector ? ` • Selector: ${test.selector}` : ''}
                      </div>

                      {/* Diagnostic error message if failed */}
                      {result && !result.passed && result.message && (
                        <div
                          className={`mt-2 p-2 border font-mono text-[11px] ${
                            isLight
                              ? 'bg-red-50 border-red-400 text-red-800'
                              : 'bg-black border-rose-600 text-rose-300'
                          }`}
                        >
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Solved checkmark */}
                  {result?.passed && (
                    <span className="font-arcade text-[8px] uppercase text-[#00d800] bg-black px-1.5 py-0.5 border border-[#00d800]">
                      PASS
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
