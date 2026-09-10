import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/50 text-ink placeholder-ink-faint transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface-inset focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] disabled:opacity-50 disabled:pointer-events-none',
            error ? 'border-bad-ink focus:border-bad-ink focus:ring-bad-ink' : '',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-bad-ink font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
