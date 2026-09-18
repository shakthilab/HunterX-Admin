'use server';

import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';

// Server Actions invoked directly from Client Components (the user detail
// page's Actions panel: ban/unban, XP adjustment, streak reset). Requires the
// 'use server' directive at the top of this dedicated file so these functions
// can be imported and called from 'use client' components.

export async function banUser(id: string, reason: string): Promise<User> {
  return unwrap(apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/ban`, { reason }));
}

export async function unbanUser(id: string): Promise<User> {
  return unwrap(apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/unban`));
}

export async function adjustUserXp(id: string, delta: number, reason: string): Promise<User> {
  return unwrap(apiClient.post<ApiResponse<User>>(`/admin/users/${id}/xp-adjustment`, { delta, reason }));
}

export async function resetUserStreak(id: string): Promise<User> {
  return unwrap(apiClient.post<ApiResponse<User>>(`/admin/users/${id}/reset-streak`));
}
