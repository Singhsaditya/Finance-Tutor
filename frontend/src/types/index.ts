// ─── API Request Types ────────────────────────────────────────────────────────

export interface AskRequest {
  query: string;
  top_k?: number;
  session_id?: string;
}

export interface QuizRequest {
  topic: string;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface EvaluateRequest {
  question_id: string;
  student_answer: string;
  expected_answer?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface TeachRequest {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  objectives?: string[];
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface SourceRef {
  chunk_id: string;
  file: string;
  start: number;
  end: number;
}

export interface ScoreMeta {
  relevance?: number;
  confidence?: number;
  retrieval_score?: number;
  [key: string]: number | undefined;
}

export interface AskResponse {
  answer: string;
  sources: SourceRef[];
  score_meta: ScoreMeta;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  source_refs: SourceRef[];
}

export interface QuizResponse {
  quiz_id: string;
  questions: QuizQuestion[];
}

export interface RubricItem {
  criterion: string;
  score: number;
  max: number;
  comment: string;
}

export interface EvaluateResponse {
  score: number;
  max_score: number;
  feedback: string;
  rubric: RubricItem[];
}

export interface LessonStep {
  title: string;
  content: string;
  examples?: string[];
  code_snippet?: string;
  type: 'concept' | 'example' | 'exercise' | 'summary';
}

export interface LessonResource {
  title: string;
  url?: string;
  type: 'article' | 'video' | 'book' | 'exercise';
  description?: string;
}

export interface TeachResponse {
  topic: string;
  level: string;
  estimated_time: string;
  overview: string;
  objectives: string[];
  steps: LessonStep[];
  resources: LessonResource[];
  practice_questions?: string[];
}

// ─── UI / State Types ─────────────────────────────────────────────────────────

export interface DashboardStats {
  questionsAsked: number;
  quizAttempts: number;
  avgScore: number;
  topicsLearned: number;
}

export interface ActivityItem {
  id: string;
  type: 'ask' | 'quiz' | 'evaluate' | 'teach';
  title: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  secondary?: number;
}

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentActivity: Array<{
    id: string;
    type: 'ask' | 'quiz' | 'evaluate' | 'teach';
    title: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
  }>;
}

// ─── Quiz Session Types ───────────────────────────────────────────────────────

export interface QuizAnswer {
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
}

export interface QuizSession {
  quizId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  startTime: Date;
  endTime?: Date;
  totalScore: number;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
