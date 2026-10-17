import React from 'react';
import {
  Code2,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  CheckCircle2,
  Layers,
  Cpu,
  Monitor,
  Flame,
  Check,
  Zap,
} from 'lucide-react';
import { ChallengeListItem } from '../types';
import { getChallengeCategory } from './ChallengeBrowser';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onStartPracticing: () => void;
  onExploreChallenges: () => void;
  onOpenGenerator: () => void;
  onSelectChallenge: (id: string) => void;
  challenges: ChallengeListItem[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPracticing,
  onExploreChallenges,
  onOpenGenerator,
  onSelectChallenge,
  challenges,
}) => {
  const { theme } = useTheme();
  const featuredChallenges = challenges.slice(0, 3);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'hard':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'fill_blanks':
        return 'Fill In Blanks';
      case 'fix_broken':
        return 'Fix Bugs';
      case 'build_component':
        return 'Build Component';
      case 'recreate_page':
        return 'Recreate Page';
      default:
        return mode;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ================= HERO SECTION ================= */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Ambient background glow */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] blur-3xl rounded-full pointer-events-none -z-10 ${
            theme === 'light'
              ? 'bg-gradient-to-tr from-emerald-400/10 via-indigo-400/10 to-cyan-400/10'
              : 'bg-gradient-to-tr from-emerald-500/15 via-indigo-500/15 to-cyan-500/15'
          }`}
        />

        {/* Shimmer Pill Badge */}
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 shadow-sm border transition-colors ${
            theme === 'light'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Interactive Frontend Practice & Automated Evaluation</span>
        </div>

        {/* Hero Title */}
        <h1
          className={`text-4xl md:text-6xl font-black tracking-tight max-w-4xl leading-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}
        >
          Master Real-World{' '}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Frontend Code
          </span>{' '}
          By Doing.
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-5 text-sm md:text-base max-w-2xl leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          The LeetCode-style environment tailored for HTML, CSS, and modern JavaScript.
          Write solutions in a full Monaco IDE, test in real-time sandboxes, and compare against reference designs.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartPracticing}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 !text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="!text-slate-950">Start Practicing</span>
            <ArrowRight className="w-4 h-4 !text-slate-950" />
          </button>

          <button
            onClick={onExploreChallenges}
            className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4 text-cyan-500" />
            <span>Explore Challenges</span>
          </button>

          <button
            onClick={onOpenGenerator}
            className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 shadow-sm'
                : 'bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Generator</span>
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div
          className={`mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8 border-t ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800/80'
          }`}
        >
          <div className="flex flex-col items-center">
            <span
              className={`text-2xl font-black ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              300+
            </span>
            <span
              className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Curated Challenges
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-2xl font-black ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              3
            </span>
            <span
              className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Core Categories (HTML, CSS, JS)
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-2xl font-black ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              100%
            </span>
            <span
              className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              In-Browser Sandbox
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span
              className={`text-2xl font-black ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Offline
            </span>
            <span
              className={`text-xs mt-0.5 ${
                theme === 'light' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Local AI Powered
            </span>
          </div>
        </div>
      </section>

      {/* ================= FEATURED CHALLENGES ================= */}
      {featuredChallenges.length > 0 && (
        <section
          className={`px-6 py-12 max-w-6xl mx-auto border-t ${
            theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className={`text-lg font-bold flex items-center space-x-2 ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Popular Starter Challenges</span>
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Pick a challenge to immediately dive into the workspace.
              </p>
            </div>
            <button
              onClick={onExploreChallenges}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredChallenges.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onSelectChallenge(ch.id)}
                className={`group p-5 rounded-xl transition-all cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md border ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${
                          getChallengeCategory(ch) === 'html'
                            ? 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                            : getChallengeCategory(ch) === 'css'
                            ? 'bg-sky-500/15 text-sky-500 border-sky-500/30'
                            : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                        }`}
                      >
                        {getChallengeCategory(ch).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getDifficultyColor(
                          ch.difficulty
                        )}`}
                      >
                        {ch.difficulty === 'easy' ? 'Beginner' : ch.difficulty === 'medium' ? 'Intermediate' : 'Advanced'}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] ${
                        theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      ~{ch.estimated_minutes} mins
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-semibold transition-colors ${
                      theme === 'light'
                        ? 'text-slate-900 group-hover:text-emerald-600'
                        : 'text-white group-hover:text-emerald-400'
                    }`}
                  >
                    {ch.title}
                  </h3>
                  <p
                    className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                      theme === 'light' ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {ch.description}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3 border-t flex items-center justify-between text-xs ${
                    theme === 'light' ? 'border-slate-100' : 'border-slate-800'
                  }`}
                >
                  <span
                    className={`text-[11px] ${
                      theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    {getModeLabel(ch.mode)}
                  </span>
                  <span className="text-emerald-500 font-medium group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                    <span>Solve</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= KEY CAPABILITIES ================= */}
      <section
        className={`px-6 py-16 max-w-6xl mx-auto border-t ${
          theme === 'light' ? 'border-slate-200' : 'border-slate-800/60'
        }`}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            className={`text-2xl font-bold ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Designed For Frontend Mastery
          </h2>
          <p
            className={`text-xs mt-2 leading-relaxed ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Everything you need to level up your DOM manipulation, CSS layout skills, and JavaScript events in one cohesive workbench.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1 */}
          <div
            className={`p-5 rounded-xl border flex flex-col ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800/80'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4">
              <Code2 className="w-5 h-5" />
            </div>
            <h3
              className={`text-sm font-bold mb-1.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              3-Panel Monaco IDE
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Full VS Code Monaco editor with multi-tab support for HTML, CSS, and JS with syntax formatting.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className={`p-5 rounded-xl border flex flex-col ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800/80'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5" />
            </div>
            <h3
              className={`text-sm font-bold mb-1.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Visual Comparison
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Compare your live solution side-by-side against the expected reference design to achieve pixel-perfection.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className={`p-5 rounded-xl border flex flex-col ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800/80'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3
              className={`text-sm font-bold mb-1.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Automated Tests
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Instant in-browser assertions verifying DOM structure, computed CSS rules, and user interaction handlers.
            </p>
          </div>

          {/* Feature 4 */}
          <div
            className={`p-5 rounded-xl border flex flex-col ${
              theme === 'light'
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-900/40 border-slate-800/80'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3
              className={`text-sm font-bold mb-1.5 ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}
            >
              Dual-LLM AI Tutor
            </h3>
            <p
              className={`text-xs leading-relaxed ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Offline with local Ollama or connected to Cloud APIs (Gemini, Groq, OpenAI) for socratic hints and challenge generation.
            </p>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="px-6 py-12 max-w-4xl mx-auto mb-12 text-center">
        <div
          className={`p-8 rounded-2xl border shadow-xl flex flex-col items-center ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-50 to-white border-slate-200 shadow-slate-200/50'
              : 'bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-slate-800'
          }`}
        >
          <Zap className="w-8 h-8 text-amber-500 mb-3" />
          <h2
            className={`text-xl md:text-2xl font-bold ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Ready to test your frontend skills?
          </h2>
          <p
            className={`text-xs md:text-sm mt-2 max-w-md ${
              theme === 'light' ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            Jump directly into the workspace, solve real challenges, and track your progress.
          </p>
          <button
            onClick={onStartPracticing}
            className="mt-6 flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 !text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <span className="!text-slate-950">Launch Practice Workspace</span>
            <ArrowRight className="w-4 h-4 !text-slate-950" />
          </button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        className={`px-6 py-8 border-t text-center text-xs ${
          theme === 'light'
            ? 'border-slate-200 text-slate-500'
            : 'border-slate-800/60 text-slate-500'
        }`}
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Code2 className="w-4 h-4 text-emerald-500" />
          <span
            className={`font-semibold ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}
          >
            RenderLab
          </span>
          <span>—</span>
          <span>Frontend Engineering Practice Suite</span>
        </div>
        <p>Built for engineers mastering HTML, CSS, and modern JavaScript.</p>
      </footer>
    </div>
  );
};
