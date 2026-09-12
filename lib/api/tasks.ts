import { apiClient } from '@/lib/api/client';
import type {
  Task,
  TaskStats,
  TaskType,
  VerificationMethod,
  TaskCompletionLogEntry,
  TaskAssignmentStats,
  PendingReviewItem,
  RewardEligibility,
  TaskInput,
} from '@/types/task';

export function deriveRewardEligibility(xpReward: number, method: VerificationMethod): RewardEligibility {
  if (method === 'gps_tracked' || method === 'health_sync') return xpReward >= 200 ? 'premium' : 'bonus';
  if (xpReward >= 150) return 'bonus';
  return 'standard';
}

function mapRawTaskToTask(raw: any): Task {
  return {
    id: String(raw.id),
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    tag: raw.tag || 'General',
    imageUrl: raw.image_url || raw.imageUrl || null,
    type: (raw.type?.toLowerCase() as TaskType) || 'daily',
    isDefaultDaily: Boolean(raw.is_default_daily ?? raw.isDefaultDaily),
    recurrenceDays: raw.recurrence_days || raw.recurrenceDays || null,
    startDate: raw.start_date || raw.startDate || new Date().toISOString(),
    endDate: raw.end_date || raw.endDate || null,
    levelTarget: raw.level_target ?? raw.levelTarget ?? null,
    targetValue: raw.target_value ?? raw.targetValue ?? 1,
    targetUnit: raw.target_unit || raw.targetUnit || 'unit',
    allowsPartial: Boolean(raw.allows_partial ?? raw.allowsPartial ?? true),
    xpPartial: raw.xp_partial ?? raw.xpPartial ?? null,
    xpReward: raw.xp_reward ?? raw.xpReward ?? 50,
    verificationMethod: (raw.verification_method || raw.verificationMethod || 'manual') as VerificationMethod,
    verificationConfig: raw.verification_config || raw.verificationConfig || {},
    rewardEligibility: deriveRewardEligibility(raw.xp_reward ?? raw.xpReward ?? 50, raw.verification_method || raw.verificationMethod || 'manual'),
    status: raw.status?.toLowerCase() === 'inactive' ? 'inactive' : 'active',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

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

export async function getTaskCompletionLog(taskId: string): Promise<TaskCompletionLogEntry[]> {
  try {
    const response = await apiClient.get<any>(`/admin/tasks/${taskId}/completions`);
    const resData = response.data;
    if (resData?.success && Array.isArray(resData.data)) {
      return resData.data;
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
      return resData.data;
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

export async function createTask(input: TaskInput): Promise<Task> {
  try {
    const response = await apiClient.post<any>('/admin/tasks', input);
    const resData = response.data;
    if (resData?.success && resData.data) {
      return mapRawTaskToTask(resData.data);
    }
  } catch (error) {
    console.error('Failed to create task:', error);
  }

  return {
    ...input,
    id: `tsk_${Date.now()}`,
    rewardEligibility: deriveRewardEligibility(input.xpReward, input.verificationMethod),
    createdAt: new Date().toISOString(),
  };
}

export async function updateTask(id: string, input: TaskInput): Promise<Task | null> {
  try {
    const response = await apiClient.put<any>(`/admin/tasks/${id}`, input);
    const resData = response.data;
    if (resData?.success && resData.data) {
      return mapRawTaskToTask(resData.data);
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
  return null;
}
