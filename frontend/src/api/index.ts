import axios, { AxiosError } from 'axios';
import type {
  AskRequest,
  AskResponse,
  QuizRequest,
  QuizResponse,
  EvaluateRequest,
  EvaluateResponse,
  TeachRequest,
  TeachResponse,
  SignupRequest,
  LoginRequest,
  AuthResponse,
  DashboardResponse,
} from '@/types';

type JsonRecord = Record<string, unknown>;

const api = axios.create({
  baseURL:  'http://16.171.44.185:5001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const message =
      (error.response?.data as { detail?: string })?.detail ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

function is404(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

async function postWithFallback<TResponse>(
  primaryPath: string,
  primaryPayload: unknown,
  fallbackPath: string,
  fallbackPayload: unknown
): Promise<TResponse> {
  try {
    const { data } = await api.post<TResponse>(primaryPath, primaryPayload);
    return data;
  } catch (error) {
    if (is404(error)) {
      const { data } = await api.post<TResponse>(fallbackPath, fallbackPayload);
      return data;
    }
    throw error;
  }
}

function toText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function normalizeAskResponse(raw: unknown): AskResponse {
  const obj = (raw ?? {}) as JsonRecord;
  const answer = toText(obj.answer, toText(obj.response, ''));
  const rawSources = Array.isArray(obj.sources) ? obj.sources : [];
  const rawContexts = Array.isArray(obj.contexts) ? obj.contexts : [];

  const sources =
    rawSources.length > 0
      ? (rawSources as AskResponse['sources'])
      : rawContexts.map((_, index) => ({
          chunk_id: `ctx-${index + 1}`,
          file: 'Retrieved context',
          start: index + 1,
          end: index + 1,
        }));

  return {
    answer,
    sources,
    score_meta: (obj.score_meta as AskResponse['score_meta']) ?? {},
  };
}

function normalizeQuizResponse(raw: unknown): QuizResponse {
  const obj = (raw ?? {}) as JsonRecord;

  if (typeof obj.quiz_id === 'string' && Array.isArray(obj.questions)) {
    return {
      quiz_id: obj.quiz_id,
      questions: obj.questions as QuizResponse['questions'],
    };
  }

  const mcqs = Array.isArray(obj.mcqs) ? obj.mcqs : [];
  const questions = mcqs.map((q, index) => {
    const item = q as JsonRecord;
    const options = Array.isArray(item.options)
      ? item.options.map((opt) => String(opt))
      : [];

    const answerIndex =
      typeof item.answer_index === 'number' && item.answer_index >= 0
        ? item.answer_index
        : -1;
    const answer =
      typeof item.answer === 'string'
        ? item.answer
        : answerIndex >= 0 && answerIndex < options.length
        ? options[answerIndex]
        : '';

    return {
      id: toText(item.id, `q_${index + 1}`),
      prompt: toText(item.prompt, toText(item.question, '')),
      options,
      answer,
      explanation: toText(item.explanation, ''),
      source_refs: [],
    };
  });

  return {
    quiz_id: toText(obj.quiz_id, `quiz_${Date.now()}`),
    questions,
  };
}

function normalizeEvaluateResponse(raw: unknown): EvaluateResponse {
  const obj = (raw ?? {}) as JsonRecord;

  if (
    typeof obj.score === 'number' &&
    typeof obj.max_score === 'number' &&
    typeof obj.feedback === 'string' &&
    Array.isArray(obj.rubric)
  ) {
    return {
      score: obj.score,
      max_score: obj.max_score,
      feedback: obj.feedback,
      rubric: obj.rubric as EvaluateResponse['rubric'],
    };
  }

  const legacyScore = typeof obj.score === 'number' ? obj.score : 0;
  const maxScore = typeof obj.max_score === 'number' ? obj.max_score : 10;
  const feedback = toText(obj.feedback, toText(obj.explanation, ''));
  const improvementTip = toText(obj.improvement_tip, '');

  return {
    score: legacyScore,
    max_score: maxScore,
    feedback,
    rubric: [
      {
        criterion: 'Overall',
        score: legacyScore,
        max: maxScore,
        comment: improvementTip,
      },
    ],
  };
}

function normalizeTeachResponse(raw: unknown, payload: TeachRequest): TeachResponse {
  const obj = (raw ?? {}) as JsonRecord;

  if (
    typeof obj.topic === 'string' &&
    typeof obj.level === 'string' &&
    typeof obj.estimated_time === 'string' &&
    typeof obj.overview === 'string' &&
    Array.isArray(obj.steps) &&
    Array.isArray(obj.resources)
  ) {
    return {
      topic: obj.topic,
      level: obj.level,
      estimated_time: obj.estimated_time,
      overview: obj.overview,
      objectives: Array.isArray(obj.objectives) ? (obj.objectives as string[]) : [],
      steps: obj.steps as TeachResponse['steps'],
      resources: obj.resources as TeachResponse['resources'],
      practice_questions: Array.isArray(obj.practice_questions)
        ? (obj.practice_questions as string[])
        : [],
    };
  }

  const explanation = toText(obj.explanation, '');
  const example = toText(obj.example, '');
  const nextTopic = toText(obj.next_topic, '');

  const steps: TeachResponse['steps'] = [
    {
      title: 'Concept Explanation',
      content: explanation,
      type: 'concept',
    },
  ];

  if (example) {
    steps.push({
      title: 'Example',
      content: example,
      type: 'example',
    });
  }

  if (nextTopic) {
    steps.push({
      title: 'Next Topic',
      content: `Study next: ${nextTopic}`,
      type: 'summary',
    });
  }

  return {
    topic: payload.topic,
    level: payload.level,
    estimated_time: '10-15 min',
    overview: explanation || `Intro lesson for ${payload.topic}`,
    objectives: payload.objectives ?? [],
    steps,
    resources: [],
    practice_questions: [],
  };
}

export async function askTutor(payload: AskRequest): Promise<AskResponse> {
  const data = await postWithFallback<unknown>(
    '/api/ask',
    payload,
    '/ask',
    {
      question: payload.query,
      top_k: payload.top_k,
      session_id: payload.session_id,
    }
  );
  return normalizeAskResponse(data);
}

export async function generateQuiz(payload: QuizRequest): Promise<QuizResponse> {
  const data = await postWithFallback<unknown>(
    '/api/quiz',
    payload,
    '/quiz',
    {
      topic: payload.topic,
      top_k: Math.min(10, Math.max(3, payload.count)),
      count: payload.count,
      difficulty: payload.difficulty,
    }
  );
  return normalizeQuizResponse(data);
}

export async function evaluateAnswer(payload: EvaluateRequest): Promise<EvaluateResponse> {
  const data = await postWithFallback<unknown>(
    '/api/evaluate',
    payload,
    '/evaluate',
    {
      question: payload.question_id,
      user_answer: payload.student_answer,
      reference: payload.expected_answer,
      level: payload.level,
    }
  );
  return normalizeEvaluateResponse(data);
}

export async function teachConcept(payload: TeachRequest): Promise<TeachResponse> {
  const data = await postWithFallback<unknown>(
    '/api/teach',
    payload,
    '/teach',
    {
      concept: payload.topic,
      reference:
        payload.objectives?.join('\n') ||
        `Teach ${payload.topic} for a ${payload.level} student.`,
    }
  );
  return normalizeTeachResponse(data, payload);
}

export async function signup(payload: SignupRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/signup', payload);
  return data;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

export async function getCurrentUser(): Promise<AuthResponse['user']> {
  const { data } = await api.get<{ user: AuthResponse['user'] }>('/api/auth/me');
  return data.user;
}

export async function getDashboardData(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>('/api/dashboard');
  return data;
}

export default api;
