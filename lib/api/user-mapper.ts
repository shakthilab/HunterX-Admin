import type { User, UserRank } from '@/types/user';

/**
 * Maps a raw snake_case user row (as returned by GET /admin/users list items,
 * and by the ban/unban/xp-adjustment/reset-streak actions) to the frontend's
 * User type. Kept as a plain sync function in its own module (not a Server
 * Function) so both lib/api/users.ts ('use server') and lib/api/user-actions.ts
 * ('use server') can import it — a 'use server' file's exports must all be
 * async functions, so this can't live inside either of them.
 */
export function mapRawUserToUser(raw: any): User {
  const level = raw.level ?? 1;
  const heightCm = raw.height_cm ?? raw.heightCm ?? 0;
  const weightKg = raw.weight_kg ?? raw.weightKg ?? 0;
  const bmi = raw.bmi ?? (weightKg && heightCm ? Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10 : 0);

  const rawRank = String(raw.rank || 'bronze').toLowerCase();
  const validRanks: UserRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];
  const rank: UserRank = validRanks.includes(rawRank as UserRank) ? (rawRank as UserRank) : 'bronze';

  const rawAuth = Array.isArray(raw.auth_providers) && raw.auth_providers.length > 0
    ? String(raw.auth_providers[0]).toLowerCase()
    : String(raw.auth_provider || raw.authProvider || 'email').toLowerCase();
  const authProvider = rawAuth.includes('google') ? 'google' : rawAuth.includes('apple') ? 'apple' : 'email';

  return {
    id: String(raw.id),
    hunterId: raw.hunter_id || raw.hunterId || `HTR-${String(raw.id).padStart(5, '0')}`,
    displayName: raw.name || raw.displayName || raw.email?.split('@')[0] || 'Hunter',
    email: raw.email || '',
    avatarUrl: raw.avatar_url || raw.avatar_id || raw.avatarUrl || null,
    level,
    xp: raw.xp ?? 0,
    rank,
    currentStreak: raw.streak ?? raw.current_streak ?? raw.currentStreak ?? 0,
    longestStreak: raw.longest_streak ?? raw.longestStreak ?? 0,
    dragonStage: raw.dragon_stage ?? raw.dragonStage ?? 1,
    heightCm,
    weightKg,
    bmi,
    status: raw.is_banned || raw.status === 'BANNED' ? 'banned' : 'active',
    banReason: raw.ban_reason ?? raw.banReason ?? null,
    authProvider,
    role: (raw.role?.toLowerCase() as 'admin' | 'user') || 'user',
    createdAt: raw.signup_date || raw.created_at || raw.createdAt || new Date().toISOString(),
    activityLog: raw.activity_log || raw.activityLog || [],
    badges: raw.badges || [],
    rewardClaims: raw.reward_claims || raw.rewardClaims || [],
    feedbackTickets: raw.feedback_tickets || raw.feedbackTickets || [],
  };
}
