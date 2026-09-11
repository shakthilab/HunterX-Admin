'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  value: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-line overflow-x-auto', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 cursor-pointer',
            value === item.value
              ? 'border-accent text-accent-ink'
              : 'border-transparent text-ink-muted hover:text-ink'
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
