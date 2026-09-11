'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RankBadge } from '@/components/rank-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { User, UserRank } from '@/types/user';
import { Search, Mail, Globe, Apple, Flame, UsersRound } from 'lucide-react';

const RANKS: UserRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];

const AUTH_ICON: Record<User['authProvider'], typeof Mail> = {
  email: Mail,
  google: Globe,
  apple: Apple,
};

export function UsersTable({ users }: { users: User[] }) {
  const [query, setQuery] = React.useState('');
  const [rank, setRank] = React.useState('all');
  const [levelRange, setLevelRange] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [signupWindow, setSignupWindow] = React.useState('all');

  const filtered = users.filter((user) => {
    if (query && !`${user.displayName} ${user.email} ${user.hunterId}`.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    if (rank !== 'all' && user.rank !== rank) return false;
    if (status !== 'all' && user.status !== status) return false;
    if (levelRange !== 'all') {
      const [min, max] = levelRange.split('-').map(Number);
      if (user.level < min || user.level > max) return false;
    }
    if (signupWindow !== 'all') {
      const days = Number(signupWindow);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      if (new Date(user.createdAt).getTime() < cutoff) return false;
    }
    return true;
  });

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <Input
            placeholder="Search by hunter ID, name, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="w-36">
          <Select value={rank} onChange={(e) => setRank(e.target.value)}>
            <option value="all">All Ranks</option>
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={levelRange} onChange={(e) => setLevelRange(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="1-10">Level 1–10</option>
            <option value="11-25">Level 11–25</option>
            <option value="26-40">Level 26–40</option>
          </Select>
        </div>
        <div className="w-36">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="banned">Banned</option>
          </Select>
        </div>
        <div className="w-40">
          <Select value={signupWindow} onChange={(e) => setSignupWindow(e.target.value)}>
            <option value="all">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hunter</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Rank</TableHead>
            <TableHead>Streak</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Signup Date</TableHead>
            <TableHead>Auth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user) => {
            const AuthIcon = AUTH_ICON[user.authProvider];
            return (
              <TableRow key={user.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink text-xs font-bold shrink-0">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-ink group-hover:text-accent-ink transition-colors">{user.displayName}</p>
                      <p className="text-xs text-ink-faint">{user.hunterId} · {user.email}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{user.level}</TableCell>
                <TableCell>
                  <RankBadge rank={user.rank} />
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1">
                    <Flame className={`w-3.5 h-3.5 ${user.currentStreak > 0 ? 'text-caution-ink' : 'text-ink-faint'}`} />
                    {user.currentStreak}d
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-ink-muted">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <AuthIcon className="w-4 h-4 text-ink-faint" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filtered.length === 0 && <EmptyState icon={UsersRound} message="No users match your filters." />}
    </Card>
  );
}
