import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, glow = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-line/80 bg-surface/50 backdrop-blur-md p-6 text-ink transition-all duration-300',
          glow ? 'shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] hover:border-accent/30' : '',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
