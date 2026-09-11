'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Task, TaskType, VerificationMethod } from '@/types/task';
import { Search, ListChecks, MapPin, HeartPulse, Camera, ClipboardCheck } from 'lucide-react';

const TYPE_LABEL: Record<TaskType, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  one_time: 'One-Time',
};

const VERIFICATION_ICON: Record<VerificationMethod, typeof MapPin> = {
  manual: ClipboardCheck,
  gps_tracked: MapPin,
  health_sync: HeartPulse,
  photo_review: Camera,
};

const VERIFICATION_LABEL: Record<VerificationMethod, string> = {
  manual: 'Manual',
  gps_tracked: 'GPS Tracked',
  health_sync: 'Health Sync',
  photo_review: 'Photo Review',
};

export function TasksTable({ tasks }: { tasks: Task[] }) {
  const [query, setQuery] = React.useState('');
  const [type, setType] = React.useState('all');
  const [status, setStatus] = React.useState('all');
  const [method, setMethod] = React.useState('all');

  const filtered = tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (type !== 'all' && task.type !== type) return false;
    if (status !== 'all' && task.status !== status) return false;
    if (method !== 'all' && task.verificationMethod !== method) return false;
    return true;
  });

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
          <Input placeholder="Search by title..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <div className="w-36">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="all">All Verification</option>
            {Object.entries(VERIFICATION_LABEL).map(([value, label]) => (
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
            <TableHead>Verification</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((task) => {
            const VerificationIcon = VERIFICATION_ICON[task.verificationMethod];
            return (
              <TableRow key={task.id}>
                <TableCell>
                  <Link href={`/tasks/${task.id}`} className="font-medium text-ink hover:text-accent-ink transition-colors">
                    {task.title}
                  </Link>
                  <p className="text-xs text-ink-faint">{task.tag}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="default">{TYPE_LABEL[task.type]}</Badge>
                </TableCell>
                <TableCell>{task.xpReward} XP</TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5 text-ink-muted">
                    <VerificationIcon className="w-3.5 h-3.5" /> {VERIFICATION_LABEL[task.verificationMethod]}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={task.status === 'active' ? 'success' : 'muted'}>{task.status}</Badge>
                </TableCell>
                <TableCell className="text-ink-muted">{new Date(task.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filtered.length === 0 && <EmptyState icon={ListChecks} message="No tasks match your filters." />}
    </Card>
  );
}
