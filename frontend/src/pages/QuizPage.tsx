import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Timer,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { generateQuiz } from '@/api';
import type { QuizResponse, QuizQuestion, LoadingState } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/ErrorState';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { useAppStore } from '@/store';
import { difficultyColor, cn } from '@/utils';

type Phase = 'setup' | 'quiz' | 'results';

interface QuizAnswer {
  questionId: string;
  selected: string | null;
}

const QUIZ_TOPICS = [
  'Portfolio diversification',
  'Risk management',
  'ETF basics',
  'P/E and valuation ratios',
  'Inflation and interest rates',
  'Bond yields',
  'Technical analysis basics',
  'Personal budgeting',
] as const;

export function QuizPage() {
  const [searchParams] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('setup');
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState('');

  const initialTopic = searchParams.get('topic') ?? '';
  const [topic, setTopic] = useState(initialTopic);
  const [selectedTopic, setSelectedTopic] = useState(
    initialTopic && !QUIZ_TOPICS.includes(initialTopic as (typeof QUIZ_TOPICS)[number])
      ? '__custom__'
      : initialTopic || ''
  );
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { addActivity, incrementStat, updateAvgScore } = useAppStore();

  useEffect(() => {
    if (phase !== 'quiz' || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, submitted, timeLeft]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus('loading');
    setError('');

    try {
      const data = await generateQuiz({ topic: topic.trim(), count, difficulty });
      setQuiz(data);
      setAnswers(data.questions.map((q) => ({ questionId: q.id, selected: null })));
      setCurrentQ(0);
      setTimeLeft(count * 60);
      setSubmitted(false);
      setPhase('quiz');
      setStatus('success');

      addActivity({ type: 'quiz', title: `Quiz: ${topic}` });
      incrementStat('quizAttempts');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  const selectAnswer = (questionId: string, option: string) => {
    if (submitted) return;
    setAnswers((prev) =>
      prev.map((a) => (a.questionId === questionId ? { ...a, selected: option } : a))
    );
  };

  const handleSubmitQuiz = useCallback(() => {
    setSubmitted(true);
    setPhase('results');

    if (quiz) {
      const correct = quiz.questions.filter((q, i) => answers[i]?.selected === q.answer).length;
      updateAvgScore(correct, quiz.questions.length);
      incrementStat('topicsLearned');
    }
  }, [quiz, answers, updateAvgScore, incrementStat]);

  const resetQuiz = () => {
    setPhase('setup');
    setQuiz(null);
    setAnswers([]);
    setSubmitted(false);
    setStatus('idle');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const correctCount = quiz
    ? quiz.questions.filter((q, i) => answers[i]?.selected === q.answer).length
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
          Finance Quiz
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Generate a focused quiz to test your finance understanding
        </p>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-8 space-y-6"
          >
            <div className="text-center mb-2">
              <div className="inline-flex p-4 rounded-2xl bg-accent-500/10 text-accent-500 mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Configure Quiz
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Finance Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedTopic(value);
                  if (value !== '__custom__') {
                    setTopic(value);
                  } else {
                    setTopic('');
                  }
                }}
                className="input-base"
              >
                <option value="">Select a topic</option>
                {QUIZ_TOPICS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="__custom__">Custom topic...</option>
              </select>
              {selectedTopic === '__custom__' && (
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Type custom finance topic"
                  className="input-base mt-2"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Difficulty
              </label>
              <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
                      difficulty === d
                        ? difficultyColor(d)
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-tertiary)]'
                    )}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Questions: <span className="text-brand-500 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min={3}
                max={15}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-brand-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
                <span>3</span>
                <span>15</span>
              </div>
            </div>

            {status === 'error' && (
              <ErrorState message={error} onRetry={handleGenerate} />
            )}

            <Button
              onClick={handleGenerate}
              isLoading={status === 'loading'}
              className="w-full"
              size="lg"
              leftIcon={<ClipboardList className="w-5 h-5" />}
            >
              Start Quiz
            </Button>
          </motion.div>
        )}

        {phase === 'quiz' && quiz && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    Question {currentQ + 1} of {quiz.questions.length}
                  </span>
                  <Badge variant={difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'error'}>
                    {difficulty}
                  </Badge>
                </div>
                <div className="h-2 bg-[var(--surface-3)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full"
                    animate={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <div className={cn(
                'flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1.5 rounded-lg',
                timeLeft < 60 ? 'text-rose-500 bg-rose-500/10' : 'text-[var(--text-secondary)] bg-[var(--surface-3)]'
              )}>
                <Timer className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
              >
                <QuestionCard
                  question={quiz.questions[currentQ]}
                  selected={answers[currentQ]?.selected ?? null}
                  onSelect={(opt) => selectAnswer(quiz.questions[currentQ].id, opt)}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              <span className="text-sm text-[var(--text-secondary)]">
                {answers.filter((a) => a.selected).length}/{quiz.questions.length} answered
              </span>

              {currentQ < quiz.questions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQ((q) => Math.min(quiz.questions.length - 1, q + 1))}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Submit
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'results' && quiz && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="card p-8 text-center">
              <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-6">
                Quiz Complete
              </h2>

              <div className="flex justify-center mb-6">
                <ScoreGauge score={correctCount} maxScore={quiz.questions.length} size={180} />
              </div>

              <p className="text-[var(--text-secondary)]">
                You answered <span className="font-bold text-[var(--text-primary)]">{correctCount}</span> of{' '}
                <span className="font-bold text-[var(--text-primary)]">{quiz.questions.length}</span> correctly
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  variant="secondary"
                  onClick={resetQuiz}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  New Quiz
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)]">
                Review
              </h3>
              {quiz.questions.map((q, i) => (
                <ResultCard
                  key={q.id}
                  question={q}
                  selected={answers[i]?.selected ?? null}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  selected: string | null;
  onSelect: (opt: string) => void;
}) {
  return (
    <div className="card p-6 space-y-5">
      <p className="text-lg font-semibold text-[var(--text-primary)] leading-relaxed">
        {question.prompt}
      </p>

      <div className="space-y-3">
        {question.options.map((option, i) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelect(option)}
            className={cn(
              'w-full text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-3',
              selected === option
                ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                : 'border-[var(--border)] text-[var(--text-primary)] hover:border-brand-500/40 hover:bg-brand-500/5'
            )}
          >
            <span className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0',
              selected === option
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-[var(--border)]'
            )}>
              {String.fromCharCode(65 + i)}
            </span>
            {option}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  question,
  selected,
  index,
}: {
  question: QuizQuestion;
  selected: string | null;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCorrect = selected === question.answer;
  const hasAnswer = selected !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'card p-5 border',
        isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
          isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
        )}>
          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Q{index + 1}: {question.prompt}
          </p>

          {hasAnswer && !isCorrect && (
            <p className="text-xs text-rose-500 mb-1">
              Your answer: <span className="font-semibold">{selected}</span>
            </p>
          )}
          <p className="text-xs font-semibold text-emerald-500">
            Correct: {question.answer}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <FileText className="w-3 h-3" />
            Explanation
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-2"
              >
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--surface-3)] p-3 rounded-lg">
                  {question.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
