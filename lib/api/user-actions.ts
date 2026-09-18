'use server';

import type { User } from '@/types/user';
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';
import { mapRawUserToUser } from '@/lib/api/user-mapper';

// Server Actions invoked directly from Client Components (the user detail
// page's Actions panel: ban/unban, XP adjustment, streak reset). Requires the
// 'use server' directive at the top of this dedicated file so these functions
// can be imported and called from 'use client' components.
//
// Each endpoint returns a raw snake_case user row (the same shape as a
// GET /admin/users list item, plus detail fields) under `data.user` — mapped
// to the frontend's User type client-side, same as the users list/detail path.

export async function banUser(id: string, reason: string): Promise<User> {
  const raw = await unwrap(apiClient.patch<ApiResponse<{ user: any }>>(`/admin/users/${id}/ban`, { reason }));
  return mapRawUserToUser(raw.user);
}

export async function unbanUser(id: string): Promise<User> {
  const raw = await unwrap(apiClient.patch<ApiResponse<{ user: any }>>(`/admin/users/${id}/unban`));
  return mapRawUserToUser(raw.user);
}

export async function adjustUserXp(id: string, delta: number, reason: string): Promise<User> {
  const raw = await unwrap(apiClient.post<ApiResponse<{ user: any }>>(`/admin/users/${id}/xp-adjustment`, { delta, reason }));
  return mapRawUserToUser(raw.user);
}

export async function resetUserStreak(id: string): Promise<User> {
  const raw = await unwrap(apiClient.post<ApiResponse<{ user: any }>>(`/admin/users/${id}/reset-streak`));
  return mapRawUserToUser(raw.user);
}
