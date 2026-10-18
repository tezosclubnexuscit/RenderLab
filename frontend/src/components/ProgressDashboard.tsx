import React from 'react';
import {
  ArrowRight,
} from 'lucide-react';
import { UserProgress, ChallengeListItem } from '../types';
import { marioSound } from '../services/soundService';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isDark = theme === 'dark';

  if (!progress) {
    return (
      <div className={`max-w-4xl mx-auto px-6 py-12 text-center font-arcade text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>
        LOADING MARIO STATS...
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

  const getMarioRank = (solved: number) => {
    if (solved >= 10) return { title: 'INVINCIBLE STAR MARIO', icon: '⭐', color: 'text-[#fcd800]' };
    if (solved >= 6) return { title: 'FIRE MARIO', icon: '🔥', color: 'text-[#e52521]' };
    if (solved >= 3) return { title: 'SUPER MARIO', icon: '🍄', color: 'text-[#00d800]' };
    return { title: 'SMALL MARIO', icon: '🧢', color: isLight ? 'text-slate-900' : 'text-white' };
  };

  const rank = getMarioRank(progress.solved_count);
  const totalCoins = progress.solved_count * 5 + 3;

  // Header Player 1 card
  const playerCardClass = isLight
    ? 'bg-white border-4 border-black p-6 shadow-[6px_6px_0px_#000] text-slate-900'
    : isUnderground
    ? 'bg-[#050710] border-4 border-[#2038ec] p-6 shadow-[6px_6px_0px_#2038ec] text-white'
    : isCastle
    ? 'bg-[#080202] border-4 border-[#d82800] p-6 shadow-[6px_6px_0px_#d82800] text-amber-100'
    : 'bg-[#000000] border-4 border-white p-6 shadow-[6px_6px_0px_#000] text-white';

  // Stat cards
  const statCardClass = isLight
    ? 'bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] p-4 shadow-[4px_4px_0px_#050710]'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] p-4 shadow-[4px_4px_0px_#080202]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 p-4 shadow-[4px_4px_0px_#000]'
    : 'bg-white border-4 border-black p-4 shadow-[4px_4px_0px_#000]';

  // Big panels (breakdown & hall of fame)
  const panelClass = isLight
    ? 'bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] p-6 shadow-[5px_5px_0px_#050710] text-slate-100'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] p-6 shadow-[5px_5px_0px_#080202] text-amber-100'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 p-6 shadow-[5px_5px_0px_#000] text-slate-100'
    : 'bg-white border-4 border-black p-6 shadow-[5px_5px_0px_#000]';

  // Cleared course item
  const courseItemClass = isLight
    ? 'bg-slate-50 border-2 border-black text-slate-900 hover:bg-yellow-50'
    : isUnderground
    ? 'bg-[#050710] border-2 border-[#2038ec] text-slate-100 hover:bg-[#1a2340]'
    : isCastle
    ? 'bg-[#080202] border-2 border-[#d82800] text-amber-100 hover:bg-[#280f0f]'
    : isDark
    ? 'bg-slate-900 border-2 border-slate-700 text-slate-100 hover:bg-slate-800'
    : 'bg-slate-50 border-2 border-black text-slate-900 hover:bg-yellow-50';

  const statNumClass = isLight
    ? 'text-slate-900'
    : isUnderground
    ? 'text-slate-100'
    : isCastle
    ? 'text-amber-200'
    : isDark
    ? 'text-slate-100'
    : 'text-slate-900';

  const progressBarTrackClass = isLight
    ? 'bg-slate-200'
    : isUnderground
    ? 'bg-[#050710]'
    : isCastle
    ? 'bg-[#080202]'
    : 'bg-slate-800';

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Player 1 Card Header */}
      <div className={`${playerCardClass} flex flex-col md:flex-row items-center justify-between gap-4`}>
        <div className="flex items-center space-x-4">
          <div className="text-4xl p-2 bg-[#e52521] border-2 border-black">
            {rank.icon}
          </div>
          <div>
            <div className={`text-[10px] font-arcade ${isLight ? 'text-amber-700 font-bold' : 'text-[#fc9838]'}`}>
              PLAYER 1 PROFILE
            </div>
            <div className={`font-arcade text-base sm:text-xl font-bold ${rank.color}`}>
              {rank.title}
            </div>
            <div className={`font-pixel text-xs mt-1 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>
              CURRENT STREAK: {progress.streak || 1} DAYS • LIVES: ♥♥♥
            </div>
          </div>
        </div>

        {/* Coins & Score Badges */}
        <div className="flex items-center space-x-4">
          <div
            onClick={() => marioSound.playCoin()}
            className="mario-hud-panel px-4 py-2 text-center cursor-pointer hover:scale-105 transition-transform"
            title="Click for Coin Ding!"
          >
            <div className="text-[10px] text-[#fcd800]">TOTAL COINS</div>
            <div className="text-sm font-arcade text-white">🪙 x{totalCoins}</div>
          </div>

          <div className="mario-hud-panel px-4 py-2 text-center">
            <div className="text-[10px] text-[#00d800]">HIGH SCORE</div>
            <div className="text-sm font-arcade text-white">
              {(progress.solved_count * 1000 + (progress.streak || 0) * 200).toString().padStart(6, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Solved Card */}
        <div className={statCardClass}>
          <div className="text-2xl mb-1">🏁</div>
          <div className={`font-arcade text-xl font-bold ${statNumClass}`}>
            {progress.solved_count}
            <span className="text-xs text-slate-500 font-normal">/{progress.total_challenges}</span>
          </div>
          <div className="font-arcade text-[9px] text-[#00a800] mt-1 font-bold">STAGES CLEARED</div>
        </div>

        {/* Completion Rate */}
        <div className={statCardClass}>
          <div className="text-2xl mb-1">📊</div>
          <div className={`font-arcade text-xl font-bold ${statNumClass}`}>
            {progress.completion_rate}%
          </div>
          <div className="font-arcade text-[9px] text-[#0050d0] mt-1 font-bold">COMPLETION RATE</div>
        </div>

        {/* Accuracy */}
        <div className={statCardClass}>
          <div className="text-2xl mb-1">🎯</div>
          <div className={`font-arcade text-xl font-bold ${statNumClass}`}>
            {progress.accuracy_percent}%
          </div>
          <div className="font-arcade text-[9px] text-[#fc9838] mt-1 font-bold">TEST ACCURACY</div>
        </div>

        {/* Total Submissions */}
        <div className={statCardClass}>
          <div className="text-2xl mb-1">🎮</div>
          <div className={`font-arcade text-xl font-bold ${statNumClass}`}>
            {progress.total_attempts}
          </div>
          <div className="font-arcade text-[9px] text-[#e52521] mt-1 font-bold">TOTAL RUNS</div>
        </div>
      </div>

      {/* Difficulty Breakdown Panel */}
      <div className={`${panelClass} space-y-5`}>
        <h2 className="font-arcade text-sm flex items-center space-x-2">
          <span>🚩</span>
          <span className={isLight || !isDark ? 'text-slate-900' : 'text-[#fcd800]'}>
            WORLD STAGE PROGRESS BREAKDOWN
          </span>
        </h2>

        <div className="space-y-4">
          {/* Easy */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-arcade text-[10px]">
              <span className="text-[#00a800] font-bold">🍄 WORLD 1 (EASY)</span>
              <span className={isLight || !isDark ? 'text-slate-700' : 'text-slate-300'}>
                {difficulty.easy.solved} / {difficulty.easy.total} (
                {getPercent(difficulty.easy.solved, difficulty.easy.total)}%)
              </span>
            </div>
            <div className={`w-full h-4 ${progressBarTrackClass} border-2 border-black overflow-hidden`}>
              <div
                className="h-full bg-[#00a800] transition-all duration-500"
                style={{
                  width: `${getPercent(difficulty.easy.solved, difficulty.easy.total)}%`,
                }}
              />
            </div>
          </div>

          {/* Medium */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-arcade text-[10px]">
              <span className="text-[#fc9838] font-bold">🔥 WORLD 2 (MEDIUM)</span>
              <span className={isLight || !isDark ? 'text-slate-700' : 'text-slate-300'}>
                {difficulty.medium.solved} / {difficulty.medium.total} (
                {getPercent(difficulty.medium.solved, difficulty.medium.total)}%)
              </span>
            </div>
            <div className={`w-full h-4 ${progressBarTrackClass} border-2 border-black overflow-hidden`}>
              <div
                className="h-full bg-[#fc9838] transition-all duration-500"
                style={{
                  width: `${getPercent(difficulty.medium.solved, difficulty.medium.total)}%`,
                }}
              />
            </div>
          </div>

          {/* Hard */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-arcade text-[10px]">
              <span className="text-[#e52521] font-bold">👑 BOWSER CASTLE (HARD)</span>
              <span className={isLight || !isDark ? 'text-slate-700' : 'text-slate-300'}>
                {difficulty.hard.solved} / {difficulty.hard.total} (
                {getPercent(difficulty.hard.solved, difficulty.hard.total)}%)
              </span>
            </div>
            <div className={`w-full h-4 ${progressBarTrackClass} border-2 border-black overflow-hidden`}>
              <div
                className="h-full bg-[#e52521] transition-all duration-500"
                style={{
                  width: `${getPercent(difficulty.hard.solved, difficulty.hard.total)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cleared Stages Tally */}
      <div className={`${panelClass} space-y-4`}>
        <h2 className="font-arcade text-sm flex items-center space-x-2">
          <span>⭐</span>
          <span className={isLight || !isDark ? 'text-slate-900' : 'text-[#fcd800]'}>
            CLEARED COURSES HALL OF FAME ({solvedChallenges.length})
          </span>
        </h2>

        {solvedChallenges.length === 0 ? (
          <div className={`p-6 text-center font-arcade text-xs border-2 border-dashed ${
            isLight
              ? 'text-slate-500 bg-slate-50 border-slate-300'
              : isUnderground
              ? 'text-slate-400 bg-[#050710] border-[#2038ec]/50'
              : isCastle
              ? 'text-amber-300/60 bg-[#080202] border-[#d82800]/50'
              : 'text-slate-400 bg-black border-slate-700'
          }`}>
            NO COURSES CLEARED YET. START A RUN IN STAGE SELECT!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {solvedChallenges.map((c) => (
              <div
                key={c.id}
                onClick={() => {
                  marioSound.playJump();
                  onSelectChallenge(c.id);
                }}
                className={`p-3 border-2 flex items-center justify-between cursor-pointer transition-colors ${courseItemClass}`}
              >
                <div className="flex items-center space-x-2 truncate pr-2">
                  <span className="text-emerald-500 font-arcade text-xs">⭐</span>
                  <span className="font-arcade text-xs truncate">
                    {c.title}
                  </span>
                </div>
                <button className="mario-btn mario-btn-yellow px-2 py-0.5 text-[9px] font-arcade shrink-0 flex items-center space-x-1 text-black">
                  <span>REPLAY</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
