import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  size?: number;
}

export function ScoreGauge({ score, maxScore, size = 160 }: ScoreGaugeProps) {
  const pct = maxScore > 0 ? score / maxScore : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  // Only 3/4 of the circle (270 degrees)
  const arcLength = circumference * 0.75;
  const dashOffset = arcLength * (1 - pct);

  const getColor = () => {
    if (pct >= 0.8) return '#10b981'; // emerald
    if (pct >= 0.6) return '#0ea5e9'; // brand blue
    if (pct >= 0.4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const color = getColor();
  const percentage = Math.round(pct * 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(135deg)' }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-display font-bold"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {percentage}%
        </motion.span>
        <span className="text-xs text-[var(--text-tertiary)] mt-0.5">
          {score}/{maxScore}
        </span>
      </div>
    </div>
  );
}
