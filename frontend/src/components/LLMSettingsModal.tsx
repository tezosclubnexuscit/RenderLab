import React, { useState, useEffect } from 'react';
import {
  X,
  Cpu,
  Key,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  Download,
  HardDrive,
  Play,
  RefreshCw,
} from 'lucide-react';
import { LLMConfig, LLMProvider, ConnectionTestResult } from '../types';
import { api } from '../services/api';
import { marioSound } from '../services/soundService';
import { useTheme } from '../context/ThemeContext';

interface LLMSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: LLMConfig | null;
  onConfigSaved: (newConfig: LLMConfig) => void;
}

interface LocalModelInfo {
  name: string;
  model?: string;
  size_str: string;
  size_gb: number;
}

export const LLMSettingsModal: React.FC<LLMSettingsModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onConfigSaved,
}) => {
  const [modeType, setModeType] = useState<'local' | 'cloud'>('local');
  const [provider, setProvider] = useState<LLMProvider>('ollama');
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [model, setModel] = useState('deepseek-coder:6.7b');
  const [apiKey, setApiKey] = useState('');
  const [temperature, setTemperature] = useState(0.3);
  const [showApiKey, setShowApiKey] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Model Installer State
  const [localModels, setLocalModels] = useState<LocalModelInfo[]>([]);
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);
  const [loadingLocalModels, setLoadingLocalModels] = useState(false);
  const [startingOllama, setStartingOllama] = useState(false);
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<{
    status: string;
    percent?: number;
    completed_mb?: number;
    total_mb?: number;
  } | null>(null);
  const [pullError, setPullError] = useState<string | null>(null);
  const [pullSuccess, setPullSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentConfig) {
      setProvider(currentConfig.provider);
      setBaseUrl(currentConfig.base_url || '');
      setModel(currentConfig.model || '');
      setApiKey(currentConfig.api_key || '');
      setTemperature(currentConfig.temperature ?? 0.3);

      const isCloud = ['gemini', 'openai', 'groq', 'anthropic'].includes(currentConfig.provider);
      setModeType(isCloud ? 'cloud' : 'local');
    }
  }, [currentConfig, isOpen]);

  // Load local models when modal opens or baseUrl changes
  useEffect(() => {
    if (isOpen && modeType === 'local' && provider === 'ollama') {
      refreshLocalModels();
    }
  }, [isOpen, modeType, provider, baseUrl]);

  const refreshLocalModels = async () => {
    setLoadingLocalModels(true);
    try {
      const res = await api.getLocalModels(baseUrl);
      setOllamaOnline(res.online);
      setLocalModels(res.models || []);
    } catch {
      setOllamaOnline(false);
      setLocalModels([]);
    } finally {
      setLoadingLocalModels(false);
    }
  };

  const handleStartOllama = async () => {
    setStartingOllama(true);
    marioSound.playJump();
    try {
      const res = await api.startOllama();
      if (res.status === 'success' || (res as any).success) {
        setOllamaOnline(true);
        marioSound.play1Up();
        refreshLocalModels();
      }
    } catch {
      setOllamaOnline(false);
    } finally {
      setStartingOllama(false);
    }
  };

  const handlePullModel = async (modelToPull: string) => {
    setPullingModel(modelToPull);
    setPullProgress({ status: 'Starting download pipe...' });
    setPullError(null);
    setPullSuccess(null);
    marioSound.playPipe();

    try {
      await api.pullLocalModel(modelToPull, baseUrl, (prog: any) => {
        setPullProgress({
          status: prog.status,
          percent: prog.percent,
          completed_mb: prog.completed_mb,
          total_mb: prog.total_mb,
        });
      });

      marioSound.playStageClear();
      setPullSuccess(`Successfully installed ${modelToPull}!`);
      setModel(modelToPull);
      refreshLocalModels();
    } catch (err: any) {
      marioSound.playBlockBump();
      setPullError(err.message || 'Failed to download model');
    } finally {
      setPullingModel(null);
    }
  };

  const handleModeChange = (newMode: 'local' | 'cloud') => {
    marioSound.playPipe();
    setModeType(newMode);
    setTestResult(null);
    if (newMode === 'local') {
      setProvider('ollama');
      setBaseUrl('http://localhost:11434');
      setModel('deepseek-coder:6.7b');
    } else {
      setProvider('gemini');
      setModel('gemini-2.5-flash');
      setBaseUrl('');
    }
  };

  const handleProviderSelect = (p: LLMProvider) => {
    marioSound.playBlockBump();
    setProvider(p);
    setTestResult(null);

    if (p === 'ollama') {
      setBaseUrl('http://localhost:11434');
      setModel('deepseek-coder:6.7b');
    } else if (p === 'gemini') {
      setModel('gemini-2.5-flash');
      setBaseUrl('');
    } else if (p === 'openai') {
      setModel('gpt-4o-mini');
      setBaseUrl('');
    } else if (p === 'groq') {
      setModel('llama-3.3-70b-versatile');
      setBaseUrl('');
    } else if (p === 'anthropic') {
      setModel('claude-3-5-sonnet-20241022');
      setBaseUrl('');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    marioSound.playJump();

    try {
      const res = await api.testLLMConnection({
        provider,
        base_url: baseUrl,
        model,
        api_key: apiKey,
        temperature,
      });
      setTestResult(res);
      if (res.success) {
        marioSound.playCoin();
      } else {
        marioSound.playBlockBump();
      }
    } catch (err: any) {
      marioSound.playBlockBump();
      setTestResult({
        success: false,
        latency_ms: 0,
        message: err.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    marioSound.playJump();
    try {
      const updated = await api.updateLLMConfig({
        provider,
        base_url: baseUrl,
        model,
        api_key: apiKey,
        temperature,
      });
      onConfigSaved(updated);
      marioSound.play1Up();
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const isCurrentModelInstalled = localModels.some(
    (m) =>
      m.name === model ||
      m.name === `${model}:latest` ||
      (m.name.includes(':') && m.name.split(':')[0] === model.split(':')[0])
  );

  const recommendedLocalModels = [
    { id: 'qwen2.5-coder:1.5b', name: 'Qwen 2.5 Coder 1.5B', size: '~1.0 GB', desc: 'Fast, lightweight & instant' },
    { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B', size: '~4.7 GB', desc: 'Top-tier frontend & JS coding' },
    { id: 'deepseek-coder:6.7b', name: 'DeepSeek Coder 6.7B', size: '~3.8 GB', desc: 'LeetCode & web development specialist' },
    { id: 'llama3:8b', name: 'Llama 3 8B', size: '~4.7 GB', desc: 'Meta general coding model' },
  ];

  const cloudModelPresets: Record<string, string[]> = {
    gemini: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
    groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  };

  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl border-4 shadow-[8px_8px_0px_#000] flex flex-col font-pixel ${
          isLight ? 'bg-white border-black text-slate-900' : 'bg-[#000000] border-white text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b-2 border-black flex items-center justify-between bg-[#0050d0] text-white">
          <div className="flex items-center space-x-2.5">
            <div className="text-2xl">⚡</div>
            <div>
              <h2 className="font-arcade text-xs text-[#fcd800] !text-[#fcd800] drop-shadow-[1px_1px_0px_#000]">
                AI PROVIDER &amp; MODEL INSTALLER
              </h2>
              <p className="font-pixel text-[11px] text-white/90">
                Choose between local Ollama chiptune models or cloud API keys
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              marioSound.playBlockBump();
              onClose();
            }}
            className="mario-btn mario-btn-dark px-2 py-0.5 text-xs font-arcade"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Segmented Mode Switcher */}
          <div
            className={`grid grid-cols-2 gap-2 p-1.5 border-2 ${
              isLight ? 'bg-slate-100 border-black' : 'bg-black border-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => handleModeChange('local')}
              className={`mario-btn py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-2 ${
                modeType === 'local'
                  ? 'mario-btn-green text-white'
                  : isLight
                  ? 'bg-white text-slate-700 border-2 border-slate-300 hover:text-black hover:border-black'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>🍄 LOCAL (OLLAMA)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('cloud')}
              className={`mario-btn py-2 px-3 text-[10px] font-arcade flex items-center justify-center space-x-2 ${
                modeType === 'cloud'
                  ? 'mario-btn-yellow text-black'
                  : isLight
                  ? 'bg-white text-slate-700 border-2 border-slate-300 hover:text-black hover:border-black'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <span>⭐ CLOUD API KEY</span>
            </button>
          </div>

          {/* Provider Selection */}
          <div>
            <label
              className={`block font-arcade text-[10px] mb-2 ${
                isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
              }`}
            >
              SELECT PROVIDER
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modeType === 'local' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('ollama')}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      provider === 'ollama'
                        ? isLight
                          ? 'border-[#00a800] bg-emerald-50 text-emerald-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-[#00d800] bg-emerald-950/40 text-emerald-300 shadow-[2px_2px_0px_#000]'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-black'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`font-arcade text-[10px] ${
                        isLight ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    >
                      OLLAMA
                    </div>
                    <div
                      className={`text-[10px] font-pixel mt-0.5 ${
                        isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 opacity-75'
                      }`}
                    >
                      Local background daemon
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('custom')}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      provider === 'custom'
                        ? isLight
                          ? 'border-[#00a800] bg-emerald-50 text-emerald-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-[#00d800] bg-emerald-950/40 text-emerald-300 shadow-[2px_2px_0px_#000]'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-black'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`font-arcade text-[10px] ${
                        isLight ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    >
                      LM STUDIO
                    </div>
                    <div
                      className={`text-[10px] font-pixel mt-0.5 ${
                        isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 opacity-75'
                      }`}
                    >
                      Local vLLM / OpenAI
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('gemini')}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      provider === 'gemini'
                        ? isLight
                          ? 'border-[#fc9838] bg-amber-50 text-amber-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-[#fc9838] bg-amber-950/40 text-amber-300 shadow-[2px_2px_0px_#000]'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-black'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`font-arcade text-[10px] ${
                        isLight ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    >
                      GEMINI
                    </div>
                    <div
                      className={`text-[10px] font-pixel mt-0.5 ${
                        isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 opacity-75'
                      }`}
                    >
                      gemini-2.5-flash
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('openai')}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      provider === 'openai'
                        ? isLight
                          ? 'border-[#fc9838] bg-amber-50 text-amber-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-[#fc9838] bg-amber-950/40 text-amber-300 shadow-[2px_2px_0px_#000]'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-black'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`font-arcade text-[10px] ${
                        isLight ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    >
                      OPENAI
                    </div>
                    <div
                      className={`text-[10px] font-pixel mt-0.5 ${
                        isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 opacity-75'
                      }`}
                    >
                      gpt-4o-mini
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('groq')}
                    className={`p-2.5 border-2 text-left text-xs transition-all ${
                      provider === 'groq'
                        ? isLight
                          ? 'border-[#fc9838] bg-amber-50 text-amber-950 font-bold shadow-[2px_2px_0px_#000]'
                          : 'border-[#fc9838] bg-amber-950/40 text-amber-300 shadow-[2px_2px_0px_#000]'
                        : isLight
                        ? 'border-slate-300 bg-white text-slate-700 hover:border-black'
                        : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`font-arcade text-[10px] ${
                        isLight ? 'text-slate-950 font-bold' : 'text-white'
                      }`}
                    >
                      GROQ
                    </div>
                    <div
                      className={`text-[10px] font-pixel mt-0.5 ${
                        isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 opacity-75'
                      }`}
                    >
                      Fast Llama-3.3
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ================= LOCAL MODEL INSTALLER SECTION ================= */}
          {modeType === 'local' && provider === 'ollama' && (
            <div
              className={`p-3.5 border-2 space-y-3 ${
                isLight ? 'bg-slate-50 border-black text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-[#00d800]'}`} />
                  <span
                    className={`font-arcade text-[10px] uppercase tracking-wider ${
                      isLight ? 'text-slate-950 font-bold' : 'text-white'
                    }`}
                  >
                    LOCAL MODEL MANAGER &amp; INSTALLER
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {ollamaOnline === true ? (
                    <span className="font-arcade text-[8px] text-white bg-[#00a800] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                      ● OLLAMA ONLINE
                    </span>
                  ) : ollamaOnline === false ? (
                    <span className="font-arcade text-[8px] text-white bg-[#e52521] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000]">
                      ● OFFLINE
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={refreshLocalModels}
                    disabled={loadingLocalModels}
                    className={`p-1 border transition-colors ${
                      isLight
                        ? 'border-slate-300 hover:border-black bg-white text-slate-800'
                        : 'border-slate-700 hover:border-white text-white'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLocalModels ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Offline Warning */}
              {ollamaOnline === false && (
                <div className="p-3 bg-red-100 border-2 border-red-600 text-xs text-red-900 flex items-center justify-between font-bold">
                  <span>Ollama is not reachable on {baseUrl}.</span>
                  <button
                    type="button"
                    onClick={handleStartOllama}
                    disabled={startingOllama}
                    className="mario-btn mario-btn-yellow px-2 py-0.5 text-[9px] font-arcade text-black"
                  >
                    {startingOllama ? 'STARTING...' : 'START OLLAMA'}
                  </button>
                </div>
              )}

              {/* Installed Models list */}
              <div>
                <span
                  className={`font-arcade text-[9px] block mb-1 ${
                    isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                  }`}
                >
                  INSTALLED MODELS:
                </span>
                {localModels.length === 0 ? (
                  <div
                    className={`text-xs italic p-2 border ${
                      isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-black border-slate-800 text-slate-400'
                    }`}
                  >
                    No models in Ollama yet. Install a recommended model below!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {localModels.map((m) => {
                      const isSelected = model === m.name || model === m.model;
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => {
                            marioSound.playBlockBump();
                            setModel(m.name);
                          }}
                          className={`flex items-center space-x-1.5 px-2 py-1 text-xs font-mono border transition-all ${
                            isSelected
                              ? 'bg-[#00a800] text-white border-black shadow-[2px_2px_0px_#000]'
                              : isLight
                              ? 'bg-white text-slate-800 border-slate-300 hover:border-black'
                              : 'bg-black text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          <span className="font-bold">{m.name}</span>
                          <span className="text-[10px] opacity-75">({m.size_str})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommended Coding Models */}
              <div>
                <span
                  className={`font-arcade text-[9px] block mb-1.5 ${
                    isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                  }`}
                >
                  1-CLICK INSTALL CODING MODELS:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {recommendedLocalModels.map((rec) => {
                    const isInstalled = localModels.some((m) => m.name.includes(rec.id) || m.name === rec.id);
                    const isPullingThis = pullingModel === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className={`p-2 border flex items-center justify-between gap-2 ${
                          isLight ? 'bg-white border-slate-300' : 'bg-black border-slate-700'
                        }`}
                      >
                        <div>
                          <div
                            className={`text-xs font-bold ${
                              isLight ? 'text-slate-950' : 'text-white'
                            }`}
                          >
                            {rec.name} <span className="text-[9px] text-slate-500">({rec.size})</span>
                          </div>
                          <div
                            className={`text-[10px] ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}
                          >
                            {rec.desc}
                          </div>
                        </div>

                        {isInstalled ? (
                          <button
                            type="button"
                            onClick={() => {
                              marioSound.playBlockBump();
                              setModel(rec.id);
                            }}
                            className="mario-btn mario-btn-green px-2 py-0.5 text-[8px] font-arcade shrink-0"
                          >
                            SELECT
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePullModel(rec.id)}
                            disabled={Boolean(pullingModel)}
                            className="mario-btn mario-btn-yellow px-2 py-0.5 text-[8px] font-arcade text-black shrink-0 disabled:opacity-50"
                          >
                            {isPullingThis ? 'DOWNLOADING...' : 'INSTALL'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pulling Progress */}
              {pullingModel && pullProgress && (
                <div
                  className={`p-3 border-2 space-y-1.5 animate-in fade-in ${
                    isLight ? 'bg-amber-50 border-[#fc9838]' : 'bg-black border-[#fc9838]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-arcade">
                    <span className={isLight ? 'text-amber-950 font-bold' : 'text-[#fcd800]'}>
                      DOWNLOADING '{pullingModel}'...
                    </span>
                    <span className={isLight ? 'text-slate-900 font-bold' : 'text-white'}>
                      {pullProgress.percent !== undefined ? `${pullProgress.percent}%` : ''}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 border border-slate-400 overflow-hidden">
                    <div
                      style={{ width: `${pullProgress.percent || 10}%` }}
                      className="h-full bg-[#00a800] transition-all duration-300"
                    />
                  </div>
                  <div className={`text-[10px] font-mono ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                    {pullProgress.status}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Model Name Input */}
          <div>
            <label
              className={`block font-arcade text-[10px] mb-1 ${
                isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
              }`}
            >
              MODEL NAME / IDENTIFIER
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`w-full border-2 px-3 py-1.5 text-xs font-mono focus:outline-none ${
                isLight
                  ? 'bg-white border-black text-slate-950 font-bold focus:border-[#0050d0] placeholder-slate-400'
                  : 'bg-slate-950 border-slate-700 text-white focus:border-[#fcd800] placeholder-slate-500'
              }`}
            />
          </div>

          {/* API Key for Cloud */}
          {modeType === 'cloud' && (
            <div>
              <label
                className={`block font-arcade text-[10px] mb-1 ${
                  isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
                }`}
              >
                API KEY
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste cloud API key..."
                  className={`w-full border-2 px-3 py-1.5 text-xs font-mono focus:outline-none ${
                    isLight
                      ? 'bg-white border-black text-slate-950 font-bold focus:border-[#0050d0] placeholder-slate-400'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-[#fcd800] placeholder-slate-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`absolute right-2.5 top-2 ${isLight ? 'text-slate-600 hover:text-black' : 'text-slate-400 hover:text-white'}`}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Base URL */}
          <div>
            <label
              className={`block font-arcade text-[10px] mb-1 ${
                isLight ? 'text-slate-900 font-bold' : 'text-[#fcd800]'
              }`}
            >
              BASE URL / ENDPOINT
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. http://localhost:11434"
              className={`w-full border-2 px-3 py-1.5 text-xs font-mono focus:outline-none ${
                isLight
                  ? 'bg-white border-black text-slate-950 font-bold focus:border-[#0050d0] placeholder-slate-400'
                  : 'bg-slate-950 border-slate-700 text-white focus:border-[#fcd800] placeholder-slate-500'
              }`}
            />
          </div>

          {/* Connection Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3 border-2 text-xs flex items-start space-x-2.5 ${
                testResult.success
                  ? isLight
                    ? 'bg-emerald-50 border-[#00a800] text-emerald-950 font-bold'
                    : 'bg-emerald-950 border-[#00d800] text-emerald-300'
                  : isLight
                  ? 'bg-red-50 border-red-600 text-red-950 font-bold'
                  : 'bg-red-950 border-red-600 text-red-200'
              }`}
            >
              <div>
                <div className="font-arcade text-[9px] mb-0.5">
                  {testResult.success
                    ? `SUCCESSFULLY CONNECTED (${testResult.latency_ms}ms)`
                    : 'CONNECTION FAILED'}
                </div>
                <div className="font-pixel text-xs">{testResult.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div
          className={`px-5 py-3 border-t-2 flex items-center justify-between ${
            isLight ? 'bg-slate-100 border-black' : 'bg-black border-white'
          }`}
        >
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="mario-btn mario-btn-blue px-3 py-1.5 text-[10px] font-arcade flex items-center space-x-1.5 disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            <span>{testing ? 'TESTING...' : 'TEST LINK'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                marioSound.playBlockBump();
                onClose();
              }}
              className={`mario-btn px-3 py-1.5 text-[10px] font-arcade ${
                isLight ? 'bg-slate-200 text-slate-800 border-2 border-black hover:bg-slate-300' : 'mario-btn-dark'
              }`}
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="mario-btn mario-btn-green px-4 py-1.5 text-[10px] font-arcade flex items-center space-x-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              <span>{saving ? 'SAVING...' : saveSuccess ? 'SAVED!' : 'SAVE SETTINGS'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
