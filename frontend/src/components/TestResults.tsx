import React from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Sparkles,
  HelpCircle,
  Clock,
  Check,
} from 'lucide-react';
import { TestCase, SubmissionResponse, SubmissionResultItem } from '../types';

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
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#38bdf8', '#fbbf24', '#a855f7'],
    });
  };

  React.useEffect(() => {
    if (lastSubmission && lastSubmission.status === 'passed') {
      triggerConfetti();
    }
  }, [lastSubmission]);

  const failedTestNames =
    lastSubmission?.results.filter((r) => !r.passed).map((r) => r.description) || [];

  return (
    <div className="flex flex-col h-full bg-[#111726]">
      {/* Header & Submit Button */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Automated Checks
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {tests.length} tests
          </span>
        </div>

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>{submitting ? 'Running checks...' : 'Submit Solution'}</span>
        </button>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Status Banner */}
        {lastSubmission && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              lastSubmission.status === 'passed'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {lastSubmission.status === 'passed' ? (
                <div className="p-1.5 rounded-lg bg-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-rose-500/20">
                  <XCircle className="w-5 h-5 text-rose-400" />
                </div>
              )}
              <div>
                <div className="font-bold text-sm">
                  {lastSubmission.status === 'passed'
                    ? 'Accepted! All checks passed 🎉'
                    : `${lastSubmission.passed_count}/${lastSubmission.total_count} Checks Passed`}
                </div>
                <div className="text-[11px] opacity-75 flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{lastSubmission.execution_time_ms} ms</span>
                  </span>
                  <span>•</span>
                  <span>Attempt ID: #{lastSubmission.attempt_id}</span>
                </div>
              </div>
            </div>

            {/* AI Hint Button on Failure */}
            {lastSubmission.status !== 'passed' && (
              <button
                onClick={() => onAskAIHint(failedTestNames)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ask AI Tutor</span>
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
                className={`p-3 rounded-lg border text-xs transition-colors ${
                  result
                    ? result.passed
                      ? 'bg-slate-900/50 border-emerald-500/20'
                      : 'bg-slate-900/80 border-rose-500/30'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start space-x-2.5">
                    {/* Status icon */}
                    <div className="mt-0.5">
                      {result ? (
                        result.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                          {index + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="font-semibold text-slate-200">
                        {test.description}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Type: {test.test_type}
                        {test.selector ? ` • Selector: ${test.selector}` : ''}
                      </div>

                      {/* Diagnostic error message if failed */}
                      {result && !result.passed && result.message && (
                        <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-900/50 text-rose-300 font-mono text-[11px]">
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Solved checkmark */}
                  {result?.passed && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Passed
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
