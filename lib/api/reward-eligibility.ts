import type { VerificationMethod, RewardEligibility } from '@/types/task';

/**
 * Client-safe preview of the server's reward-eligibility rule, used by the task
 * form to show a live badge as the admin edits xpReward/verificationMethod.
 * The backend recomputes this independently on create/update — this is
 * cosmetic only, never trusted as the source of truth. Kept as a plain sync
 * function in its own module (not a Server Function) so Client Components can
 * import it without pulling in lib/api/tasks.ts's 'use server' exports.
 */
export function deriveRewardEligibility(xpReward: number, method: VerificationMethod): RewardEligibility {
  if (method === 'gps_tracked' || method === 'health_sync') return xpReward >= 200 ? 'premium' : 'bonus';
  if (xpReward >= 150) return 'bonus';
  return 'standard';
}
