import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'muted';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
          {
            'bg-violet-600/10 text-violet-400 border-violet-500/20': variant === 'default',
            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': variant === 'success',
            'bg-amber-500/10 text-amber-400 border-amber-500/20': variant === 'warning',
            'bg-red-500/10 text-red-400 border-red-500/20': variant === 'danger',
            'bg-slate-800/60 text-slate-400 border-slate-700': variant === 'muted',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
