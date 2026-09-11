import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  name: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  delta?: number;
  href?: string;
}

export function StatCard({ name, value, icon: Icon, color = 'text-accent-ink', delta, href }: StatCardProps) {
  const content = (
    <Card className={cn('flex flex-col justify-between h-full', href && 'hover:translate-y-[-2px] hover:border-accent/30 cursor-pointer')}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{name}</span>
        <div className={`p-2 rounded-lg bg-surface-inset/60 border border-line ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold text-ink">{value}</p>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold shrink-0',
              delta >= 0 ? 'text-ok-ink' : 'text-bad-ink'
            )}
          >
            {delta >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
