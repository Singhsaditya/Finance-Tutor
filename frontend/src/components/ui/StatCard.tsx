import { motion } from 'framer-motion';
import { cn } from '@/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'brand' | 'accent' | 'success' | 'warning';
  index?: number;
}

const colorMap = {
  brand: {
    bg: 'from-brand-500/10 to-brand-500/5',
    icon: 'bg-brand-500/10 text-brand-500',
    border: 'border-brand-500/20',
  },
  accent: {
    bg: 'from-accent-500/10 to-accent-500/5',
    icon: 'bg-accent-500/10 text-accent-500',
    border: 'border-accent-500/20',
  },
  success: {
    bg: 'from-emerald-500/10 to-emerald-500/5',
    icon: 'bg-emerald-500/10 text-emerald-500',
    border: 'border-emerald-500/20',
  },
  warning: {
    bg: 'from-amber-500/10 to-amber-500/5',
    icon: 'bg-amber-500/10 text-amber-500',
    border: 'border-amber-500/20',
  },
};

export function StatCard({ label, value, icon, trend, color = 'brand', index = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        'card p-5 bg-gradient-to-br relative overflow-hidden',
        colors.bg,
        `border ${colors.border}`
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-xl', colors.icon)}>{icon}</div>
        {trend && (
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              trend.value >= 0
                ? 'text-emerald-600 bg-emerald-500/10'
                : 'text-rose-500 bg-rose-500/10'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-1">
        {value}
      </div>
      <div className="text-sm text-[var(--text-secondary)]">{label}</div>
      {trend && (
        <div className="text-xs text-[var(--text-tertiary)] mt-1">{trend.label}</div>
      )}
    </motion.div>
  );
}
