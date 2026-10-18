import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  Gamepad2,
  Play,
  Zap,
} from 'lucide-react';
import { ChallengeListItem } from '../types';
import { getChallengeCategory } from './ChallengeBrowser';
import { useTheme } from '../context/ThemeContext';
import { marioSound } from '../services/soundService';

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
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const isDark = theme === 'dark';

  const featuredChallenges = challenges.slice(0, 3);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return {
          icon: '🍄',
          label: 'WORLD 1 (EASY)',
          color: 'bg-[#00a800] text-white border-black',
        };
      case 'medium':
        return {
          icon: '🔥',
          label: 'WORLD 2 (MED)',
          color: 'bg-[#fc9838] text-black border-black',
        };
      case 'hard':
        return {
          icon: '👑',
          label: 'BOWSER (HARD)',
          color: 'bg-[#e52521] text-white border-black',
        };
      default:
        return {
          icon: '⭐',
          label: 'BONUS',
          color: 'bg-slate-800 text-white border-black',
        };
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'fill_blanks':
        return 'Fill In Blanks';
      case 'fix_broken':
        return 'Bug Fix Run';
      case 'build_component':
        return 'Build Component';
      case 'recreate_page':
        return 'World Clear';
      default:
        return mode;
    }
  };

  // 8-bit Banner Badge at top
  const heroBadgeClass = isLight
    ? 'bg-white border-2 border-black text-slate-900 shadow-[3px_3px_0px_#000]'
    : isUnderground
    ? 'bg-[#050710] border-2 border-[#2038ec] text-white shadow-[3px_3px_0px_#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-2 border-[#d82800] text-amber-100 shadow-[3px_3px_0px_#d82800]'
    : 'bg-[#000000] border-2 border-white text-white shadow-[3px_3px_0px_#000]';

  // Hero Subtitle style
  const heroSubtitleClass = isUnderground
    ? 'bg-[#12182b]/95 border-2 border-[#2038ec] text-slate-100 shadow-[4px_4px_0px_#050710]'
    : isCastle
    ? 'bg-[#1c0a0a]/95 border-2 border-[#d82800] text-amber-100 shadow-[4px_4px_0px_#080202]'
    : isDark
    ? 'bg-[#111726]/95 border-2 border-slate-700 text-slate-200 shadow-[4px_4px_0px_#000]'
    : isLight
    ? 'bg-white/95 border-2 border-black text-slate-900 shadow-[4px_4px_0px_#000]'
    : 'bg-white/90 border-2 border-black text-slate-900 shadow-[4px_4px_0px_#000]';

  // Metric HUD Box style per theme
  const hudBoxClass = isLight
    ? 'bg-white border-4 border-black shadow-[4px_4px_0px_#000] text-slate-900'
    : isUnderground
    ? 'bg-[#050710] border-4 border-[#2038ec] shadow-[4px_4px_0px_#2038ec] text-white'
    : isCastle
    ? 'bg-[#080202] border-4 border-[#d82800] shadow-[4px_4px_0px_#d82800] text-amber-100'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 shadow-[4px_4px_0px_#000] text-white'
    : 'bg-[#000000] border-4 border-white shadow-[4px_4px_0px_#000] text-white';

  const hudStagesLabelClass = isLight ? 'text-[#b84418]' : 'text-[#fcd800]';
  const hudWorldsLabelClass = isLight ? 'text-[#008000]' : 'text-[#00d800]';
  const hudSandboxLabelClass = isLight ? 'text-[#0050d0]' : 'text-[#5c94fc]';
  const hudAiLabelClass = isLight ? 'text-[#e52521]' : 'text-[#e52521]';

  const hudValueClass = isLight
    ? 'text-slate-950 font-bold'
    : isCastle
    ? 'text-amber-100 font-bold'
    : 'text-white font-bold';

  // Featured cards style
  const cardClass = isLight
    ? 'bg-white border-4 border-black p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] p-4 shadow-[5px_5px_0px_#050710] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#2038ec] hover:border-[#5c94fc]'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] p-4 shadow-[5px_5px_0px_#080202] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#d82800] hover:border-[#fc9838]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000] hover:border-slate-500'
    : 'bg-white border-4 border-black p-4 shadow-[5px_5px_0px_#000] hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000]';

  const cardTitleClass = isLight
    ? 'text-slate-950 hover:text-[#e52521]'
    : isUnderground
    ? 'text-slate-100 hover:text-[#5c94fc]'
    : isCastle
    ? 'text-amber-100 hover:text-[#fcd800]'
    : isDark
    ? 'text-slate-100 hover:text-[#fcd800]'
    : 'text-slate-950 hover:text-[#e52521]';

  const cardDescClass = isLight
    ? 'text-slate-600'
    : isUnderground
    ? 'text-slate-400'
    : isCastle
    ? 'text-amber-200/70'
    : isDark
    ? 'text-slate-400'
    : 'text-slate-600';

  const cardDividerClass = isUnderground
    ? 'border-[#2038ec]/50'
    : isCastle
    ? 'border-[#d82800]/50'
    : isDark
    ? 'border-slate-700'
    : 'border-black';

  // Power-Ups Outer container
  const powerUpsContainerClass = isLight
    ? 'bg-white border-4 border-black text-slate-900 shadow-[6px_6px_0px_#000]'
    : isUnderground
    ? 'bg-[#050710] border-4 border-[#2038ec] text-slate-100 shadow-[6px_6px_0px_#2038ec]'
    : isCastle
    ? 'bg-[#080202] border-4 border-[#d82800] text-amber-100 shadow-[6px_6px_0px_#d82800]'
    : isDark
    ? 'bg-[#111726] border-4 border-slate-700 text-white shadow-[6px_6px_0px_#000]'
    : 'bg-[#000000] border-4 border-white text-white shadow-[6px_6px_0px_#000]';

  // Power-Ups Inner Card
  const powerUpItemClass = isLight
    ? 'bg-slate-50 border-4 border-black text-slate-900 shadow-[4px_4px_0px_#000]'
    : isUnderground
    ? 'bg-[#12182b] border-4 border-[#2038ec] text-slate-100 shadow-[4px_4px_0px_#050710] hover:border-[#5c94fc]'
    : isCastle
    ? 'bg-[#1c0a0a] border-4 border-[#d82800] text-amber-100 shadow-[4px_4px_0px_#080202] hover:border-[#fc9838]'
    : isDark
    ? 'bg-slate-900 border-4 border-slate-700 text-slate-100 shadow-[4px_4px_0px_#000]'
    : 'bg-white border-4 border-black text-slate-900 shadow-[4px_4px_0px_#000]';

  // Power-Up item text classes
  const powerUpTitleClass = isLight
    ? 'text-slate-950 font-bold'
    : isUnderground
    ? 'text-[#5c94fc] font-bold'
    : isCastle
    ? 'text-amber-300 font-bold'
    : isDark
    ? 'text-[#fcd800] font-bold'
    : 'text-slate-950 font-bold';

  const powerUpDescClass = isLight
    ? 'text-slate-700 font-medium'
    : isUnderground
    ? 'text-slate-200'
    : isCastle
    ? 'text-amber-100/90'
    : isDark
    ? 'text-slate-300'
    : 'text-slate-800 font-medium';

  // Footer styling
  const footerClass = isUnderground
    ? 'bg-[#050814] border-t-4 border-[#2038ec] text-cyan-300'
    : isCastle
    ? 'bg-[#180404] border-t-4 border-[#d82800] text-amber-300'
    : isLight
    ? 'bg-slate-100 border-t-4 border-black text-slate-700'
    : 'bg-[#803800] border-t-4 border-black text-[#fce4a0]';

  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* ================= MARIO TITLE SCREEN HERO ================= */}
      <section className="relative px-4 pt-10 pb-16 md:pt-16 md:pb-24 max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Floating Hero Mascot: Mario Mushroom */}
        <div
          onClick={() => {
            marioSound.play1Up();
          }}
          className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center cursor-pointer mb-6 mario-bounce drop-shadow-[4px_4px_0px_#000000] hover:scale-110 transition-transform"
          title="Super Mushroom! 1-UP!"
        >
          <img src="/favicon.svg" alt="Super Mario Mushroom" className="w-12 h-12 md:w-14 md:h-14 [image-rendering:pixelated]" />
        </div>

        {/* 8-bit Banner Badge */}
        <div className={`inline-flex items-center space-x-2 px-3 py-1 text-[10px] md:text-xs font-arcade mb-6 ${heroBadgeClass}`}>
          <span className="text-[#fcd800] mario-coin font-bold">🪙</span>
          <span>NES ARCADE EDITION — 2026 EDITION</span>
        </div>

        {/* Mario Retro Arcade Title */}
        <h1 className="font-arcade text-3xl sm:text-5xl md:text-6xl tracking-wider leading-tight max-w-4xl select-none">
          <span className="block text-[#fcd800] [paint-order:stroke_fill] [-webkit-text-stroke:2px_#000000] drop-shadow-[4px_4px_0px_#b84418]">
            SUPER RENDERLAB
          </span>
        </h1>

        {/* Subtitle / Retro Mission Prompt */}
        <p className={`mt-6 text-xs sm:text-sm md:text-base font-pixel max-w-2xl p-3 leading-relaxed ${heroSubtitleClass}`}>
          Level up your frontend agility! Battle bugs, conquer DOM trees, and defeat Bowser's broken layouts in an authentic 8-bit live coding arena.
        </p>

        {/* Arcade Insert Coin / Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => {
              marioSound.play1Up();
              onStartPracticing();
            }}
            className="mario-btn mario-btn-red px-6 py-3 text-xs md:text-sm font-arcade flex items-center space-x-2.5"
          >
            <Gamepad2 className="w-4 h-4 text-white" />
            <span>PRESS START [1P]</span>
          </button>

          <button
            onClick={() => {
              marioSound.playPipe();
              onExploreChallenges();
            }}
            className="mario-btn mario-btn-green px-5 py-3 text-xs md:text-sm font-arcade flex items-center space-x-2"
          >
            <span>WARP ZONE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              marioSound.playBlockBump();
              onOpenGenerator();
            }}
            className="mario-btn mario-btn-yellow px-5 py-3 text-xs md:text-sm font-arcade flex items-center space-x-2 text-black"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI LEVEL [?]</span>
          </button>
        </div>

        {/* Retro Game Metrics HUD Tally - Linked to Database */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-3xl">
          <div className={`${hudBoxClass} p-3 text-center`}>
            <div className={`${hudStagesLabelClass} text-[10px] mb-1 font-arcade font-bold`}>STAGES</div>
            <div className={`text-base font-arcade ${hudValueClass}`}>
              {challenges.length > 0 ? challenges.length : '300+'}
            </div>
          </div>
          <div className={`${hudBoxClass} p-3 text-center`}>
            <div className={`${hudWorldsLabelClass} text-[10px] mb-1 font-arcade font-bold`}>WORLDS</div>
            <div className={`text-[9px] sm:text-[10px] md:text-xs font-arcade ${hudValueClass} tracking-tight truncate leading-tight px-0.5`}>
              HTML • CSS • JS
            </div>
          </div>
          <div className={`${hudBoxClass} p-3 text-center`}>
            <div className={`${hudSandboxLabelClass} text-[10px] mb-1 font-arcade font-bold`}>SANDBOX</div>
            <div className={`text-base font-arcade ${hudValueClass}`}>60 FPS</div>
          </div>
          <div className={`${hudBoxClass} p-3 text-center`}>
            <div className={`${hudAiLabelClass} text-[10px] mb-1 font-arcade font-bold`}>AI ENGINE</div>
            <div className={`text-base font-arcade ${hudValueClass}`}>DUAL LLM</div>
          </div>
        </div>
      </section>

      {/* ================= MARIO BRICK ROAD DIVIDER ================= */}
      <div className="h-6 w-full mario-brick-pattern border-y-2 border-black" />

      {/* ================= FEATURED STAGES (WORLD 1-1, 1-2, 1-3) ================= */}
      {featuredChallenges.length > 0 && (
        <section className="px-4 py-12 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
            <div>
              <h2 className={`font-arcade text-base sm:text-lg flex items-center space-x-2 ${
                isLight ? 'text-[#b84418] drop-shadow-[1px_1px_0px_#fcd800]' : isUnderground ? 'text-[#5c94fc] drop-shadow-[2px_2px_0px_#2038ec]' : isCastle ? 'text-[#fcd800] drop-shadow-[2px_2px_0px_#d82800]' : 'text-[#fcd800] [paint-order:stroke_fill] [-webkit-text-stroke:2px_#000000] drop-shadow-[3px_3px_0px_#000000]'
              }`}>
                <span>⭐</span>
                <span>FEATURED LEVEL SELECT</span>
              </h2>
              <p
                className={`font-pixel text-xs mt-1 font-semibold ${
                  isLight ? 'text-slate-800' : isCastle ? 'text-amber-200' : 'text-slate-200'
                }`}
              >
                Jump into popular frontline challenges and start collecting XP coins!
              </p>
            </div>
            <button
              onClick={() => {
                marioSound.playPipe();
                onExploreChallenges();
              }}
              className={`mario-btn px-3 py-1.5 text-[10px] font-arcade flex items-center space-x-1.5 self-start sm:self-auto ${
                isLight ? 'bg-white text-slate-900 border-2 border-black hover:bg-slate-100' : isUnderground ? 'bg-[#050710] text-slate-200 border-2 border-[#2038ec] hover:bg-[#12182b]' : isCastle ? 'bg-[#080202] text-amber-200 border-2 border-[#d82800] hover:bg-[#1c0a0a]' : 'mario-btn-dark'
              }`}
            >
              <span>ALL LEVELS</span>
              <ArrowRight className="w-3 h-3 text-[#fcd800]" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredChallenges.map((ch, idx) => {
              const badge = getDifficultyBadge(ch.difficulty);
              const worldNum = `1-${idx + 1}`;

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    marioSound.playJump();
                    onSelectChallenge(ch.id);
                  }}
                  className={`${cardClass} cursor-pointer flex flex-col justify-between`}
                >
                  <div>
                    {/* Level Header / Badge - Single Line Clean Spacing */}
                    <div className={`flex items-center justify-between mb-3 border-b-2 ${cardDividerClass} pb-2 gap-1`}>
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <span className="font-arcade text-[9px] bg-black text-[#fcd800] px-2 py-0.5 border border-black whitespace-nowrap">
                          WORLD {worldNum}
                        </span>
                        <span className={`font-arcade text-[9px] px-1.5 py-0.5 border whitespace-nowrap ${badge.color}`}>
                          {badge.icon} {ch.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <span className={`font-arcade text-[9px] whitespace-nowrap shrink-0 ${isLight ? 'text-slate-700' : isUnderground ? 'text-slate-400' : isCastle ? 'text-amber-300' : 'text-slate-400'}`}>
                        ⏱ {ch.estimated_minutes}M
                      </span>
                    </div>

                    <h3 className={`font-pixel text-sm font-bold leading-snug mb-2 line-clamp-2 transition-colors ${cardTitleClass}`}>
                      {ch.title}
                    </h3>
                    <p className={`font-pixel text-xs line-clamp-3 leading-relaxed ${cardDescClass}`}>
                      {ch.description}
                    </p>
                  </div>

                  {/* Level Card Bottom */}
                  <div className={`mt-4 pt-3 border-t-2 ${cardDividerClass} flex items-center justify-between`}>
                    <span className="font-arcade text-[9px] text-[#00a800] font-bold">
                      {getModeLabel(ch.mode)}
                    </span>
                    <button className="mario-btn mario-btn-yellow px-2.5 py-1 text-[9px] font-arcade text-black flex items-center space-x-1">
                      <span>PLAY</span>
                      <Play className="w-2.5 h-2.5 fill-black" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= MARIO POWER-UP CAPABILITIES ================= */}
      <section className="px-4 py-12 max-w-5xl mx-auto">
        <div className={`${powerUpsContainerClass} p-6`}>
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2
              className={`font-arcade text-base sm:text-lg tracking-wider ${
                isLight
                  ? 'text-[#b84418] drop-shadow-[1px_1px_0px_#fcb400]'
                  : isCastle
                  ? 'text-[#fcd800] drop-shadow-[2px_2px_0px_#d82800]'
                  : isUnderground
                  ? 'text-[#5c94fc] drop-shadow-[2px_2px_0px_#2038ec]'
                  : 'text-[#fcd800] !text-[#fcd800] drop-shadow-[2px_2px_0px_#e52521]'
              }`}
            >
              ★ COLLECT YOUR POWER-UPS ★
            </h2>
            <p
              className={`font-pixel text-xs sm:text-sm mt-2 ${
                isLight
                  ? 'text-slate-800 font-bold'
                  : isCastle
                  ? 'text-amber-200'
                  : isUnderground
                  ? 'text-slate-200'
                  : 'text-white !text-white'
              }`}
            >
              Every tool in Super RenderLab is designed to give you invincible coding superpowers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Power-Up 1 */}
            <div className={`${powerUpItemClass} p-4 flex flex-col items-center text-center transition-all`}>
              <img src="/favicon.svg" alt="Super Monaco Mushroom" className="w-9 h-9 mb-2 [image-rendering:pixelated] drop-shadow-[2px_2px_0px_#000000]" />
              <h3 className={`font-arcade text-[10px] font-bold mb-1 ${powerUpTitleClass}`}>
                SUPER MONACO
              </h3>
              <p className={`font-pixel text-xs leading-relaxed ${powerUpDescClass}`}>
                VS Code editor engine with HTML, CSS, and JS tabs, auto-completion, and syntax formatting.
              </p>
            </div>

            {/* Power-Up 2 */}
            <div className={`${powerUpItemClass} p-4 flex flex-col items-center text-center transition-all`}>
              <div className="text-3xl mb-2">🌟</div>
              <h3 className={`font-arcade text-[10px] font-bold mb-1 ${powerUpTitleClass}`}>
                STAR SANDBOX
              </h3>
              <p className={`font-pixel text-xs leading-relaxed ${powerUpDescClass}`}>
                Isolated 60fps real-time iframe preview with instant side-by-side reference verification.
              </p>
            </div>

            {/* Power-Up 3 */}
            <div className={`${powerUpItemClass} p-4 flex flex-col items-center text-center transition-all`}>
              <div className="text-3xl mb-2">🪙</div>
              <h3 className={`font-arcade text-[10px] font-bold mb-1 ${powerUpTitleClass}`}>
                COIN TESTER
              </h3>
              <p className={`font-pixel text-xs leading-relaxed ${powerUpDescClass}`}>
                Instant browser test evaluation verifying elements, computed CSS styles, and event triggers.
              </p>
            </div>

            {/* Power-Up 4 */}
            <div className={`${powerUpItemClass} p-4 flex flex-col items-center text-center transition-all`}>
              <div className="text-3xl mb-2">❓</div>
              <h3 className={`font-arcade text-[10px] font-bold mb-1 ${powerUpTitleClass}`}>
                TOAD'S AI TUTOR
              </h3>
              <p className={`font-pixel text-xs leading-relaxed ${powerUpDescClass}`}>
                Dual LLM guidance: local private Ollama or cloud models for hints without spoiling solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WARP PIPE CALL TO ACTION ================= */}
      <section className="px-4 py-8 max-w-3xl mx-auto mb-10 text-center">
        <div className="bg-[#00a800] border-4 border-black p-6 shadow-[6px_6px_0px_#000] text-white flex flex-col items-center">
          <div className="text-4xl mb-2">🚩</div>
          <h2 className="font-arcade text-sm sm:text-base text-[#fcd800] drop-shadow-[2px_2px_0px_#000]">
            COURSE CLEAR? GRAB THE FLAG!
          </h2>
          <p className="font-pixel text-xs text-white/95 mt-2 max-w-md">
            Enter the practice workspace now and prove you are a Master of the Web Frontend.
          </p>
          <button
            onClick={() => {
              marioSound.playStageClear();
              onStartPracticing();
            }}
            className="mt-5 mario-btn mario-btn-yellow px-6 py-3 text-xs font-arcade flex items-center space-x-2 text-black"
          >
            <span>START PRACTICE WORKSPACE</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ================= MARIO GROUND FOOTER ================= */}
      <footer className={`w-full py-4 px-4 text-center font-arcade text-[9px] ${footerClass}`}>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>SUPER RENDERLAB</span>
          <span>© 2026</span>
          <span>•</span>
          <span className="text-[#fcd800]">MADE WITH ❤️ FROM TEZOS NEXUS CIT</span>
        </div>
      </footer>
    </div>
  );
};
