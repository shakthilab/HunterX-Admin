import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { LeaderboardEntry } from '@/types/leaderboard';
import { Trophy } from 'lucide-react';

const RANK_COLOR: Record<number, string> = {
  1: 'text-gold-ink',
  2: 'text-silver-ink',
  3: 'text-bronze-ink',
};

export function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>XP</TableHead>
            <TableHead>Streak</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.userId}>
              <TableCell>
                <div className="flex items-center gap-1.5 font-semibold">
                  {entry.rank <= 3 && (
                    <Trophy className={`w-4 h-4 ${RANK_COLOR[entry.rank]}`} />
                  )}
                  <span className={RANK_COLOR[entry.rank] || 'text-ink-muted'}>#{entry.rank}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink text-xs font-bold shrink-0">
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium text-ink">{entry.displayName}</p>
                </div>
              </TableCell>
              <TableCell>{entry.level}</TableCell>
              <TableCell>{entry.xp.toLocaleString()}</TableCell>
              <TableCell>{entry.currentStreak}d</TableCell>
            </TableRow>
          ))}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-faint py-8">
                No leaderboard data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
