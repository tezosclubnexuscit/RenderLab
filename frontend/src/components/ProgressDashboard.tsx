import React from 'react';
import {
  CheckCircle2,
  Flame,
  Award,
  Layers,
  BarChart2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { UserProgress, ChallengeListItem } from '../types';

interface ProgressDashboardProps {
  progress: UserProgress | null;
  challenges: ChallengeListItem[];
  onSelectChallenge: (id: string) => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  challenges,
  onSelectChallenge,
}) => {
  if (!progress) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400">
        Loading analytics...
      </div>
    );
  }

  const { difficulty } = progress;

  const getPercent = (solved: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((solved / total) * 100);
  };

  const solvedChallenges = challenges.filter((c) =>
    progress.solved_challenge_ids.includes(c.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Solved Card */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {progress.solved_count}
              <span className="text-sm font-normal text-slate-500">
                /{progress.total_challenges}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Challenges Solved</div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {progress.completion_rate}%
            </div>
            <div className="text-xs text-slate-400 font-medium">Completion Rate</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {progress.accuracy_percent}%
            </div>
            <div className="text-xs text-slate-400 font-medium">Test Accuracy</div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {progress.total_attempts}
            </div>
            <div className="text-xs text-slate-400 font-medium">Total Attempts</div>
          </div>
        </div>
      </div>

      {/* Difficulty Breakdown Panel */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span>Difficulty Progress Breakdown</span>
        </h2>

        <div className="space-y-4">
          {/* Easy */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-emerald-400">Easy</span>
              <span className="text-slate-400 font-mono">
                {difficulty.easy.solved} / {difficulty.easy.total} (
                {getPercent(difficulty.easy.solved, difficulty.easy.total)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${getPercent(difficulty.easy.solved, difficulty.easy.total)}%`,
                }}
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Medium */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-amber-400">Medium</span>
              <span className="text-slate-400 font-mono">
                {difficulty.medium.solved} / {difficulty.medium.total} (
                {getPercent(difficulty.medium.solved, difficulty.medium.total)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${getPercent(difficulty.medium.solved, difficulty.medium.total)}%`,
                }}
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Hard */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-rose-400">Hard</span>
              <span className="text-slate-400 font-mono">
                {difficulty.hard.solved} / {difficulty.hard.total} (
                {getPercent(difficulty.hard.solved, difficulty.hard.total)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                style={{
                  width: `${getPercent(difficulty.hard.solved, difficulty.hard.total)}%`,
                }}
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Completed Challenges List */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Solved Challenges ({solvedChallenges.length})</span>
        </h2>

        {solvedChallenges.length === 0 ? (
          <div className="text-xs text-slate-500 italic py-4">
            No completed challenges yet. Pick a challenge and submit your solution!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {solvedChallenges.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onSelectChallenge(ch.id)}
                className="py-3 flex items-center justify-between hover:bg-slate-850/50 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">{ch.title}</div>
                    <div className="text-[11px] text-slate-500 capitalize">
                      {ch.difficulty} • {ch.mode.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                  <span>Revisit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
