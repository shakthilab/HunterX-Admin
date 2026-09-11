import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      <Card glow className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent-ink mb-5">
          <Icon className="w-7 h-7" />
        </div>
        <span className="text-[10px] bg-surface-inset/60 text-ink-faint px-2.5 py-1 rounded-full border border-line font-bold uppercase tracking-wider mb-4">
          Coming Soon
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-ink mb-2">{title}</h1>
        <p className="text-sm text-ink-muted max-w-md">{description}</p>
      </Card>
    </div>
  );
}
