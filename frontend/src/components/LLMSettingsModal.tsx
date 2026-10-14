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
  Sparkles,
} from 'lucide-react';
import { LLMConfig, LLMProvider, ConnectionTestResult } from '../types';
import { api } from '../services/api';

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
    try {
      await api.startOllamaDaemon();
      // Poll a couple of times for Ollama to spin up
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        const res = await api.getLocalModels(baseUrl).catch(() => ({ online: false }));
        if (res.online) {
          setOllamaOnline(true);
          refreshLocalModels();
          break;
        }
      }
    } catch (e: any) {
      alert(`Could not automatically start Ollama: ${e.message}\nPlease open Ollama from your Start menu or run 'ollama serve' in terminal.`);
    } finally {
      setStartingOllama(false);
    }
  };

  const handlePullModel = async (targetModel: string) => {
    setPullingModel(targetModel);
    setPullProgress({ status: 'Starting download request...' });
    setPullError(null);
    setPullSuccess(null);

    try {
      await api.pullModel(targetModel, baseUrl, (p) => {
        setPullProgress(p);
      });

      setPullSuccess(`Model '${targetModel}' successfully installed!`);
      setModel(targetModel);
      await refreshLocalModels();
    } catch (err: any) {
      setPullError(err.message || `Failed to install ${targetModel}`);
    } finally {
      setPullingModel(null);
    }
  };

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'local' | 'cloud') => {
    setModeType(newMode);
    setTestResult(null);
    if (newMode === 'local') {
      setProvider('ollama');
      setBaseUrl('http://localhost:11434');
      setModel('deepseek-coder:6.7b');
    } else {
      setProvider('gemini');
      setBaseUrl('https://generativelanguage.googleapis.com');
      setModel('gemini-2.5-flash');
    }
  };

  const handleProviderSelect = (p: LLMProvider) => {
    setProvider(p);
    setTestResult(null);
    if (p === 'ollama') {
      setBaseUrl('http://localhost:11434');
      setModel('deepseek-coder:6.7b');
    } else if (p === 'gemini') {
      setBaseUrl('https://generativelanguage.googleapis.com');
      setModel('gemini-2.5-flash');
    } else if (p === 'openai') {
      setBaseUrl('https://api.openai.com/v1');
      setModel('gpt-4o-mini');
    } else if (p === 'groq') {
      setBaseUrl('https://api.groq.com/openai/v1');
      setModel('llama-3.3-70b-versatile');
    } else if (p === 'anthropic') {
      setBaseUrl('https://api.anthropic.com');
      setModel('claude-3-5-sonnet-20241022');
    } else if (p === 'custom') {
      setBaseUrl('http://localhost:1234/v1');
      setModel('local-model');
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testLLMConnection({
        provider,
        base_url: baseUrl,
        model,
        api_key: apiKey,
      });
      setTestResult(res);
    } catch (err: any) {
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
    try {
      const updated = await api.updateLLMConfig({
        provider,
        base_url: baseUrl,
        model,
        api_key: apiKey,
        temperature,
      });
      onConfigSaved(updated);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111726] border border-slate-750 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Provider & Model Installer</h2>
              <p className="text-xs text-slate-400">
                Choose between local open-source LLMs with 1-click model installation, or cloud API keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Segmented Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => handleModeChange('local')}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                modeType === 'local'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Local LLM (Ollama / Localhost)</span>
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('cloud')}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
                modeType === 'cloud'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Cloud API Key (Gemini / OpenAI / Groq)</span>
            </button>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modeType === 'local' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('ollama')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'ollama'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">Ollama</div>
                    <div className="text-[10px] opacity-75">Local background daemon</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('custom')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'custom'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">LM Studio / vLLM</div>
                    <div className="text-[10px] opacity-75">Local OpenAI-compatible</div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('gemini')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'gemini'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">Google Gemini</div>
                    <div className="text-[10px] opacity-75">gemini-2.5-flash</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('openai')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'openai'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">OpenAI</div>
                    <div className="text-[10px] opacity-75">gpt-4o-mini / gpt-4o</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('groq')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'groq'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">Groq Cloud</div>
                    <div className="text-[10px] opacity-75">Ultra fast Llama-3.3</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('anthropic')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'anthropic'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">Anthropic</div>
                    <div className="text-[10px] opacity-75">Claude 3.5 Sonnet</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderSelect('custom')}
                    className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      provider === 'custom'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-white">Custom Cloud</div>
                    <div className="text-[10px] opacity-75">OpenRouter / Any API</div>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ================= LOCAL MODEL INSTALLER SECTION ================= */}
          {modeType === 'local' && provider === 'ollama' && (
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Local Model Manager & Installer
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Ollama status badge */}
                  {ollamaOnline === true ? (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ollama Online</span>
                    </span>
                  ) : ollamaOnline === false ? (
                    <span className="flex items-center space-x-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Ollama Offline</span>
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={refreshLocalModels}
                    disabled={loadingLocalModels}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Refresh local model list"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingLocalModels ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Offline Warning & Start Helper */}
              {ollamaOnline === false && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Ollama service is not reachable on {baseUrl}.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartOllama}
                    disabled={startingOllama}
                    className="flex items-center space-x-1 px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {startingOllama ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>{startingOllama ? 'Starting...' : 'Start Ollama'}</span>
                  </button>
                </div>
              )}

              {/* Installed Models list */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  Currently Installed Models:
                </span>
                {localModels.length === 0 ? (
                  <div className="text-xs text-slate-500 italic p-2 rounded bg-slate-950 border border-slate-800">
                    No models installed yet in Ollama. Choose a recommended model below to install with 1-click!
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {localModels.map((m) => {
                      const isSelected = model === m.name || model === m.model;
                      return (
                        <button
                          key={m.name}
                          type="button"
                          onClick={() => setModel(m.name)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            isSelected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                              : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                          <span className="font-semibold">{m.name}</span>
                          <span className="text-[10px] text-slate-500">({m.size_str})</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* If model not installed banner */}
              {ollamaOnline && !isCurrentModelInstalled && model.trim() && !pullingModel && (
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center space-x-2 text-indigo-300">
                    <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>
                      Model <span className="font-mono font-bold text-white">'{model}'</span> is not installed locally.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePullModel(model)}
                    className="flex items-center space-x-1 px-3 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install '{model}'</span>
                  </button>
                </div>
              )}

              {/* 1-Click Install Recommended Coding Models */}
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                  1-Click Install Recommended Coding Models:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {recommendedLocalModels.map((rec) => {
                    const isInstalled = localModels.some((m) => m.name.includes(rec.id) || m.name === rec.id);
                    const isPullingThis = pullingModel === rec.id;

                    return (
                      <div
                        key={rec.id}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                            <span>{rec.name}</span>
                            <span className="text-[10px] font-normal text-slate-500">({rec.size})</span>
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{rec.desc}</div>
                        </div>

                        {isInstalled ? (
                          <button
                            type="button"
                            onClick={() => setModel(rec.id)}
                            className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                          >
                            Select
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePullModel(rec.id)}
                            disabled={Boolean(pullingModel)}
                            className="flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shrink-0"
                          >
                            {isPullingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Download className="w-3 h-3" />
                            )}
                            <span>{isPullingThis ? 'Installing...' : 'Install'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pulling Progress Bar & Status */}
              {pullingModel && pullProgress && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center space-x-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Installing '{pullingModel}'...</span>
                    </span>
                    <span className="font-mono text-indigo-300 font-bold">
                      {pullProgress.percent !== undefined ? `${pullProgress.percent}%` : ''}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: `${pullProgress.percent || 10}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-300"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="capitalize">{pullProgress.status}</span>
                    {pullProgress.total_mb ? (
                      <span>
                        {pullProgress.completed_mb} MB / {pullProgress.total_mb} MB
                      </span>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Pull success message */}
              {pullSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pullSuccess}</span>
                </div>
              )}

              {/* Pull error message */}
              {pullError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pullError}</span>
                </div>
              )}
            </div>
          )}

          {/* Cloud API Key field */}
          {modeType === 'cloud' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  {provider.toUpperCase()} API Key
                </label>
                {provider === 'gemini' && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Get free Gemini API Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {provider === 'groq' && (
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Get free Groq Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`Enter your ${provider} API Key...`}
                  className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Model Name Input & Cloud Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Active Model Name
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. deepseek-coder:6.7b, gemini-2.5-flash, gpt-4o-mini"
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            {/* Cloud Model Presets */}
            {modeType === 'cloud' && cloudModelPresets[provider] && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500 self-center">Presets:</span>
                {cloudModelPresets[provider].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setModel(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      model === preset
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Base URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Base URL / Host Endpoint
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. http://localhost:11434"
              className="w-full bg-slate-900 border border-slate-750 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Temperature: <span className="font-mono text-emerald-400">{temperature}</span>
              </label>
              <span className="text-[10px] text-slate-500">Lower = more deterministic code & tests</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Connection Test Result Feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold">
                  {testResult.success
                    ? `Connected Successfully (${testResult.latency_ms} ms)`
                    : 'Connection Failed'}
                </div>
                <div className="text-[11px] opacity-90 break-all">{testResult.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 transition-colors disabled:opacity-50"
          >
            {testing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{testing ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                saveSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
              }`}
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : null}
              <span>{saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
