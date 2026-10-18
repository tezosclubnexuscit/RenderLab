import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  RotateCw,
  Smartphone,
  Tablet,
  Monitor,
  Terminal,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { TestCase, SubmissionResultItem } from '../types';
import { useTheme } from '../context/ThemeContext';

export interface LivePreviewHandle {
  runTests: (tests: TestCase[]) => Promise<SubmissionResultItem[]>;
}

interface LivePreviewProps {
  html: string;
  css: string;
  javascript: string;
  runTrigger: number;
}

export const LivePreview = forwardRef<LivePreviewHandle, LivePreviewProps>(
  ({ html, css, javascript, runTrigger }, ref) => {
    const { theme } = useTheme();
    const isLight = theme === 'light';
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [logs, setLogs] = useState<Array<{ type: 'log' | 'warn' | 'error'; text: string; time: string }>>([]);
    const [showConsole, setShowConsole] = useState(false);

    // Build complete isolated document
    const generatePreviewDoc = () => {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Reset & user styles */
    ${css}
  </style>
  <script>
    // Intercept console messages and relay to parent
    (function() {
      const origLog = console.log;
      const origWarn = console.warn;
      const origError = console.error;

      function relay(type, args) {
        try {
          const text = Array.from(args).map(a => {
            if (typeof a === 'object') {
              try { return JSON.stringify(a); } catch(e) { return String(a); }
            }
            return String(a);
          }).join(' ');
          window.parent.postMessage({ type: 'CONSOLE_LOG', level: type, text }, '*');
        } catch(e) {}
      }

      console.log = function(...args) { relay('log', args); origLog.apply(console, args); };
      console.warn = function(...args) { relay('warn', args); origWarn.apply(console, args); };
      console.error = function(...args) { relay('error', args); origError.apply(console, args); };

      window.addEventListener('error', function(event) {
        relay('error', [event.message + ' at line ' + event.lineno]);
      });
    })();
  </script>
</head>
<body>
  ${html}

  <script>
    try {
      ${javascript}
    } catch(err) {
      console.error('Runtime script error: ' + err.message);
    }
  </script>
</body>
</html>`;
    };

    // Update iframe content
    const refreshIframe = () => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = generatePreviewDoc();
      }
    };

    useEffect(() => {
      refreshIframe();
    }, [runTrigger]);

    // Handle incoming messages from iframe
    useEffect(() => {
      const handleMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'CONSOLE_LOG') {
          const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLogs((prev) => [
            ...prev.slice(-40),
            { type: e.data.level, text: e.data.text, time: now },
          ]);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Expose test runner to parent
    useImperativeHandle(ref, () => ({
      async runTests(tests: TestCase[]): Promise<SubmissionResultItem[]> {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) {
          return [];
        }

        let win: any;
        let doc: any;
        try {
          win = iframe.contentWindow;
          doc = win.document;
          if (!doc) return [];
        } catch (err: any) {
          console.warn('Sandbox iframe document access notice:', err);
          return [];
        }

        const results: SubmissionResultItem[] = [];

        for (const test of tests) {
          try {
            let passed = false;
            let msg = 'Test assertion verified';

            if (test.assertion_code) {
              // Execute assertion code within the iframe window context
              const evalFn = new (win as any).Function(
                'document',
                'window',
                `try { return Boolean(${test.assertion_code}); } catch(e) { return { error: e.message }; }`
              );
              const res = evalFn(doc, win);
              if (res && res.error) {
                passed = false;
                msg = `Assertion threw exception: ${res.error}`;
              } else {
                passed = Boolean(res);
                if (!passed) msg = 'Assertion returned false';
              }
            } else if (test.selector) {
              const el = doc.querySelector(test.selector);
              passed = Boolean(el);
              if (!passed) msg = `Element '${test.selector}' not found in DOM`;
            }

            results.push({
              test_id: test.test_id,
              description: test.description,
              passed,
              message: msg,
            });
          } catch (err: any) {
            results.push({
              test_id: test.test_id,
              description: test.description,
              passed: false,
              message: `Execution error: ${err.message}`,
            });
          }
        }

        return results;
      },
    }));

    const isUnderground = theme === 'mario-underground';
    const isCastle = theme === 'mario-castle';

    const getViewportWidth = () => {
      switch (viewport) {
        case 'mobile':
          return '375px';
        case 'tablet':
          return '768px';
        case 'desktop':
        default:
          return '100%';
      }
    };

    // Theme-specific colors
    const toolbarClass = isLight
      ? 'h-10 bg-slate-100 border-b-2 border-black px-3 flex items-center justify-between text-slate-900'
      : isUnderground
      ? 'h-10 bg-[#050710] border-b-2 border-[#2038ec] px-3 flex items-center justify-between text-slate-100'
      : isCastle
      ? 'h-10 bg-[#080202] border-b-2 border-[#d82800] px-3 flex items-center justify-between text-amber-100'
      : 'h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between';

    const outerContainerClass = isLight
      ? 'flex flex-col h-full bg-slate-100 relative'
      : isUnderground
      ? 'flex flex-col h-full bg-[#0b0f20] relative'
      : isCastle
      ? 'flex flex-col h-full bg-[#120404] relative'
      : 'flex flex-col h-full bg-[#0d131f] relative';

    const sandboxAreaClass = isLight
      ? 'flex-1 bg-slate-200 flex items-center justify-center overflow-auto p-2'
      : isUnderground
      ? 'flex-1 bg-[#050710] flex items-center justify-center overflow-auto p-2'
      : isCastle
      ? 'flex-1 bg-[#080202] flex items-center justify-center overflow-auto p-2'
      : 'flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-2';

    const consoleDrawerClass = isLight
      ? 'h-44 bg-white border-t-2 border-black flex flex-col text-slate-900'
      : isUnderground
      ? 'h-44 bg-[#050710] border-t-2 border-[#2038ec] flex flex-col text-slate-200'
      : isCastle
      ? 'h-44 bg-[#080202] border-t-2 border-[#d82800] flex flex-col text-amber-200'
      : 'h-44 bg-slate-950 border-t border-slate-800 flex flex-col';

    const consoleHeaderClass = isLight
      ? 'h-7 px-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between text-[11px] text-slate-700'
      : isUnderground
      ? 'h-7 px-3 bg-[#12182b] border-b border-[#2038ec]/50 flex items-center justify-between text-[11px] text-slate-400'
      : isCastle
      ? 'h-7 px-3 bg-[#1c0a0a] border-b border-[#d82800]/50 flex items-center justify-between text-[11px] text-amber-300/70'
      : 'h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400';

    return (
      <div className={outerContainerClass}>
        {/* Preview Control Header */}
        <div className={toolbarClass}>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-semibold flex items-center space-x-1.5 ${isLight ? 'text-slate-800' : isCastle ? 'text-amber-200' : 'text-slate-300'}`}>
              <Eye className="w-3.5 h-3.5 text-[#00d800]" />
              <span className="font-arcade text-[10px]">SANDBOX PREVIEW</span>
            </span>
          </div>

          {/* Viewport switchers */}
          <div className={`flex items-center space-x-1 p-0.5 border ${isLight ? 'bg-white border-black' : isUnderground ? 'bg-[#050710] border-[#2038ec]' : isCastle ? 'bg-[#080202] border-[#d82800]' : 'bg-slate-950 border-slate-800'}`}>
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 ${
                viewport === 'desktop'
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-slate-800 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 ${
                viewport === 'tablet'
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-slate-800 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 ${
                viewport === 'mobile'
                  ? isLight
                    ? 'bg-black text-white'
                    : 'bg-slate-800 text-white'
                  : isLight
                  ? 'text-slate-600 hover:text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right actions: refresh & console */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConsole(!showConsole)}
              className={`flex items-center space-x-1 px-2 py-1 border text-xs transition-colors ${
                showConsole
                  ? isLight
                    ? 'bg-black text-white border-black'
                    : 'bg-slate-800 text-white border-slate-700'
                  : isLight
                  ? 'text-slate-700 hover:text-black border-transparent'
                  : 'text-slate-400 hover:text-white border-transparent'
              }`}
            >
              <Terminal className="w-3 h-3 text-[#38bdf8]" />
              <span className="text-[10px] font-arcade">LOGS ({logs.length})</span>
            </button>

            <button
              onClick={refreshIframe}
              className={`p-1 transition-colors ${isLight ? 'text-slate-700 hover:text-black' : 'text-slate-400 hover:text-white'}`}
              title="Reload sandbox preview"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sandboxed iframe container */}
        <div className={sandboxAreaClass}>
          <div
            style={{ width: getViewportWidth(), height: '100%', transition: 'width 0.25s ease' }}
            className={`bg-white shadow-2xl overflow-hidden border-2 flex flex-col ${isLight ? 'border-black' : isUnderground ? 'border-[#2038ec]' : isCastle ? 'border-[#d82800]' : 'border-slate-800'}`}
          >
            <iframe
              ref={iframeRef}
              title="Interactive Code Sandbox"
              sandbox="allow-scripts allow-same-origin allow-modals"
              className="w-full h-full border-0 bg-white"
            />
          </div>
        </div>

        {/* Mini Console Drawer */}
        {showConsole && (
          <div className={consoleDrawerClass}>
            <div className={consoleHeaderClass}>
              <span className="font-mono flex items-center space-x-1">
                <Terminal className="w-3 h-3 text-[#38bdf8]" />
                <span className="font-arcade text-[9px]">CONSOLE OUTPUT</span>
              </span>
              <button
                onClick={() => setLogs([])}
                className="hover:underline text-[10px] font-arcade"
              >
                CLEAR
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1">
              {logs.length === 0 ? (
                <div className={`italic ${isLight ? 'text-slate-400' : 'text-slate-600'}`}>No console logs yet.</div>
              ) : (
                logs.map((l, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 ${
                      l.type === 'error'
                        ? 'text-rose-400'
                        : l.type === 'warn'
                        ? 'text-amber-400'
                        : isLight
                        ? 'text-slate-800'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 text-[10px]">{l.time}</span>
                    <span className="break-all">{l.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
