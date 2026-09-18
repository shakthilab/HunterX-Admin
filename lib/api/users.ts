'use server';

import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';

export type UserStats = {
  totalUsers: number;
  activeToday: number;
  avgLevel: number;
  avgStreak: number;
};

// Server Functions backing the users list/detail pages. Marked 'use server':
// app/(dashboard)/layout.tsx (a Client Component) calls getUsers() directly
// for a sidebar count, and without this directive that call bundled the
// backend request into the browser — where the httpOnly access_token cookie
// is unreadable, so every request silently went out with no Authorization
// header. Mutating actions (ban, XP adjustment, etc.) live in ./user-actions.ts.

export async function getUsers(): Promise<User[]> {
  return unwrap(apiClient.get<ApiResponse<User[]>>('/admin/users'));
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    return await unwrap(apiClient.get<ApiResponse<User>>(`/admin/users/${id}`));
  } catch (error: unknown) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export async function getUserStats(): Promise<UserStats> {
  return unwrap(apiClient.get<ApiResponse<UserStats>>('/admin/users/stats'));
}
