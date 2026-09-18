'use server';

// Server Functions backing the tasks list/detail/review pages. This whole
// file must be a file-level 'use server' module (not inline per-function):
// app/(dashboard)/layout.tsx, a Client Component, imports getTasks() directly
// for a sidebar count, and Next.js disallows inline 'use server' inside any
// file that's part of a Client Component's module graph. (The sync
// deriveRewardEligibility helper lives in ./reward-eligibility.ts instead,
// since a 'use server' file's exports must all be async functions.)
// Mutating actions (create/update/review decision) live in ./task-actions.ts.

import { apiClient } from '@/lib/api/client';
import { mapRawTaskToTask } from '@/lib/api/task-mapper';
import type {
  Task,
  TaskStats,
  CompletionStatus,
  TaskCompletionLogEntry,
  TaskAssignmentStats,
  PendingReviewItem,
} from '@/types/task';

export async function getTasks(): Promise<Task[]> {
  try {
    const response = await apiClient.get<any>('/admin/tasks');
    const resData = response.data;
    if (resData?.success && Array.isArray(resData.data?.tasks)) {
      return resData.data.tasks.map(mapRawTaskToTask);
    }
    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data.map(mapRawTaskToTask);
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const tasks = await getTasks();
    return tasks.find((t) => t.id === id) ?? null;
  } catch (error) {
    return null;
  }
}

export async function getTaskStats(): Promise<TaskStats> {
  try {
    const tasks = await getTasks();
    const active = tasks.filter((t) => t.status === 'active');
    const pendingReviews = await getPendingReviews();
    return {
      totalTasks: tasks.length,
      activeTasks: active.length,
      pendingReviews: pendingReviews.length,
      avgXpReward: tasks.length ? Math.round(tasks.reduce((sum, t) => sum + t.xpReward, 0) / tasks.length) : 0,
      completionsToday: 0,
    };
  } catch (error) {
    return {
      totalTasks: 0,
      activeTasks: 0,
      pendingReviews: 0,
      avgXpReward: 0,
      completionsToday: 0,
    };
  }
}

function mapRawCompletionToEntry(raw: any): TaskCompletionLogEntry {
  return {
    id: String(raw.id),
    userId: String(raw.user_id),
    userName: raw.user_name || 'Hunter',
    hunterId: raw.hunter_id || '',
    date: raw.date || new Date().toISOString(),
    valueAchieved: raw.value_achieved ?? null,
    status: (raw.status as CompletionStatus) || 'COMPLETED',
    xpEarned: raw.xp_earned ?? 0,
  };
}

export async function getTaskCompletionLog(taskId: string): Promise<TaskCompletionLogEntry[]> {
  try {
    const response = await apiClient.get<any>(`/admin/tasks/${taskId}/completions`);
    const resData = response.data;
    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data.map(mapRawCompletionToEntry);
    }
    return [];
  } catch (error) {
    return [];
  }
}

export async function getTaskAssignmentStats(taskId: string): Promise<TaskAssignmentStats> {
  try {
    const response = await apiClient.get<any>(`/admin/tasks/${taskId}/assignment-stats`);
    const resData = response.data;
    if (resData?.success && resData.data) {
      const s = resData.data;
      return {
        usersAssigned: s.users_assigned ?? 0,
        completionRate: s.completion_rate ?? 0,
        avgCompletionTimeMin: s.avg_completion_time_min ?? 0,
      };
    }
    return { usersAssigned: 0, completionRate: 0, avgCompletionTimeMin: 0 };
  } catch (error) {
    return { usersAssigned: 0, completionRate: 0, avgCompletionTimeMin: 0 };
  }
}

export async function getPendingReviews(): Promise<PendingReviewItem[]> {
  try {
    const response = await apiClient.get<any>('/admin/tasks/review-queue');
    const resData = response.data;
    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data;
    }
    return [];
  } catch (error) {
    return [];
  }
}
