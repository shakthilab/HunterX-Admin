import { cn } from '@/lib/utils';

const RANK_STYLE_MAP: Record<string, string> = {
  DORMANT: 'text-[var(--bronze-ink)] border-[var(--bronze-ink)]/25 bg-[var(--bronze-ink)]/10',
  HOLLOW: 'text-[var(--silver-ink)] border-[var(--silver-ink)]/25 bg-[var(--silver-ink)]/10',
  PHANTOM: 'text-[var(--gold-ink)] border-[var(--gold-ink)]/25 bg-[var(--gold-ink)]/10',
  PREDATOR: 'text-ink border-line-strong bg-line/40',
  VANGUARD: 'text-accent-ink border-accent/25 bg-accent/10',
  SHADOW: 'text-purple-400 border-purple-500/25 bg-purple-500/10',
  SOVEREIGN: 'text-amber-400 border-amber-500/25 bg-amber-500/10',
  MONARCH: 'text-rose-400 border-rose-500/25 bg-rose-500/10',
  'VOID RULER': 'text-cyan-400 border-cyan-500/25 bg-cyan-500/10',
  'APEX CORE': 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
  bronze: 'text-[var(--bronze-ink)] border-[var(--bronze-ink)]/25 bg-[var(--bronze-ink)]/10',
  silver: 'text-[var(--silver-ink)] border-[var(--silver-ink)]/25 bg-[var(--silver-ink)]/10',
  gold: 'text-[var(--gold-ink)] border-[var(--gold-ink)]/25 bg-[var(--gold-ink)]/10',
  platinum: 'text-ink border-line-strong bg-line/40',
  diamond: 'text-accent-ink border-accent/25 bg-accent/10',
  mythic: 'text-[var(--caution-ink)] border-[var(--caution-ink)]/25 bg-[var(--caution-ink)]/10',
};

export function RankBadge({ rank, className }: { rank: string; className?: string }) {
  const upper = (rank || 'DORMANT').toUpperCase();
  const style = RANK_STYLE_MAP[upper] || RANK_STYLE_MAP[rank.toLowerCase()] || 'text-accent-ink border-accent/25 bg-accent/10';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
        style,
        className
      )}
    >
      {rank}
    </span>
  );
}

