import type { CreatableTaskType, RewardEligibility } from '@/types/task';

// Mirrors the backend's XP caps (adminTaskService.js#XP_CAP) — 10 for a
// DAILY_ADMIN task, 70 for WEEKLY. There's no verification-method concept
// in this backend's task model, so eligibility is purely how close the
// chosen XP reward sits to its type's cap.
const XP_CAP: Record<CreatableTaskType, number> = { DAILY_ADMIN: 10, WEEKLY: 70 };

/**
 * Client-safe preview of reward tiering, used by the task form to show a
 * live badge as the admin edits xpReward/taskType. Cosmetic only — the
 * backend doesn't store or recompute this, it's derived fresh wherever a
 * task is displayed (see mapRawTaskToTask in lib/api/tasks.ts). Kept as a
 * plain sync function in its own module (not a Server Function) so Client
 * Components can import it without pulling in lib/api/tasks.ts's
 * 'use server' exports.
 */
export function deriveRewardEligibility(xpReward: number, taskType: CreatableTaskType): RewardEligibility {
  return xpReward >= XP_CAP[taskType] ? 'bonus' : 'standard';
}
