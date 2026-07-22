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
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-lg border border-slate-800 bg-slate-950/50 text-slate-100 placeholder-slate-500 transition-all duration-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:bg-slate-950 focus:shadow-[0_0_15px_rgba(124,58,237,0.15)] disabled:opacity-50 disabled:pointer-events-none',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
