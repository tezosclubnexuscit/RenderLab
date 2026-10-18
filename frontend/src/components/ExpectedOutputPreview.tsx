import React, { useState, useMemo } from 'react';
import { Target, RotateCw, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { StarterCode } from '../types';
import { useTheme } from '../context/ThemeContext';

interface ExpectedOutputPreviewProps {
  solutionCode?: StarterCode;
  fallbackCode?: StarterCode;
  title: string;
}

export const ExpectedOutputPreview: React.FC<ExpectedOutputPreviewProps> = ({
  solutionCode,
  fallbackCode,
  title,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const isUnderground = theme === 'mario-underground';
  const isCastle = theme === 'mario-castle';
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [reloadCounter, setReloadCounter] = useState(0);

  // Fallback to starter_code if solution_code is not populated
  const effectiveCode = solutionCode?.html ? solutionCode : fallbackCode;
  const html = effectiveCode?.html || '';
  const css = effectiveCode?.css || '';
  const js = effectiveCode?.javascript || '';

  // Stable memoized preview document - renders once and does not blink
  const docContent = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & Reference Solution Canvas */
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #0f172a;
      color: #f8fafc;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch(err) {
      console.warn("Expected preview script notice:", err);
    }
  </script>
</body>
</html>`;
  }, [html, css, js]);

  const handleRefresh = () => {
    setReloadCounter((prev) => prev + 1);
  };

  const containerClass = isLight
    ? 'flex flex-col h-full border-2 border-black shadow-[3px_3px_0px_#000] overflow-hidden bg-white'
    : isUnderground
    ? 'flex flex-col h-full border-2 border-[#2038ec] shadow-[3px_3px_0px_#050710] overflow-hidden bg-[#0b0f20]'
    : isCastle
    ? 'flex flex-col h-full border-2 border-[#d82800] shadow-[3px_3px_0px_#080202] overflow-hidden bg-[#120404]'
    : 'flex flex-col h-full border border-slate-800 shadow-inner overflow-hidden bg-[#0b0f17]';

  const headerClass = isLight
    ? 'px-3 py-2 border-b-2 border-black flex items-center justify-between text-xs bg-slate-100 text-slate-900'
    : isUnderground
    ? 'px-3 py-2 border-b-2 border-[#2038ec] flex items-center justify-between text-xs bg-[#050710] text-slate-100'
    : isCastle
    ? 'px-3 py-2 border-b-2 border-[#d82800] flex items-center justify-between text-xs bg-[#080202] text-amber-100'
    : 'px-3 py-2 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-900/90 text-white';

  const frameContainerClass = isLight
    ? 'flex-1 flex items-center justify-center p-2 overflow-hidden relative bg-slate-100'
    : isUnderground
    ? 'flex-1 flex items-center justify-center p-2 overflow-hidden relative bg-[#050710]'
    : isCastle
    ? 'flex-1 flex items-center justify-center p-2 overflow-hidden relative bg-[#080202]'
    : 'flex-1 flex items-center justify-center p-2 overflow-hidden relative bg-slate-950/70';

  const footerClass = isLight
    ? 'px-3 py-1.5 border-t-2 border-black text-[10px] flex items-center space-x-1.5 bg-slate-50 text-slate-800 font-semibold font-pixel'
    : isUnderground
    ? 'px-3 py-1.5 border-t-2 border-[#2038ec] text-[10px] flex items-center space-x-1.5 bg-[#050710] text-slate-400 font-pixel'
    : isCastle
    ? 'px-3 py-1.5 border-t-2 border-[#d82800] text-[10px] flex items-center space-x-1.5 bg-[#080202] text-amber-300/80 font-pixel'
    : 'px-3 py-1.5 border-t border-slate-800/80 text-[10px] flex items-center space-x-1.5 bg-slate-900/60 text-slate-400 font-pixel';

  return (
    <div className={containerClass}>
      {/* Header bar */}
      <div className={headerClass}>
        <div
          className={`flex items-center space-x-1.5 font-arcade text-[10px] uppercase tracking-wider ${
            isLight ? 'text-[#008000] font-bold' : 'text-[#00d800]'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Expected Target Output</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1 ${
              viewport === 'desktop'
                ? isLight
                  ? 'bg-black text-white'
                  : 'bg-slate-800 text-white'
                : isLight
                ? 'text-slate-600 hover:text-black hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1 ${
              viewport === 'mobile'
                ? isLight
                  ? 'bg-black text-white'
                  : 'bg-slate-800 text-white'
                : isLight
                ? 'text-slate-600 hover:text-black hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-1 transition-colors ${
              isLight
                ? 'text-slate-600 hover:text-black hover:bg-slate-200'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Reset Output"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame container */}
      <div className={frameContainerClass}>
        <div
          className={`h-full transition-all duration-300 shadow-lg overflow-hidden ${
            isLight
              ? 'bg-white border-2 border-black'
              : isUnderground
              ? 'bg-[#0f172a] border border-[#2038ec]'
              : isCastle
              ? 'bg-[#0f172a] border border-[#d82800]'
              : 'bg-[#0f172a] border border-slate-800/60'
          } ${viewport === 'mobile' ? 'w-[320px]' : 'w-full'}`}
        >
          {html ? (
            <iframe
              key={`${title}-${reloadCounter}`}
              srcDoc={docContent}
              title={`Expected output for ${title}`}
              className="w-full h-full border-0 bg-transparent"
              sandbox="allow-scripts allow-modals"
            />
          ) : (
            <div
              className={`h-full flex items-center justify-center text-xs italic p-4 text-center ${
                isLight ? 'text-slate-600 font-semibold' : 'text-slate-500'
              }`}
            >
              Target design preview is ready once template is loaded.
            </div>
          )}
        </div>
      </div>

      {/* Footer tip */}
      <div className={footerClass}>
        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Target reference design. Build your code in the center editor to match this result.</span>
      </div>
    </div>
  );
};
