import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-8xl font-display font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">
          Page not found
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-sm">
          This page doesn't exist or has been moved. Let's get you back to learning.
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/">
            <Button leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
