import { notFound } from 'next/navigation';
import { getTaskById } from '@/lib/api/tasks';
import { TaskForm } from '../../_components/task-form';

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Edit Task</h1>
        <p className="text-sm text-ink-muted mt-1">{task.title}</p>
      </div>
      <TaskForm initialTask={task} />
    </div>
  );
}
