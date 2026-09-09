'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { User } from '@/types/user';
import { Search } from 'lucide-react';

export function UsersTable({ users }: { users: User[] }) {
  const [query, setQuery] = React.useState('');

  const filtered = users.filter((user) =>
    `${user.displayName} ${user.email}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>XP</TableHead>
            <TableHead>Streak</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold shrink-0">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-100">{user.displayName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'muted'}>{user.role || 'user'}</Badge>
              </TableCell>
              <TableCell>{user.level}</TableCell>
              <TableCell>{user.xp.toLocaleString()}</TableCell>
              <TableCell>{user.currentStreak}d</TableCell>
              <TableCell className="text-slate-400">
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                No users match your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
