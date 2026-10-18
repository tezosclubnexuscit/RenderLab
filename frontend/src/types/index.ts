export type Difficulty = 'easy' | 'medium' | 'hard';
export type ChallengeMode = 'fill_blanks' | 'fix_broken' | 'build_component' | 'recreate_page';
export type LLMProvider = 'ollama' | 'gemini' | 'openai' | 'groq' | 'anthropic' | 'custom';

export interface StarterCode {
  html: string;
  css: string;
  javascript: string;
}

export interface TestCase {
  test_id: string;
  description: string;
  test_type: 'dom' | 'css' | 'javascript' | 'event' | 'custom';
  selector?: string;
  property_name?: string;
  expected_value?: string;
  assertion_code?: string;
  order_index?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  mode: ChallengeMode;
  starter_code: StarterCode;
  solution_code?: StarterCode;
  requirements: string[];
  hints: string[];
  estimated_minutes: number;
  is_approved: boolean;
  tests: TestCase[];
  created_at?: string;
}

export interface ChallengeListItem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  topics: string[];
  mode: ChallengeMode;
  estimated_minutes: number;
  is_approved: boolean;
  is_solved: boolean;
  tests_count: number;
}

export interface SubmissionResultItem {
  test_id: string;
  description: string;
  passed: boolean;
  message?: string;
}

export interface SubmissionResponse {
  attempt_id: string;
  challenge_id: string;
  status: 'passed' | 'failed' | 'error';
  passed_count: number;
  total_count: number;
  execution_time_ms: number;
  results: SubmissionResultItem[];
  created_at?: string;
}

export interface LLMConfig {
  provider: LLMProvider;
  base_url: string;
  model: string;
  api_key: string;
  temperature: number;
}

export interface ConnectionTestResult {
  success: boolean;
  latency_ms: number;
  message: string;
  raw_response?: string;
}

export interface UserProgress {
  total_challenges: number;
  solved_count: number;
  completion_rate: number;
  total_attempts: number;
  accuracy_percent: number;
  streak?: number;
  difficulty: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  solved_challenge_ids: string[];
}
