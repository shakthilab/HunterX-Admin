'use server';

// Server Functions backing the users list/detail pages. Marked 'use server':
// app/(dashboard)/layout.tsx and users-client.tsx (both Client Components)
// call these directly for a sidebar count and the users table, and without
// this directive those calls bundled the backend request into the browser.
// Mutating actions (ban, XP adjustment, etc.) live in ./user-actions.ts.

import { apiClient } from '@/lib/api/client';
import type {
  User,
  UserRank,
  ApiUser,
  PaginationInfo,
  UsersQueryParams,
} from '@/types/user';

export type UserStats = {
  totalUsers: number;
  activeToday: number;
  avgLevel: number;
  avgStreak: number;
};

export type UsersListResult = {
  success: boolean;
  message?: string;
  users: ApiUser[];
  pagination: PaginationInfo;
};

export async function getUserStatsApi(): Promise<UserStats> {
  try {
    const response = await apiClient.get<any>('/admin/users/stats');
    const resData = response.data;
    if (resData?.success && resData.data?.stats) {
      const s = resData.data.stats;
      return {
        totalUsers: s.total_users ?? 0,
        activeToday: s.active_today ?? 0,
        avgLevel: s.avg_level ?? 0,
        avgStreak: s.avg_streak ?? 0,
      };
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
  }
  return { totalUsers: 0, activeToday: 0, avgLevel: 0, avgStreak: 0 };
}

export async function getUsersRanksApi(): Promise<string[]> {
  try {
    const response = await apiClient.get<any>('/admin/users/ranks');
    const resData = response.data;
    if (resData?.success && Array.isArray(resData.data?.ranks)) {
      return resData.data.ranks;
    }
  } catch (error) {
    console.error('Failed to fetch user ranks:', error);
  }
  return ['DORMANT', 'HOLLOW', 'PHANTOM', 'PREDATOR', 'VANGUARD', 'SHADOW', 'SOVEREIGN', 'MONARCH', 'VOID RULER', 'APEX CORE'];
}

export async function getUsersListApi(params: UsersQueryParams = {}): Promise<UsersListResult> {
  try {
    const queryParams: Record<string, string> = {};

    if (params.search?.trim()) queryParams.search = params.search.trim();
    if (params.rank && params.rank !== 'all') queryParams.rank = params.rank;
    if (params.level && params.level !== 'all') queryParams.level = params.level;
    if (params.status && params.status !== 'all') queryParams.status = params.status;

    if (params.start_date && params.end_date) {
      queryParams.start_date = params.start_date;
      queryParams.end_date = params.end_date;
    } else if (params.date_preset && params.date_preset !== 'all') {
      queryParams.date_preset = params.date_preset;
    }

    if (params.sort_by) queryParams.sort_by = params.sort_by;
    if (params.page && params.page > 1) queryParams.page = String(params.page);
    if (params.limit && params.limit !== 20) queryParams.limit = String(params.limit);

    const response = await apiClient.get<any>('/admin/users', { params: queryParams });
    const resData = response.data;

    if (resData?.success && resData.data) {
      return {
        success: true,
        users: resData.data.users || [],
        pagination: resData.data.pagination || {
          page: params.page || 1,
          limit: params.limit || 20,
          total_count: (resData.data.users || []).length,
          total_pages: 1,
          has_next_page: false,
        },
      };
    }

    return {
      success: false,
      message: resData?.message || 'Failed to fetch users.',
      users: [],
      pagination: { page: 1, limit: 20, total_count: 0, total_pages: 0, has_next_page: false },
    };
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message || 'Failed to fetch users.';
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      throw error; // Re-throw auth errors to be handled by caller/route load check
    }
    return {
      success: false,
      message,
      users: [],
      pagination: { page: 1, limit: 20, total_count: 0, total_pages: 0, has_next_page: false },
    };
  }
}

// Backward compatibility helpers for user details page
function mapRawUserToUser(raw: any): User {
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
    banReason: raw.ban_reason || raw.banReason || null,
    authProvider,
    role: (raw.role?.toLowerCase() as 'admin' | 'user') || 'user',
    createdAt: raw.signup_date || raw.created_at || raw.createdAt || new Date().toISOString(),
    activityLog: raw.activity_log || raw.activityLog || [],
    badges: raw.badges || [],
    rewardClaims: raw.reward_claims || raw.rewardClaims || [],
    feedbackTickets: raw.feedback_tickets || raw.feedbackTickets || [],
  };
}

export async function getUsers(): Promise<User[]> {
  const result = await getUsersListApi({ limit: 100 });
  return result.users.map(mapRawUserToUser);
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const users = await getUsers();
    return users.find((u) => u.id === id) ?? null;
  } catch (error) {
    return null;
  }
}

export async function getUserStats(): Promise<UserStats> {
  return getUserStatsApi();
}
