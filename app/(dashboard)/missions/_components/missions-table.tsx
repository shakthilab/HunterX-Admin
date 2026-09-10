'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Mission, MissionDifficulty, MissionStatus } from '@/types/mission';
import { Search } from 'lucide-react';

const DIFFICULTY_VARIANT: Record<MissionDifficulty, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'danger',
};

const STATUS_VARIANT: Record<MissionStatus, 'success' | 'muted' | 'default'> = {
  active: 'success',
  draft: 'default',
  archived: 'muted',
};

export function MissionsTable({ missions }: { missions: Mission[] }) {
  const [query, setQuery] = React.useState('');

  const filtered = missions.filter((mission) =>
    `${mission.title} ${mission.category}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
        <Input
          placeholder="Search missions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mission</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>XP Reward</TableHead>
            <TableHead>Completions</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((mission) => (
            <TableRow key={mission.id}>
              <TableCell>
                <p className="font-medium text-ink">{mission.title}</p>
                <p className="text-xs text-ink-faint max-w-xs truncate">{mission.description}</p>
              </TableCell>
              <TableCell className="text-ink-muted">{mission.category}</TableCell>
              <TableCell>
                <Badge variant={DIFFICULTY_VARIANT[mission.difficulty]}>{mission.difficulty}</Badge>
              </TableCell>
              <TableCell>{mission.xpReward} XP</TableCell>
              <TableCell>{mission.completions.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[mission.status]}>{mission.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-ink-faint py-8">
                No missions match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
