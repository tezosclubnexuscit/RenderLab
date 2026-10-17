import React, { useState, useMemo } from 'react';
import { Target, RotateCw, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { StarterCode } from '../types';

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

  return (
    <div className="flex flex-col h-full bg-[#0b0f17] rounded-lg border border-slate-800 overflow-hidden shadow-inner">
      {/* Header bar */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>Expected Target Output</span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1 rounded ${
              viewport === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1 rounded ${
              viewport === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
            title="Reset Output"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame container */}
      <div className="flex-1 bg-slate-950/70 flex items-center justify-center p-2 overflow-hidden relative">
        <div
          className={`h-full bg-[#0f172a] rounded transition-all duration-300 shadow-lg overflow-hidden border border-slate-800/60 ${
            viewport === 'mobile' ? 'w-[320px]' : 'w-full'
          }`}
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
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic p-4 text-center">
              Target design preview is ready once template is loaded.
            </div>
          )}
        </div>
      </div>

      {/* Footer tip */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center space-x-1.5">
        <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
        <span>Target reference design. Build your code in the center editor to match this result.</span>
      </div>
    </div>
  );
};
