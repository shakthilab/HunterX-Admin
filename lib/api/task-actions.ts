'use server';

import type { Task, TaskInput, PendingReviewItem } from '@/types/task';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';
import { mapRawTaskToTask } from '@/lib/api/task-mapper';

// Server Actions invoked directly from Client Components (the task form's
// create/update submit, and the review queue's approve/reject buttons).
// Requires the 'use server' directive at the top of this dedicated file so
// these functions can be imported and called from 'use client' components.

// TaskInput (camelCase) -> the backend's actual POST/PUT /admin/tasks body
// (snake_case — see adminTaskService.js#buildTaskData). Backend errors
// (INVALID_XP_REWARD, XP_REWARD_EXCEEDS_CAP, etc.) surface as ApiError with
// a human-readable .message — the task form displays it rather than letting
// it throw uncaught.
function toTaskPayload(input: TaskInput) {
  return {
    title: input.title,
    description: input.description || null,
    tag: input.tag || null,
    image_url: input.imageUrl || null,
    task_type: input.taskType,
    is_recurring: input.isRecurring,
    start_date: input.startDate,
    end_date: input.endDate,
    level_target: input.levelTarget,
    target_value: input.targetValue,
    target_unit: input.targetUnit,
    xp_reward: input.xpReward,
    xp_partial: input.xpPartial,
    allows_partial: input.allowsPartial,
    recurrence_days: input.recurrenceDays,
  };
}

export async function createTask(input: TaskInput): Promise<Task> {
  const raw = await unwrap(apiClient.post<ApiResponse<{ task: any }>>('/admin/tasks', toTaskPayload(input)));
  return mapRawTaskToTask(raw.task);
}

export async function updateTask(id: string, input: TaskInput): Promise<Task | null> {
  try {
    const raw = await unwrap(apiClient.put<ApiResponse<{ task: any }>>(`/admin/tasks/${id}`, toTaskPayload(input)));
    return mapRawTaskToTask(raw.task);
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export async function decideReview(id: string, status: 'approved' | 'rejected'): Promise<PendingReviewItem> {
  return unwrap(apiClient.post<ApiResponse<PendingReviewItem>>(`/admin/tasks/review-queue/${id}/decision`, { status }));
}
