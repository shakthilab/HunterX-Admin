import Link from 'next/link';
import { getTasks, getTaskStats } from '@/lib/api/tasks';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Target, Zap, CheckCircle2, ClipboardList, Plus } from 'lucide-react';
import { TasksTable } from './_components/tasks-table';

export default async function TasksPage() {
  const [tasks, stats] = await Promise.all([getTasks(), getTaskStats()]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Tasks</h1>
          <p className="text-sm text-ink-muted mt-1">
            Define daily habits, assign XP rewards, and manage task availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/tasks/review">
            <Button variant="outline">
              <ClipboardList className="w-4 h-4 mr-2" /> Review Queue
              {stats.pendingReviews > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-caution-ink/15 text-caution-ink text-xs font-bold">
                  {stats.pendingReviews}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/tasks/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Create Task
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard name="Total Tasks" value={stats.totalTasks} icon={Target} color="text-accent-ink" />
        <StatCard name="Active Tasks" value={stats.activeTasks} icon={Zap} color="text-ok-ink" />
        <StatCard name="Completions Today" value={stats.completionsToday} icon={CheckCircle2} color="text-warn-ink" />
        <StatCard name="Pending Reviews" value={stats.pendingReviews} icon={ClipboardList} color="text-caution-ink" />
      </div>

      <TasksTable tasks={tasks} />
    </div>
  );
}
