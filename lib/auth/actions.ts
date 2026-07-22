'use server';

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

type LoginResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

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

    // Add role to user object and store it
    const userWithRole = { ...user, role: userRole };
    cookieStore.set('user', JSON.stringify(userWithRole), {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error: any) {
    const message = error?.response?.data?.error?.message || error?.message || 'An error occurred during authentication.';
    return {
      success: false,
      error: message,
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
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
