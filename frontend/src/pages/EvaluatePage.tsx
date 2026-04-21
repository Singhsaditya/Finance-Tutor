import { useState } from 'react';
import { evaluateAnswer } from '@/api';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAppStore } from '@/store';

export function EvaluatePage() {
  const [question, setQuestion] = useState('What is diversification?');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [reference, setReference] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    score: number;
    max_score: number;
    feedback: string;
    rubric: Array<{ criterion: string; score: number; max: number; comment: string }>;
  } | null>(null);

  const { addActivity } = useAppStore();

  const handleSubmit = async () => {
    if (!question.trim() || !studentAnswer.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await evaluateAnswer({
        question_id: question.trim(),
        student_answer: studentAnswer.trim(),
        expected_answer: reference.trim() || undefined,
        level,
      });
      setResult(data);
      addActivity({ type: 'evaluate', title: `Evaluated: ${question.trim().slice(0, 50)}` });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const correctness =
    result && result.max_score > 0 ? (result.score / result.max_score >= 0.6 ? 'true' : 'false') : 'N/A';
  const improvementTip = result?.rubric?.[0]?.comment || 'N/A';

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <section className="card p-5 sm:p-8">
        <div className="mb-4">
          <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
            Answer Evaluator
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Score learner answers against reference context.
          </p>
        </div>

        <div className="grid gap-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input-base"
            placeholder="Question"
          />
          <textarea
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            className="input-base h-24 resize-none"
            placeholder="Student answer"
          />
          <textarea
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="input-base h-24 resize-none"
            placeholder="Optional reference context (leave blank to auto-retrieve)"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Evaluation Level
            </label>
            <div className="flex gap-2">
              {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={
                    level === l
                      ? 'px-3 py-2 rounded-lg border border-brand-500 bg-brand-500/10 text-brand-500 text-sm font-medium'
                      : 'px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] text-sm font-medium hover:border-brand-500/40'
                  }
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={loading}
            disabled={!question.trim() || !studentAnswer.trim()}
          >
            {loading ? 'Evaluating...' : 'Evaluate'}
          </Button>
        </div>

        {error ? (
          <div className="mt-3">
            <ErrorState message={error} onRetry={handleSubmit} />
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold">Score:</span> {String(result.score ?? 'N/A')} /{' '}
                {String(result.max_score ?? 10)}
              </p>
              <p className="text-sm text-[var(--text-primary)]">
                <span className="font-semibold">Correct:</span> {correctness}
              </p>
            </div>
            <p className="mt-3 text-sm text-[var(--text-primary)]">
              <span className="font-semibold">Explanation:</span> {result.feedback || 'N/A'}
            </p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">
              <span className="font-semibold">Improvement Tip:</span> {improvementTip}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
