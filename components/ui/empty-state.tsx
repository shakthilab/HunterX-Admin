import type { LucideIcon } from 'lucide-react';

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="w-10 h-10 rounded-xl bg-surface-inset/60 border border-line flex items-center justify-center text-ink-faint">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm text-ink-faint">{message}</p>
    </div>
  );
}
