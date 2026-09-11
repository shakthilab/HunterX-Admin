import { cn } from '@/lib/utils';
import type { UserRank } from '@/types/user';

const RANK_STYLES: Record<UserRank, string> = {
  bronze: 'text-[var(--bronze-ink)] border-[var(--bronze-ink)]/25 bg-[var(--bronze-ink)]/10',
  silver: 'text-[var(--silver-ink)] border-[var(--silver-ink)]/25 bg-[var(--silver-ink)]/10',
  gold: 'text-[var(--gold-ink)] border-[var(--gold-ink)]/25 bg-[var(--gold-ink)]/10',
  platinum: 'text-ink border-line-strong bg-line/40',
  diamond: 'text-accent-ink border-accent/25 bg-accent/10',
  mythic: 'text-[var(--caution-ink)] border-[var(--caution-ink)]/25 bg-[var(--caution-ink)]/10',
};

export function RankBadge({ rank, className }: { rank: UserRank; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
        RANK_STYLES[rank],
        className
      )}
    >
      {rank}
    </span>
  );
}
