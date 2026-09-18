'use server';

import type {
  Task,
  TaskStats,
  TaskCompletionLogEntry,
  TaskAssignmentStats,
  PendingReviewItem,
} from '@/types/task';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';

// Server Functions backing the tasks list/detail/review pages. This whole
// file must be a file-level 'use server' module (not inline per-function):
// app/(dashboard)/layout.tsx, a Client Component, imports getTasks() directly
// for a sidebar count, and Next.js disallows inline 'use server' inside any
// file that's part of a Client Component's module graph. (The sync
// deriveRewardEligibility helper lives in ./reward-eligibility.ts instead,
// since a 'use server' file's exports must all be async functions.)
// Mutating actions (create/update/review decision) live in ./task-actions.ts.

export async function getTasks(): Promise<Task[]> {
  return unwrap(apiClient.get<ApiResponse<Task[]>>('/admin/tasks'));
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    return await unwrap(apiClient.get<ApiResponse<Task>>(`/admin/tasks/${id}`));
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export async function getTaskStats(): Promise<TaskStats> {
  return unwrap(apiClient.get<ApiResponse<TaskStats>>('/admin/tasks/stats'));
}

export async function getTaskCompletionLog(taskId: string): Promise<TaskCompletionLogEntry[]> {
  return unwrap(apiClient.get<ApiResponse<TaskCompletionLogEntry[]>>(`/admin/tasks/${taskId}/completions`));
}

export async function getTaskAssignmentStats(taskId: string): Promise<TaskAssignmentStats> {
  return unwrap(apiClient.get<ApiResponse<TaskAssignmentStats>>(`/admin/tasks/${taskId}/assignment-stats`));
}

export async function getPendingReviews(): Promise<PendingReviewItem[]> {
  return unwrap(apiClient.get<ApiResponse<PendingReviewItem[]>>('/admin/tasks/review-queue'));
}
