import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  ChevronDown,
  CheckSquare,
  BookMarked,
  ArrowRight,
  Lightbulb,
  Code,
} from 'lucide-react';
import { teachConcept } from '@/api';
import type { TeachResponse, LessonStep, LoadingState } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store';
import { cn } from '@/utils';
import { Link } from 'react-router-dom';

const stepTypeConfig = {
  concept: { icon: Lightbulb, color: 'text-brand-500 bg-brand-500/10', label: 'Concept' },
  example: { icon: Code, color: 'text-accent-500 bg-accent-500/10', label: 'Example' },
  exercise: { icon: CheckSquare, color: 'text-emerald-500 bg-emerald-500/10', label: 'Exercise' },
  summary: { icon: BookMarked, color: 'text-amber-500 bg-amber-500/10', label: 'Summary' },
};

const LEARN_TOPICS = [
  'Compound interest',
  'Asset allocation',
  'Stock valuation',
  'Mutual funds vs ETFs',
  'Risk vs return',
  'Fundamental analysis',
  'Cash flow basics',
  'Retirement planning',
] as const;

export function TeachPage() {
  const [topic, setTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [status, setStatus] = useState<LoadingState>('idle');
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState<TeachResponse | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  const { addActivity, incrementStat } = useAppStore();

  const toggleStep = (i: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleTeach = async () => {
    if (!topic.trim()) return;
    setStatus('loading');
    setError('');
    setLesson(null);

    try {
      const data = await teachConcept({
        topic: topic.trim(),
        level,
      });
      setLesson(data);
      setStatus('success');
      setExpandedSteps(new Set([0]));

      addActivity({ type: 'teach', title: `Lesson: ${topic}` });
      incrementStat('topicsLearned');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
          Learn Finance
        </h1>
        <p className="text-[var(--text-secondary)] mt-1">
          Generate a structured finance lesson for your current level
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-8"
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
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
              className="input-base text-base"
            >
              <option value="">Select a topic</option>
              {LEARN_TOPICS.map((item) => (
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
                className="input-base text-base mt-2"
                onKeyDown={(e) => e.key === 'Enter' && handleTeach()}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Your Level
            </label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                    level === l
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                      : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-brand-500/40'
                  )}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4">
            <ErrorState message={error} onRetry={handleTeach} />
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <Button
            onClick={handleTeach}
            isLoading={status === 'loading'}
            size="lg"
            leftIcon={<BookOpen className="w-5 h-5" />}
            disabled={!topic.trim()}
          >
            Generate Lesson
          </Button>
          {lesson && (
            <Button variant="secondary" size="lg" onClick={() => { setLesson(null); setStatus('idle'); }}>
              New Topic
            </Button>
          )}
        </div>
      </motion.div>

      {status === 'loading' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6">
            <Skeleton className="h-6 w-2/3 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </motion.div>
      )}

      <AnimatePresence>
        {status === 'success' && lesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card p-6 bg-gradient-to-br from-brand-500/10 to-accent-500/5 border border-brand-500/20">
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <Badge variant="brand">{lesson.level}</Badge>
                <Badge variant="default">
                  <Clock className="w-3 h-3 mr-1" />
                  {lesson.estimated_time}
                </Badge>
              </div>

              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
                {lesson.topic}
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {lesson.overview}
              </p>
            </div>

            <div>
              <h3 className="font-display font-bold text-lg text-[var(--text-primary)] mb-4">
                Learning Flow ({lesson.steps.length} Steps)
              </h3>
              <div className="space-y-3">
                {lesson.steps.map((step, i) => (
                  <StepCard
                    key={i}
                    step={step}
                    index={i}
                    expanded={expandedSteps.has(i)}
                    onToggle={() => toggleStep(i)}
                  />
                ))}
              </div>
            </div>

            {lesson.practice_questions && lesson.practice_questions.length > 0 && (
              <div className="card p-6">
                <h3 className="font-display font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                  Practice Questions
                </h3>
                <div className="space-y-2">
                  {lesson.practice_questions.map((q, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-3)]">
                      <span className="text-sm font-bold text-emerald-500 w-6 flex-shrink-0">
                        {i + 1}.
                      </span>
                      <p className="text-sm text-[var(--text-primary)]">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card p-8 text-center bg-gradient-to-br from-brand-500/10 to-accent-500/5 border border-brand-500/20">
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
                Test this topic
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Generate a quiz on <span className="font-semibold">{lesson.topic}</span> and check your understanding.
              </p>
              <Link to={`/quiz?topic=${encodeURIComponent(lesson.topic)}`}>
                <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Start Finance Quiz
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepCard({
  step,
  index,
  expanded,
  onToggle,
}: {
  step: LessonStep;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = stepTypeConfig[step.type] || stepTypeConfig.concept;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-[var(--surface-3)] transition-colors"
      >
        <div className={cn('p-2 rounded-lg flex-shrink-0', config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs text-[var(--text-tertiary)]">Step {index + 1}</span>
            <Badge variant="default" className="text-[10px]">{config.label}</Badge>
          </div>
          <h4 className="font-semibold text-[var(--text-primary)] truncate">{step.title}</h4>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)] flex-shrink-0" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-[var(--border)] pt-4 space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {step.content}
              </p>

              {step.examples && step.examples.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                    Examples
                  </p>
                  <ul className="space-y-2">
                    {step.examples.map((ex, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="text-brand-500 mt-0.5">-</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
