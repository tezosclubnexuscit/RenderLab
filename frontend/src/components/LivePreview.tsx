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

    return (
      <div className="flex flex-col h-full bg-[#0d131f] relative">
        {/* Preview Control Header */}
        <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Preview</span>
            </span>
          </div>

          {/* Viewport switchers */}
          <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${
                viewport === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Desktop (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded ${
                viewport === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${
                viewport === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
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
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                showConsole
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px]">Console ({logs.length})</span>
            </button>

            <button
              onClick={refreshIframe}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reload sandbox preview"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Sandboxed iframe container */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-2">
          <div
            style={{ width: getViewportWidth(), height: '100%', transition: 'width 0.25s ease' }}
            className="bg-white rounded-md shadow-2xl overflow-hidden border border-slate-800 flex flex-col"
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
          <div className="h-44 bg-slate-950 border-t border-slate-800 flex flex-col">
            <div className="h-7 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono flex items-center space-x-1">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Console Output</span>
              </span>
              <button
                onClick={() => setLogs([])}
                className="hover:text-white text-[10px] underline"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] space-y-1">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">No console logs yet.</div>
              ) : (
                logs.map((l, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start space-x-2 ${
                      l.type === 'error'
                        ? 'text-rose-400'
                        : l.type === 'warn'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-600 text-[10px]">{l.time}</span>
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
