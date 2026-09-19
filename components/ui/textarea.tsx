import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, required, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            {label}
            {required && <span className="text-bad-ink ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          aria-required={required}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/50 text-ink placeholder-ink-faint transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface-inset disabled:opacity-50 disabled:pointer-events-none resize-none',
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
Textarea.displayName = 'Textarea';
