'use server';

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api/client';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

// Dev-only fallback so the admin UI can be exercised before the real backend
// exists. Only kicks in when env.isDev AND the request never reached a server
// (connection refused, DNS failure, timeout) — never when the backend responds
// with invalid credentials, and never outside development.
// TODO: API - remove this fallback once the real backend is available. Expected: POST /auth/login { email, password } -> { success: true, data: { user: User, accessToken: string, refreshToken: string } }
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
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  cookieStore.set('refresh_token', refreshToken, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  cookieStore.set('user', JSON.stringify(user), {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function loginAction(email: string, password: string) {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });

    const resData = response.data;
    if (!resData.success) {
      return { success: false, error: resData.error.message };
    }

    const { user, accessToken, refreshToken } = resData.data;

    // Check if the user is authorized as an admin
    const userRole = user.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user');
    if (userRole !== 'admin') {
      return { success: false, error: 'Access denied: Admin role required.' };
    }

    await persistSession({ ...user, role: userRole }, accessToken, refreshToken);
    return { success: true };
  } catch (error: any) {
    const isNetworkError = !error?.response;

    if (env.isDev && isNetworkError && email === DEV_MOCK_CREDENTIALS.email && password === DEV_MOCK_CREDENTIALS.password) {
      await persistSession(buildDevMockUser(), 'dev-mock-access-token', 'dev-mock-refresh-token');
      return { success: true };
    }

    const message = error?.response?.data?.error?.message || error?.message || 'An error occurred during authentication.';
    return {
      success: false,
      error:
        isNetworkError && env.isDev
          ? `${message} — dev tip: sign in with ${DEV_MOCK_CREDENTIALS.email} / ${DEV_MOCK_CREDENTIALS.password} to bypass the backend locally.`
          : message,
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
