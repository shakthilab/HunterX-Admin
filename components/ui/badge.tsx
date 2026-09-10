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
            'bg-accent/10 text-accent-ink border-accent/20': variant === 'default',
            'bg-emerald-500/10 text-ok-ink border-emerald-500/20': variant === 'success',
            'bg-amber-500/10 text-warn-ink border-amber-500/20': variant === 'warning',
            'bg-red-500/10 text-bad-ink border-red-500/20': variant === 'danger',
            'bg-line/60 text-ink-muted border-line-strong': variant === 'muted',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
