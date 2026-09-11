import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none px-3.5 py-2.5 pr-9 rounded-lg border border-line bg-surface-inset/50 text-ink transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface-inset disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
