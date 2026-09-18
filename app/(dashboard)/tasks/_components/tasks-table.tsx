'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Task, TaskType } from '@/types/task';
import { Search, ListChecks } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const TYPE_LABEL: Record<TaskType, string> = {
  DAILY_ADMIN: 'Daily',
  WEEKLY: 'Weekly',
  DAILY_FIXED: 'Daily (Fixed)',
};

export function TasksTable({ tasks }: { tasks: Task[] }) {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('all');
  const [status, setStatus] = React.useState('all');

  const filtered = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (type !== 'all' && task.taskType !== type) return false;
    if (status !== 'all' && task.status !== status) return false;
    return true;
  });

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <Input placeholder="Search by title..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="w-40">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>XP Reward</TableHead>
            <TableHead>Level Target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Link href={`/tasks/${task.id}`} className="font-medium text-ink hover:text-accent-ink transition-colors">
                  {task.title}
                </Link>
                <p className="text-xs text-ink-faint">{task.tag}</p>
              </TableCell>
              <TableCell>
                <Badge variant="default">{TYPE_LABEL[task.taskType]}</Badge>
              </TableCell>
              <TableCell>{task.xpReward} XP</TableCell>
              <TableCell className="text-ink-muted">{task.levelTarget === 'ALL' ? 'All Levels' : task.levelTarget}</TableCell>
              <TableCell>
                <Badge variant={task.status === 'active' ? 'success' : 'muted'}>{task.status}</Badge>
              </TableCell>
              <TableCell className="text-ink-muted">{formatDate(task.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filtered.length === 0 && <EmptyState icon={ListChecks} message="No data found." />}
    </Card>
  );
}
