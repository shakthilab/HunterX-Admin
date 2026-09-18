'use server';

import type { Task, TaskInput, PendingReviewItem } from '@/types/task';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';

// Server Actions invoked directly from Client Components (the task form's
// create/update submit, and the review queue's approve/reject buttons).
// Requires the 'use server' directive at the top of this dedicated file so
// these functions can be imported and called from 'use client' components.

export async function createTask(input: TaskInput): Promise<Task> {
  return unwrap(apiClient.post<ApiResponse<Task>>('/admin/tasks', input));
}

export async function updateTask(id: string, input: TaskInput): Promise<Task | null> {
  try {
    return await unwrap(apiClient.put<ApiResponse<Task>>(`/admin/tasks/${id}`, input));
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export async function decideReview(id: string, status: 'approved' | 'rejected'): Promise<PendingReviewItem> {
  return unwrap(apiClient.post<ApiResponse<PendingReviewItem>>(`/admin/tasks/review-queue/${id}/decision`, { status }));
}
