'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import type { Task, TaskAssignmentStats, TaskCompletionLogEntry } from '@/types/task';
import { ArrowLeft, Pencil, Users, CheckCircle2, Timer, History } from 'lucide-react';

const TAB_ITEMS = [
  { value: 'assignment', label: 'Assignment Stats' },
  { value: 'history', label: 'History' },
];

export function TaskDetailClient({
  task,
  assignmentStats,
  completionLog,
}: {
  task: Task;
  assignmentStats: TaskAssignmentStats;
  completionLog: TaskCompletionLogEntry[];
}) {
  const [tab, setTab] = React.useState('assignment');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>
        <Link href={`/tasks/${task.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Task
          </Button>
        </Link>
      </div>

      <Card className="space-y-1">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-ink">{task.title}</h1>
          <Badge variant={task.status === 'active' ? 'success' : 'muted'}>{task.status}</Badge>
          <Badge variant="default">{task.rewardEligibility}</Badge>
        </div>
        <p className="text-sm text-ink-muted">{task.description}</p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Tag" value={task.tag} />
        <Field label="Type" value={task.type.replace('_', ' ')} />
        <Field label="Target" value={`${task.targetValue} ${task.targetUnit}`} />
        <Field label="XP Reward" value={`${task.xpReward} XP`} />
        <Field label="Verification" value={task.verificationMethod.replace('_', ' ')} />
        <Field label="Level Target" value={task.levelTarget ? `Level ${task.levelTarget}+` : 'None'} />
        <Field label="Allows Partial" value={task.allowsPartial ? `Yes (${task.xpPartial} XP)` : 'No'} />
        <Field label="Default Daily" value={task.isDefaultDaily ? 'Yes' : 'No'} />
      </div>

      <Card className="space-y-6">
        <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} />

        {tab === 'assignment' && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile icon={Users} label="Users Assigned" value={assignmentStats.usersAssigned} />
            <StatTile icon={CheckCircle2} label="Completion Rate" value={`${assignmentStats.completionRate}%`} />
            <StatTile icon={Timer} label="Avg Completion Time" value={`${assignmentStats.avgCompletionTimeMin} min`} />
          </div>
        )}

        {tab === 'history' && (
          completionLog.length === 0 ? (
            <EmptyState icon={History} message="No completion history yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Value Achieved</TableHead>
                  <TableHead>Verification Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completionLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.userName}</TableCell>
                    <TableCell className="text-ink-muted">{new Date(entry.date).toLocaleString()}</TableCell>
                    <TableCell>{entry.valueAchieved} {task.targetUnit}</TableCell>
                    <TableCell>
                      <Badge variant={entry.verificationStatus === 'approved' ? 'success' : entry.verificationStatus === 'pending' ? 'warning' : 'danger'}>
                        {entry.verificationStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        )}
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl border border-line bg-surface-inset/40">
      <p className="text-xs text-ink-faint uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-ink capitalize mt-1">{value}</p>
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-line bg-surface-inset/40">
      <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent-ink shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-ink-faint uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
