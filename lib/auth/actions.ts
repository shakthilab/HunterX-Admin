'use server';

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import type { User } from '@/types/user';

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload =
      typeof Buffer !== 'undefined'
        ? Buffer.from(base64, 'base64').toString('utf-8')
        : decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const DEV_MOCK_CREDENTIALS = { email: 'admin@arise.com', password: 'admin123' };

function buildDevMockUser(): User {
  return {
    id: 'dev_admin_001',
    hunterId: 'HTR-00001',
    displayName: 'Dev Admin',
    email: DEV_MOCK_CREDENTIALS.email,
    avatarUrl: null,
    level: 99,
    xp: 999999,
    rank: 'mythic',
    currentStreak: 30,
    longestStreak: 60,
    dragonStage: 5,
    heightCm: 178,
    weightKg: 74,
    bmi: 23.4,
    status: 'active',
    banReason: null,
    authProvider: 'email',
    role: 'admin',
    createdAt: new Date().toISOString(),
    activityLog: [],
    badges: [],
    rewardClaims: [],
    feedbackTickets: [],
  };
}

async function persistSession(user: User, accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set('access_token', accessToken, {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set('refresh_token', refreshToken, {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  cookieStore.set('user', JSON.stringify(user), {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function loginAction(email: string, password: string) {
  try {
    const response = await apiClient.post<any>('/auth/login', {
      email,
      password,
    });

    const resData = response.data;
    if (!resData || resData.success === false) {
      return {
        success: false,
        error: resData?.message || resData?.error?.message || 'Invalid email or password.',
      };
    }

    const data = resData.data || {};
    const accessToken = data.access_token || data.accessToken;
    const refreshToken = data.refresh_token || data.refreshToken;

    if (!accessToken) {
      return { success: false, error: 'Authentication failed: No access token provided.' };
    }

    // Extract user role directly from JWT access token payload
    const tokenPayload = parseJwtPayload(accessToken);
    const tokenRole = tokenPayload?.role || tokenPayload?.userRole;

    if (!tokenRole || String(tokenRole).toUpperCase() !== 'ADMIN') {
      return { success: false, error: 'Access denied: Admin role required.' };
    }

    const rawUser = data.user || {};
    const normalizedUser: User = {
      id: String(rawUser.id || tokenPayload?.userId || 'admin_user'),
      hunterId: rawUser.hunter_id || rawUser.hunterId || 'HTR-00001',
      displayName: rawUser.name || rawUser.displayName || 'Admin',
      email: rawUser.email || email,
      avatarUrl: rawUser.avatar_id || rawUser.avatarUrl || null,
      level: rawUser.level ?? 1,
      xp: rawUser.xp ?? 0,
      rank: rawUser.rank ?? 'bronze',
      currentStreak: rawUser.currentStreak ?? 0,
      longestStreak: rawUser.longestStreak ?? 0,
      dragonStage: rawUser.dragon_stage ?? rawUser.dragonStage ?? 1,
      heightCm: rawUser.height_cm ?? rawUser.heightCm ?? 0,
      weightKg: rawUser.weight_kg ?? rawUser.weightKg ?? 0,
      bmi: rawUser.bmi ?? 0,
      status: rawUser.is_banned ? 'banned' : (rawUser.status ?? 'active'),
      banReason: rawUser.banReason ?? null,
      authProvider: 'email',
      role: 'admin',
      createdAt: rawUser.created_at || rawUser.createdAt || new Date().toISOString(),
      activityLog: rawUser.activityLog || [],
      badges: rawUser.badges || [],
      rewardClaims: rawUser.rewardClaims || [],
      feedbackTickets: rawUser.feedbackTickets || [],
    };

    await persistSession(normalizedUser, accessToken, refreshToken || accessToken);
    return { success: true };
  } catch (error: any) {
    const isNetworkError = !error?.response;

    if (env.isDev && isNetworkError && email === DEV_MOCK_CREDENTIALS.email && password === DEV_MOCK_CREDENTIALS.password) {
      await persistSession(buildDevMockUser(), 'dev-mock-access-token', 'dev-mock-refresh-token');
      return { success: true };
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error?.message ||
      'An error occurred during authentication.';

    return {
      success: false,
      error: message,
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Best-effort revocation: still clear the local session below even if
      // the backend is unreachable or the token was already invalid.
    }
  }

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  cookieStore.delete('user');
  return { success: true };
}

export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) return null;
    return JSON.parse(userCookie.value) as User;
  } catch {
    return null;
  }
}

