import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  CheckSquare,
  History,
  Sparkles,
  CheckCircle2,
  Eye,
  ListChecks,
  Target,
} from 'lucide-react';
import {
  Challenge,
  Difficulty,
  SubmissionResponse,
  SubmissionResultItem,
  LLMConfig,
} from '../types';
import { CodeEditor, EditorTab } from './CodeEditor';
import { LivePreview, LivePreviewHandle } from './LivePreview';
import { TestResults } from './TestResults';
import { AIHintModal } from './AIHintModal';
import { ExpectedOutputPreview } from './ExpectedOutputPreview';
import { getChallengeCategory } from './ChallengeBrowser';
import { api } from '../services/api';
import { marioSound } from '../services/soundService';
import { useTheme } from '../context/ThemeContext';

interface WorkspaceProps {
  challenge: Challenge;
  onChallengeSolved: () => void;
  llmConfig: LLMConfig | null;
  /** When true, shows a subtle loading overlay while the new challenge is fetching */
  loading?: boolean;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  challenge,
  onChallengeSolved,
  llmConfig,
  loading = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isDark = theme === 'dark';

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
    marioSound.playBlockBump();
    setActiveFailedTests(failedTests || []);
    setShowHintModal(true);
  };

  const difficultyColors: Record<Difficulty, string> = {
    easy: 'bg-[#00a800] text-white border-black',
    medium: 'bg-[#fc9838] text-black border-black',
    hard: 'bg-[#e52521] text-white border-black',
  };

  // Workspace Root Background
  const workspaceRootBg = isLight
    ? 'bg-slate-100'
    : isUnderground
    ? 'bg-[#0b0f20]'
    : isCastle
    ? 'bg-[#120404]'
    : isDark
    ? 'bg-[#0b0f17]'
    : 'bg-[#5c94fc]';

  // Left Panel Theme Classes
  const leftPanelClass = isLight
    ? 'bg-white text-slate-900 border-r-4 border-black'
    : isUnderground
    ? 'bg-[#0b0f20] text-slate-200 border-r-4 border-[#2038ec]'
    : isCastle
    ? 'bg-[#120404] text-amber-200 border-r-4 border-[#d82800]'
    : isDark
    ? 'bg-[#111726] text-slate-300 border-r-4 border-slate-700'
    : 'bg-[#111726] text-slate-300 border-r-4 border-black';

  const leftHeaderClass = isLight
    ? 'bg-slate-50 text-slate-900 border-b-2 border-black'
    : isUnderground
    ? 'bg-[#050710] text-slate-100 border-b-2 border-[#2038ec]'
    : isCastle
    ? 'bg-[#080202] text-amber-100 border-b-2 border-[#d82800]'
    : isDark
    ? 'bg-black text-white border-b-2 border-slate-700'
    : 'bg-black text-white border-b-2 border-black';

  const leftTabsBarClass = isLight
    ? 'bg-slate-100 border-b-2 border-black'
    : isUnderground
    ? 'bg-[#050710] border-b-2 border-[#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-b-2 border-[#d82800]'
    : isDark
    ? 'bg-slate-950 border-b-2 border-slate-700'
    : 'bg-slate-950 border-b-2 border-black';

  const inactiveTabClass = isLight
    ? 'text-slate-700 hover:text-black hover:bg-slate-200 border-transparent font-bold'
    : isUnderground
    ? 'text-slate-400 hover:text-white hover:bg-[#12182b] border-transparent'
    : isCastle
    ? 'text-amber-200/60 hover:text-amber-100 hover:bg-[#1c0a0a] border-transparent'
    : 'text-slate-400 hover:text-white border-transparent';

  const modeAlertClass = isLight
    ? 'bg-slate-50 border-black text-slate-800'
    : isUnderground
    ? 'bg-[#12182b] border-[#2038ec] text-slate-300'
    : isCastle
    ? 'bg-[#1c0a0a] border-[#d82800] text-amber-200'
    : 'bg-black border-slate-700 text-slate-400';

  // Right Panel Theme Classes
  const rightPanelClass = isLight
    ? 'bg-white border-l-4 border-black'
    : isUnderground
    ? 'bg-[#0b0f20] border-l-4 border-[#2038ec]'
    : isCastle
    ? 'bg-[#120404] border-l-4 border-[#d82800]'
    : isDark
    ? 'bg-[#111726] border-l-4 border-slate-700'
    : 'bg-[#111726] border-l-4 border-black';

  const rightHeaderClass = isLight
    ? 'bg-slate-100 text-slate-900 border-b-2 border-black'
    : isUnderground
    ? 'bg-[#050710] text-slate-100 border-b-2 border-[#2038ec]'
    : isCastle
    ? 'bg-[#080202] text-amber-100 border-b-2 border-[#d82800]'
    : isDark
    ? 'bg-black text-white border-b-2 border-slate-700'
    : 'bg-black text-white border-b-2 border-black';

  const rightInactiveBtnClass = isLight
    ? 'bg-white text-slate-700 border-slate-300 hover:text-black hover:border-black font-bold'
    : isUnderground
    ? 'bg-[#12182b] text-slate-300 border-[#2038ec] hover:text-white'
    : isCastle
    ? 'bg-[#1c0a0a] text-amber-200 border-[#d82800] hover:text-amber-100'
    : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white';

  return (
    <div className={`h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden relative ${workspaceRootBg}`}>
      {/* Subtle overlay when switching challenges */}
      {loading && (
        <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center pointer-events-none">
          <div className="flex items-center space-x-2 text-white text-xs font-arcade bg-black px-4 py-2 border-2 border-white shadow-[4px_4px_0px_#000]">
            <span className="animate-spin text-[#fcd800]">🪙</span>
            <span>WARPING TO STAGE...</span>
          </div>
        </div>
      )}

      {/* ================= LEFT PANEL (Challenge Description & Specs) ================= */}
      <div className={`w-full md:w-[32%] lg:w-[28%] flex flex-col h-full shrink-0 ${leftPanelClass}`}>
        {/* Challenge Header */}
        <div className={`p-3 space-y-2 ${leftHeaderClass}`}>
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            {/* Category badge */}
            <span className="text-[9px] font-arcade px-2 py-0.5 bg-[#0050d0] text-white border border-white">
              {getChallengeCategory(challenge).toUpperCase()}
            </span>

            <span className={`text-[9px] font-arcade px-2 py-0.5 border ${difficultyColors[challenge.difficulty]}`}>
              {challenge.difficulty === 'easy' ? 'WORLD 1' : challenge.difficulty === 'medium' ? 'WORLD 2' : 'BOWSER'}
            </span>
            <span
              className={`text-[9px] font-arcade px-2 py-0.5 border ${
                isLight
                  ? 'bg-slate-200 text-slate-800 border-slate-400 font-bold'
                  : isUnderground
                  ? 'bg-[#12182b] text-[#5c94fc] border-[#2038ec]'
                  : isCastle
                  ? 'bg-[#1c0a0a] text-amber-300 border-[#d82800]'
                  : 'bg-slate-800 text-slate-300 border-slate-600'
              }`}
            >
              {challenge.estimated_minutes}M
            </span>
          </div>

          <h2
            className={`font-arcade text-xs leading-snug ${
              isLight
                ? 'text-slate-950 font-bold'
                : isCastle
                ? 'text-amber-300 drop-shadow-[1px_1px_0px_#d82800]'
                : isUnderground
                ? 'text-[#5c94fc] drop-shadow-[1px_1px_0px_#2038ec]'
                : 'text-[#fcd800] drop-shadow-[1px_1px_0px_#b84418]'
            }`}
          >
            {challenge.title}
          </h2>

          {/* Topics tags */}
          <div className="flex flex-wrap gap-1">
            {challenge.topics.map((t) => (
              <span
                key={t}
                className={`text-[9px] font-arcade px-1.5 py-0.5 border ${
                  isLight
                    ? 'bg-white text-slate-700 border-slate-300 font-bold'
                    : isUnderground
                    ? 'bg-[#12182b] text-slate-300 border-[#2038ec]/50'
                    : isCastle
                    ? 'bg-[#1c0a0a] text-amber-300 border-[#d82800]/50'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`h-10 px-2 flex items-center space-x-1 overflow-x-auto no-scrollbar ${leftTabsBarClass}`}>
          <button
            onClick={() => {
              marioSound.playPipe();
              setLeftTab('specs');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade shrink-0 transition-all border ${
              leftTab === 'specs'
                ? 'bg-[#e52521] text-white border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            SPECS
          </button>
          <button
            onClick={() => {
              marioSound.playPipe();
              setLeftTab('expected');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade shrink-0 transition-all border ${
              leftTab === 'expected'
                ? 'bg-[#00a800] text-white border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            TARGET
          </button>
          <button
            onClick={() => {
              marioSound.playPipe();
              setLeftTab('requirements');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade shrink-0 transition-all border ${
              leftTab === 'requirements'
                ? 'bg-[#0050d0] text-white border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            RULES
          </button>
          <button
            onClick={() => {
              marioSound.playPipe();
              setLeftTab('history');
            }}
            className={`px-2.5 py-1 text-[9px] font-arcade shrink-0 transition-all border ${
              leftTab === 'history'
                ? 'bg-[#fc9838] text-black border-black shadow-[2px_2px_0px_#000]'
                : inactiveTabClass
            }`}
          >
            TRIES ({attempts.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div
          className={`flex-1 overflow-y-auto p-3 space-y-4 text-xs leading-relaxed ${
            isLight
              ? 'text-slate-800'
              : isCastle
              ? 'text-amber-200/90'
              : 'text-slate-300'
          }`}
        >
          {leftTab === 'specs' && (
            <div className="space-y-4 font-pixel text-sm">
              <div>
                <h4
                  className={`font-arcade text-[10px] uppercase tracking-wider mb-2 ${
                    isLight
                      ? 'text-slate-900 font-bold'
                      : isCastle
                      ? 'text-amber-300'
                      : isUnderground
                      ? 'text-[#5c94fc]'
                      : 'text-[#fcd800]'
                  }`}
                >
                  MISSION OBJECTIVE
                </h4>
                <p
                  className={`whitespace-pre-line leading-relaxed ${
                    isLight
                      ? 'text-slate-800 font-semibold'
                      : isCastle
                      ? 'text-amber-100'
                      : 'text-slate-200'
                  }`}
                >
                  {challenge.description}
                </p>
              </div>

              {/* Mode Guidance Alert */}
              <div className={`p-3 border-2 space-y-1 ${modeAlertClass}`}>
                <span
                  className={`font-arcade text-[9px] uppercase tracking-wide block ${
                    isLight ? 'text-[#008000] font-bold' : 'text-[#00d800]'
                  }`}
                >
                  MODE: {challenge.mode.replace('_', ' ')}
                </span>
                <p
                  className={`text-xs font-pixel ${
                    isLight
                      ? 'text-slate-700 font-medium'
                      : isCastle
                      ? 'text-amber-200/80'
                      : 'text-slate-400'
                  }`}
                >
                  {challenge.mode === 'fill_blanks'
                    ? 'Inspect comments marked "TODO" in editor tabs and fill in missing code.'
                    : challenge.mode === 'fix_broken'
                    ? 'Starter code has subtle bugs. Fix layout or event glitches to clear the course.'
                    : challenge.mode === 'recreate_page'
                    ? 'Inspect TARGET output and recreate the layout pixel-for-pixel.'
                    : 'Construct component to pass all automated test assertions.'}
                </p>
              </div>

              {/* Ask AI Tutor CTA */}
              <button
                onClick={() => handleOpenAIHint()}
                className="w-full mario-btn mario-btn-yellow py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-2 text-black"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>TOAD'S AI HINT [?]</span>
              </button>

              {/* Expected Output in Left Empty Space */}
              <div className={`pt-3 border-t-2 ${isUnderground ? 'border-[#2038ec]/50' : isCastle ? 'border-[#d82800]/50' : 'border-black'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center space-x-1.5 font-arcade text-[9px] ${
                      isLight ? 'text-[#008000] font-bold' : 'text-[#00d800]'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>TARGET OUTPUT</span>
                  </div>
                  <button
                    onClick={() => setLeftTab('expected')}
                    className={`text-[9px] font-arcade hover:underline ${
                      isLight ? 'text-blue-700 font-bold' : 'text-[#fcd800]'
                    }`}
                  >
                    ZOOM
                  </button>
                </div>
                <div className="h-44 border-2 border-black overflow-hidden bg-white">
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
                <h4
                  className={`font-arcade text-[10px] flex items-center space-x-1.5 ${
                    isLight ? 'text-[#008000] font-bold' : 'text-[#00d800]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>TARGET GOAL</span>
                </h4>
                <span className="font-arcade text-[8px] px-1.5 py-0.5 bg-[#00a800] text-white border border-black">
                  REFERENCE
                </span>
              </div>
              <p className={`font-pixel text-xs ${isLight ? 'text-slate-600' : isCastle ? 'text-amber-200/70' : 'text-slate-400'}`}>
                Match this layout and behavior to pass all tests and clear the stage.
              </p>
              <div className="flex-1 min-h-[360px] border-2 border-black">
                <ExpectedOutputPreview
                  solutionCode={challenge.solution_code}
                  fallbackCode={challenge.starter_code}
                  title={challenge.title}
                />
              </div>
            </div>
          )}

          {leftTab === 'requirements' && (
            <div className="space-y-3 font-pixel text-sm">
              <h4
                className={`font-arcade text-[10px] ${
                  isLight
                    ? 'text-slate-900 font-bold'
                    : isCastle
                    ? 'text-amber-300'
                    : isUnderground
                    ? 'text-[#5c94fc]'
                    : 'text-[#fcd800]'
                }`}
              >
                LEVEL REQUIREMENTS
              </h4>
              <ul className="space-y-2">
                {challenge.requirements.map((req, i) => (
                  <li
                    key={i}
                    className={`flex items-start space-x-2 p-2 border ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-800'
                        : isUnderground
                        ? 'bg-[#12182b] border-[#2038ec]/50 text-slate-200'
                        : isCastle
                        ? 'bg-[#1c0a0a] border-[#d82800]/50 text-amber-100'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <span
                      className={`font-arcade text-[9px] shrink-0 mt-0.5 ${
                        isLight ? 'text-[#008000] font-bold' : 'text-[#00d800]'
                      }`}
                    >
                      [{i + 1}]
                    </span>
                    <span className={isLight ? 'text-slate-800 font-medium' : isCastle ? 'text-amber-100' : 'text-slate-200'}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {leftTab === 'history' && (
            <div className="space-y-2 font-pixel">
              <h4
                className={`font-arcade text-[10px] ${
                  isLight ? 'text-slate-900 font-bold' : isCastle ? 'text-amber-300' : 'text-[#fcd800]'
                }`}
              >
                PAST RUNS
              </h4>
              {attempts.length === 0 ? (
                <div className={`italic py-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                  No submissions yet for this level.
                </div>
              ) : (
                attempts.map((att) => (
                  <div
                    key={att.attempt_id}
                    className={`p-2.5 border-2 space-y-1 ${
                      isLight
                        ? 'bg-slate-50 border-black text-slate-800'
                        : isUnderground
                        ? 'bg-[#12182b] border-[#2038ec] text-slate-200'
                        : isCastle
                        ? 'bg-[#1c0a0a] border-[#d82800] text-amber-200'
                        : 'bg-black border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-arcade text-[9px] px-1.5 py-0.5 border ${
                          att.status === 'passed'
                            ? 'bg-[#00a800] text-white border-black'
                            : 'bg-[#e52521] text-white border-black'
                        }`}
                      >
                        {att.status === 'passed' ? 'CLEAR' : 'FAIL'}
                      </span>
                      <span className={`font-arcade text-[9px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {att.execution_time_ms}ms
                      </span>
                    </div>
                    <div className={`text-xs ${isLight ? 'text-slate-700 font-medium' : isCastle ? 'text-amber-100' : 'text-slate-300'}`}>
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
      <div className={`w-full md:w-[35%] lg:w-[34%] flex flex-col h-full shrink-0 ${rightPanelClass}`}>
        {/* Right Tab Switcher */}
        <div className={`h-11 px-3 flex items-center justify-between select-none ${rightHeaderClass}`}>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => {
                marioSound.playPipe();
                setRightTab('preview');
              }}
              className={`px-3 py-1 text-[10px] font-arcade border-2 transition-all flex items-center space-x-1 ${
                rightTab === 'preview'
                  ? 'bg-[#00a800] text-white border-black shadow-[2px_2px_0px_#000]'
                  : rightInactiveBtnClass
              }`}
            >
              <Eye className="w-3 h-3 text-[#fcd800]" />
              <span>SANDBOX</span>
            </button>
            <button
              onClick={() => {
                marioSound.playPipe();
                setRightTab('tests');
              }}
              className={`px-3 py-1 text-[10px] font-arcade border-2 transition-all flex items-center space-x-1 ${
                rightTab === 'tests'
                  ? 'bg-[#e52521] text-white border-black shadow-[2px_2px_0px_#000]'
                  : rightInactiveBtnClass
              }`}
            >
              <ListChecks className={`w-3 h-3 ${isLight ? 'text-blue-600' : isUnderground ? 'text-[#38bdf8]' : 'text-[#38bdf8]'}`} />
              <span>TESTS ({challenge.tests.length})</span>
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
