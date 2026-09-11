import { notFound } from 'next/navigation';
import { getTaskById, getTaskAssignmentStats, getTaskCompletionLog } from '@/lib/api/tasks';
import { TaskDetailClient } from './_components/task-detail-client';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const [assignmentStats, completionLog] = await Promise.all([
    getTaskAssignmentStats(id),
    getTaskCompletionLog(id),
  ]);

  return <TaskDetailClient task={task} assignmentStats={assignmentStats} completionLog={completionLog} />;
}
