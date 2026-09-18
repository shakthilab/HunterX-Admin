import { deriveRewardEligibility } from '@/lib/api/reward-eligibility';
import type { Task, TaskType, LevelTarget } from '@/types/task';

const TASK_TYPES: TaskType[] = ['DAILY_ADMIN', 'WEEKLY', 'DAILY_FIXED'];
const LEVEL_TARGETS: LevelTarget[] = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

/**
 * Maps a raw snake_case task row (as returned by the backend's `tasks` table
 * shape — see prisma/schema.prisma) to the frontend's Task type. Kept as a
 * plain sync function in its own module (not a Server Function) so both
 * lib/api/tasks.ts and lib/api/task-actions.ts (both 'use server' files, so
 * their own exports must all be async) can import it — same reasoning as
 * lib/api/reward-eligibility.ts and lib/api/user-mapper.ts.
 */
export function mapRawTaskToTask(raw: any): Task {
  const taskType = TASK_TYPES.includes(raw.task_type) ? (raw.task_type as TaskType) : 'DAILY_ADMIN';
  const xpReward = raw.xp_reward ?? 10;
  return {
    id: String(raw.id),
    title: raw.title || 'Untitled Task',
    description: raw.description || '',
    tag: raw.tag || 'General',
    imageUrl: raw.image_url || null,
    taskType,
    isDefaultDaily: Boolean(raw.is_default_daily),
    isRecurring: Boolean(raw.is_recurring),
    recurrenceDays: Array.isArray(raw.recurrence_days) ? raw.recurrence_days : [],
    startDate: raw.start_date || null,
    endDate: raw.end_date || null,
    levelTarget: LEVEL_TARGETS.includes(raw.level_target) ? raw.level_target : 'ALL',
    targetValue: raw.target_value ?? null,
    targetUnit: raw.target_unit || null,
    allowsPartial: Boolean(raw.allows_partial),
    xpPartial: raw.xp_partial ?? 0,
    xpReward,
    rewardEligibility: deriveRewardEligibility(xpReward, taskType === 'WEEKLY' ? 'WEEKLY' : 'DAILY_ADMIN'),
    status: raw.is_active === false ? 'inactive' : 'active',
    createdAt: raw.created_at || new Date().toISOString(),
  };
}
