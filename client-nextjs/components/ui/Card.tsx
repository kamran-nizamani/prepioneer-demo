import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'glass-lg' | 'solid' | 'gradient';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hover = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-2xl transition-all duration-300';
    
    const variants = {
      glass: 'bg-white/10 dark:bg-black/20 backdrop-blur-lg border border-white/20 shadow-[0_8px_32px_rgba(31,38,135,0.15)]',
      'glass-lg': 'bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(31,38,135,0.25)]',
      solid: 'bg-white dark:bg-gray-800 shadow-xl',
      gradient: 'bg-gradient-to-br from-teal-50 to-purple-50 dark:from-teal-900/20 dark:to-purple-900/20 border border-teal-200/50',
    };
    
    const hoverStyles = hover 
      ? 'hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(168,85,247,0.3)] hover:border-purple-300/50 cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
