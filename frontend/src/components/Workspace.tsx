import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckSquare,
  History,
  Lightbulb,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  ListChecks,
  Code2,
  ChevronRight,
  ChevronLeft,
  Target,
} from 'lucide-react';
import {
  Challenge,
  Difficulty,
  ChallengeMode,
  SubmissionResponse,
  SubmissionResultItem,
  LLMConfig,
} from '../types';
import { CodeEditor, EditorTab } from './CodeEditor';
import { LivePreview, LivePreviewHandle } from './LivePreview';
import { TestResults } from './TestResults';
import { AIHintModal } from './AIHintModal';
import { ExpectedOutputPreview } from './ExpectedOutputPreview';
import { api } from '../services/api';

interface WorkspaceProps {
  challenge: Challenge;
  onChallengeSolved: () => void;
  llmConfig: LLMConfig | null;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  challenge,
  onChallengeSolved,
  llmConfig,
}) => {
  // Code states
  const [html, setHtml] = useState(challenge.starter_code.html || '');
  const [css, setCss] = useState(challenge.starter_code.css || '');
  const [javascript, setJavascript] = useState(challenge.starter_code.javascript || '');

  // UI tabs
  const [leftTab, setLeftTab] = useState<'specs' | 'expected' | 'requirements' | 'history'>('specs');
  const [rightTab, setRightTab] = useState<'preview' | 'tests'>('preview');

  // Preview & test runner
  const previewRef = useRef<LivePreviewHandle>(null);
  const [runTrigger, setRunTrigger] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<SubmissionResponse | null>(null);
  const [attempts, setAttempts] = useState<SubmissionResponse[]>([]);

  // AI Hint Modal
  const [showHintModal, setShowHintModal] = useState(false);
  const [activeFailedTests, setActiveFailedTests] = useState<string[]>([]);

  // Reset when challenge changes
  useEffect(() => {
    setHtml(challenge.starter_code.html || '');
    setCss(challenge.starter_code.css || '');
    setJavascript(challenge.starter_code.javascript || '');
    setLastSubmission(null);
    setRunTrigger((prev) => prev + 1);
    loadHistory();
  }, [challenge.id]);

  const loadHistory = async () => {
    try {
      const past = await api.getAttempts(challenge.id);
      setAttempts(past);
    } catch (e) {}
  };

  const handleCodeChange = (tab: EditorTab, value: string) => {
    if (tab === 'html') setHtml(value);
    else if (tab === 'css') setCss(value);
    else if (tab === 'javascript') setJavascript(value);
  };

  const handleResetStarter = () => {
    setHtml(challenge.starter_code.html || '');
    setCss(challenge.starter_code.css || '');
    setJavascript(challenge.starter_code.javascript || '');
    setRunTrigger((prev) => prev + 1);
  };

  const handleRunPreview = () => {
    setRunTrigger((prev) => prev + 1);
    setRightTab('preview');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setRightTab('tests');

    try {
      // 1. Run checks in the live sandboxed iframe if available
      let clientResults: SubmissionResultItem[] | undefined;
      if (previewRef.current) {
        try {
          clientResults = await previewRef.current.runTests(challenge.tests);
        } catch (e) {
          console.warn('Sandbox evaluation error:', e);
        }
      }

      // 2. Submit to backend API for verification, persistence, and attempt recording
      const response = await api.submitSolution({
        challenge_id: challenge.id,
        code_html: html,
        code_css: css,
        code_js: javascript,
        results_override: clientResults,
      });

      setLastSubmission(response);
      setAttempts((prev) => [response, ...prev]);

      if (response.status === 'passed') {
        onChallengeSolved();
      }
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenAIHint = (failedTests?: string[]) => {
    setActiveFailedTests(failedTests || []);
    setShowHintModal(true);
  };

  const difficultyColors: Record<Difficulty, string> = {
    easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col md:flex-row overflow-hidden bg-[#0b0f17]">
      {/* ================= LEFT PANEL (Challenge Description & Specs) ================= */}
      <div className="w-full md:w-[32%] lg:w-[28%] border-r border-slate-800 flex flex-col bg-[#111726] h-full shrink-0">
        {/* Challenge Header */}
        <div className="p-4 border-b border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                difficultyColors[challenge.difficulty]
              }`}
            >
              {challenge.difficulty}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 capitalize">
              {challenge.mode.replace('_', ' ')}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              ~{challenge.estimated_minutes} min
            </span>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
            {challenge.title}
          </h2>

          {/* Topics tags */}
          <div className="flex flex-wrap gap-1">
            {challenge.topics.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="h-9 bg-slate-900/80 border-b border-slate-800 px-3 flex items-center space-x-1">
          <button
            onClick={() => setLeftTab('specs')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
              leftTab === 'specs'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Description</span>
          </button>
          <button
            onClick={() => setLeftTab('expected')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
              leftTab === 'expected'
                ? 'bg-slate-800 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Expected Output</span>
          </button>
          <button
            onClick={() => setLeftTab('requirements')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
              leftTab === 'requirements'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Requirements</span>
          </button>
          <button
            onClick={() => setLeftTab('history')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
              leftTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({attempts.length})</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-slate-300">
          {leftTab === 'specs' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Task Overview
                </h4>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                  {challenge.description}
                </p>
              </div>

              {/* Mode Guidance Alert */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-emerald-400 text-[11px] uppercase tracking-wide">
                  Challenge Mode: {challenge.mode.replace('_', ' ')}
                </span>
                <p className="text-[11px] text-slate-400">
                  {challenge.mode === 'fill_blanks'
                    ? 'Inspect the comments marked with "TODO" in the editor tabs and complete the missing styling or logic.'
                    : challenge.mode === 'fix_broken'
                    ? 'The starter code contains one or more subtle bugs. Diagnose why the behavior fails and correct it.'
                    : 'Construct the component according to the requirements and run checks to verify accuracy.'}
                </p>
              </div>

              {/* Ask AI Tutor CTA */}
              <button
                onClick={() => handleOpenAIHint()}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask AI Tutor for a Hint</span>
              </button>

              {/* Expected Output in Left Empty Space */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5" />
                    <span>Expected Target Output</span>
                  </div>
                  <button
                    onClick={() => setLeftTab('expected')}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 transition-colors underline"
                  >
                    Expand view
                  </button>
                </div>
                <div className="h-44 rounded-lg overflow-hidden border border-slate-800">
                  <ExpectedOutputPreview
                    solutionCode={challenge.solution_code}
                    fallbackCode={challenge.starter_code}
                    title={challenge.title}
                  />
                </div>
              </div>
            </div>
          )}

          {leftTab === 'expected' && (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Expected Target Output</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Reference Solution
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                This is the completed target design. Your live code in the editor should match this result.
              </p>
              <div className="flex-1 min-h-[360px]">
                <ExpectedOutputPreview
                  solutionCode={challenge.solution_code}
                  fallbackCode={challenge.starter_code}
                  title={challenge.title}
                />
              </div>
            </div>
          )}

          {leftTab === 'requirements' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                  Checklist Requirements
                </h4>
                <div className="space-y-2">
                  {challenge.requirements.map((req, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-start space-x-2 text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {challenge.hints && challenge.hints.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                    Clues & Tips
                  </h4>
                  <div className="space-y-1.5">
                    {challenge.hints.map((hint, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 text-[11px]"
                      >
                        💡 {hint}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {leftTab === 'history' && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
                Previous Attempts
              </h4>
              {attempts.length === 0 ? (
                <div className="text-slate-500 italic py-4">No submissions yet for this challenge.</div>
              ) : (
                attempts.map((att) => (
                  <div
                    key={att.attempt_id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                          att.status === 'passed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {att.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {att.execution_time_ms} ms
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Passed: {att.passed_count} / {att.total_count} checks
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= CENTER PANEL (Code Editor) ================= */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <CodeEditor
          html={html}
          css={css}
          javascript={javascript}
          onCodeChange={handleCodeChange}
          onResetStarter={handleResetStarter}
          onRunPreview={handleRunPreview}
        />
      </div>

      {/* ================= RIGHT PANEL (Live Preview & Test Results) ================= */}
      <div className="w-full md:w-[35%] lg:w-[34%] border-l border-slate-800 flex flex-col bg-[#111726] h-full shrink-0">
        {/* Right Tab Switcher */}
        <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setRightTab('preview')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                rightTab === 'preview'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Preview</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono border border-slate-700">
                template-based
              </span>
            </button>
            <button
              onClick={() => setRightTab('tests')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                rightTab === 'tests'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5 text-cyan-400" />
              <span>Tests ({challenge.tests.length})</span>
              {lastSubmission?.status === 'passed' && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
            </button>
          </div>
        </div>

        {/* Tab View */}
        <div className="flex-1 h-full overflow-hidden relative">
          <div className={`h-full ${rightTab === 'preview' ? 'block' : 'hidden'}`}>
            <LivePreview
              ref={previewRef}
              html={html}
              css={css}
              javascript={javascript}
              runTrigger={runTrigger}
            />
          </div>

          <div className={`h-full ${rightTab === 'tests' ? 'block' : 'hidden'}`}>
            <TestResults
              tests={challenge.tests}
              lastSubmission={lastSubmission}
              submitting={submitting}
              onSubmit={handleSubmit}
              onAskAIHint={handleOpenAIHint}
            />
          </div>
        </div>
      </div>

      {/* AI Hint Drawer / Modal */}
      <AIHintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        challenge={challenge}
        html={html}
        css={css}
        javascript={javascript}
        failedTests={activeFailedTests}
        llmConfig={llmConfig}
      />
    </div>
  );
};
