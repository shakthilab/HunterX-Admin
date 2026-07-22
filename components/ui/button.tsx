import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          {
            'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] focus:ring-violet-500':
              variant === 'primary',
            'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500':
              variant === 'secondary',
            'border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500':
              variant === 'outline',
            'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 focus:ring-slate-500':
              variant === 'ghost',
            'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] focus:ring-red-500':
              variant === 'danger',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2.5 text-sm': size === 'md',
            'px-5 py-3 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
