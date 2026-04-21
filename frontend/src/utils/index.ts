import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date to relative time string */
export function timeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

/** Format a score as a percentage */
export function formatScore(score: number, max: number): string {
  if (max === 0) return '0%';
  return `${Math.round((score / max) * 100)}%`;
}

/** Truncate text to a max length */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/** Get color for difficulty level */
export function difficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  return {
    easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    hard: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  }[difficulty];
}

/** Activity type icon mapping (lucide icon names) */
export const activityIcons: Record<string, string> = {
  ask: 'MessageCircle',
  quiz: 'ClipboardList',
  evaluate: 'CheckCircle',
  teach: 'BookOpen',
};

/** Generate mock chart data for dashboard */
export function generateActivityChartData(): Array<{ name: string; questions: number; quizzes: number }> {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((name) => ({
    name,
    questions: Math.floor(Math.random() * 15),
    quizzes: Math.floor(Math.random() * 8),
  }));
}

/** Generate mock score trend data */
export function generateScoreTrendData(): Array<{ name: string; score: number }> {
  return Array.from({ length: 7 }, (_, i) => ({
    name: `Session ${i + 1}`,
    score: 60 + Math.floor(Math.random() * 35),
  }));
}
