import { AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card p-6 flex flex-col items-center text-center gap-4"
    >
      <div className="p-3 rounded-2xl bg-rose-500/10">
        <AlertCircle className="w-8 h-8 text-rose-500" />
      </div>
      <div>
        <h3 className="font-semibold text-[var(--text-primary)] mb-1">Oops!</h3>
        <p className="text-sm text-[var(--text-secondary)]">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
}
