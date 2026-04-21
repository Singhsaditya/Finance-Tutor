import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost:
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:bg-[var(--surface-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
  danger:
    'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-all duration-200',
};

const sizes = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm',
  lg: 'text-base px-8 py-4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        style={{ opacity: disabled || isLoading ? 0.6 : 1, cursor: disabled || isLoading ? 'not-allowed' : 'pointer' }}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!isLoading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
