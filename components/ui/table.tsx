import * as React from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-line/80">
      <table
        className={cn(
          'w-full text-sm text-left',
          // Freeze the first column so a row's identity never scrolls out of view,
          // and fade its trailing edge to hint that there's more to scroll to.
          '[&_tr>*:first-child]:sticky [&_tr>*:first-child]:left-0 [&_tr>*:first-child]:z-10',
          '[&_thead_tr>*:first-child]:bg-surface',
          '[&_tbody_tr>*:first-child]:bg-surface [&_tbody_tr:hover>*:first-child]:bg-surface-inset',
          "[&_tbody_tr>*:first-child]:after:absolute [&_tbody_tr>*:first-child]:after:inset-y-0 [&_tbody_tr>*:first-child]:after:right-0 [&_tbody_tr>*:first-child]:after:w-2 [&_tbody_tr>*:first-child]:after:content-[''] [&_tbody_tr>*:first-child]:after:bg-gradient-to-r [&_tbody_tr>*:first-child]:after:from-black/[0.04] [&_tbody_tr>*:first-child]:after:to-transparent",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('bg-surface/60 border-b border-line', className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-line/60', className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-surface/40 transition-colors', className)} {...props} />;
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'px-4 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('relative px-4 py-3 text-ink whitespace-nowrap', className)} {...props} />;
}
