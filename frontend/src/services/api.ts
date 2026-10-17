import {
  Challenge,
  ChallengeListItem,
  SubmissionResponse,
  SubmissionResultItem,
  LLMConfig,
  ConnectionTestResult,
  UserProgress,
} from '../types';

const API_BASE = '/api';

export const api = {
  async getChallenges(params?: {
    difficulty?: string;
    mode?: string;
    topic?: string;
    search?: string;
  }): Promise<ChallengeListItem[]> {
    const query = new URLSearchParams();
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.mode) query.set('mode', params.mode);
    if (params?.topic) query.set('topic', params.topic);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/challenges?${query.toString()}`);
    if (!res.ok) throw new Error(`Failed to fetch challenges (${res.status})`);
    return res.json();
  },

  async getChallenge(id: string): Promise<Challenge> {
    const res = await fetch(`${API_BASE}/challenges/${id}`);
    if (!res.ok) throw new Error(`Challenge not found (${res.status})`);
    return res.json();
  },

  async deleteChallenge(id: string): Promise<{ status: string; message: string; id: string }> {
    const res = await fetch(`${API_BASE}/challenges/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Failed to delete challenge (${res.status})`);
    return res.json();
  },

  async submitSolution(payload: {
    challenge_id: string;
    code_html: string;
    code_css: string;
    code_js: string;
    results_override?: SubmissionResultItem[];
  }): Promise<SubmissionResponse> {
    const res = await fetch(`${API_BASE}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Submission failed (${res.status})`);
    return res.json();
  },

  async getAttempts(challengeId?: string): Promise<SubmissionResponse[]> {
    const url = challengeId
      ? `${API_BASE}/submissions/attempts?challenge_id=${challengeId}`
      : `${API_BASE}/submissions/attempts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load attempts');
    return res.json();
  },

  async generateChallenge(payload: {
    topic: string;
    category?: 'html' | 'css' | 'javascript';
    difficulty: string;
    mode: string;
    learning_objective?: string;
    custom_prompt?: string;
  }): Promise<Challenge> {
    const res = await fetch(`${API_BASE}/challenges/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail?.message || errorData.detail || `Generation failed (${res.status})`);
    }
    return res.json();
  },

  async getProgress(): Promise<UserProgress> {
    const res = await fetch(`${API_BASE}/progress`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  async getLLMConfig(): Promise<LLMConfig> {
    const res = await fetch(`${API_BASE}/config/llm`);
    if (!res.ok) throw new Error('Failed to fetch LLM config');
    return res.json();
  },

  async updateLLMConfig(config: LLMConfig): Promise<LLMConfig> {
    const res = await fetch(`${API_BASE}/config/llm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error('Failed to update LLM config');
    return res.json();
  },

  async testLLMConnection(testConfig?: Partial<LLMConfig>): Promise<ConnectionTestResult> {
    const res = await fetch(`${API_BASE}/llm/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testConfig || {}),
    });
    if (!res.ok) throw new Error('Connection test failed to reach server');
    return res.json();
  },

  async getAIHint(payload: {
    challenge_id: string;
    code_html: string;
    code_css: string;
    code_js: string;
    failed_tests: string[];
    user_question?: string;
  }): Promise<{ hint: string; explanation?: string }> {
    const res = await fetch(`${API_BASE}/llm/hint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to generate AI hint');
    }
    return res.json();
  },

  async getLocalModels(baseUrl?: string): Promise<{
    online: boolean;
    models: Array<{ name: string; size_str: string; size_gb: number }>;
    count: number;
    error?: string;
  }> {
    const query = baseUrl ? `?base_url=${encodeURIComponent(baseUrl)}` : '';
    const res = await fetch(`${API_BASE}/llm/local-models${query}`);
    if (!res.ok) throw new Error('Failed to fetch local models');
    return res.json();
  },

  async startOllamaDaemon(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/llm/start-ollama`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start Ollama');
    }
    return res.json();
  },

  async pullModel(
    model: string,
    baseUrl: string,
    onProgress: (progress: {
      status: string;
      percent?: number;
      completed_mb?: number;
      total_mb?: number;
      message?: string;
    }) => void
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/llm/pull-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, base_url: baseUrl }),
    });

    if (!res.ok || !res.body) {
      throw new Error(`Failed to initiate model pull for ${model}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop() || '';

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.status === 'error') {
              throw new Error(data.message || 'Model download failed');
            }
            onProgress(data);
          } catch (e: any) {
            if (e.message && e.message.includes('Model download failed')) {
              throw e;
            }
          }
        }
      }
    }
  },
};
