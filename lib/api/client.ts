import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import type { ApiResponse } from '@/types/api';

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('access_token')?.value || null;
    } catch {
      return null;
    }
  } else {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get('refresh_token')?.value || null;
    } catch {
      return null;
    }
  } else {
    const match = document.cookie.match(/(?:^|; )refresh_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('access_token', accessToken, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
      });
      cookieStore.set('refresh_token', refreshToken, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
      });
    } catch {}
  } else {
    document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `refresh_token=${encodeURIComponent(refreshToken)}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }
}

export async function clearTokens(): Promise<void> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');
      cookieStore.delete('user');
    } catch {}
  } else {
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

apiClient.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  }

  try {
    const { data } = await axios.post<ApiResponse<{ access_token?: string; accessToken?: string; refresh_token?: string; refreshToken?: string }>>(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken }
    );

    const resData = data as any;
    if (!resData?.success || !resData?.data) {
      const msg = resData?.message || '';
      await clearTokens();
      if (typeof window !== 'undefined') {
        if (msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('banned')) {
          alert('Your account has been suspended.');
        }
        window.location.href = '/login';
      }
      return null;
    }

    const newAccessToken = resData.data.access_token || resData.data.accessToken;
    const newRefreshToken = resData.data.refresh_token || resData.data.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      await clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    await setTokens(newAccessToken, newRefreshToken);
    return newAccessToken;
  } catch (error: any) {
    const msg = error?.response?.data?.message || '';
    await clearTokens();
    if (typeof window !== 'undefined') {
      if (msg.toLowerCase().includes('suspended') || msg.toLowerCase().includes('banned')) {
        alert('Your account has been suspended.');
      }
      window.location.href = '/login';
    }
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const requestUrl = originalRequest?.url || '';

    const isExcluded =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/google') ||
      requestUrl.includes('/auth/apple') ||
      requestUrl.includes('/auth/refresh');

    const status = error.response?.status;
    const body = error.response?.data as any;
    const message = body?.message || body?.error?.message || '';

    if (message.toLowerCase().includes('suspended') || message.toLowerCase().includes('banned')) {
      await clearTokens();
      if (typeof window !== 'undefined') {
        alert('Your account has been suspended.');
        window.location.href = '/login';
      }
      throw new ApiError('forbidden', message || 'Your account has been suspended', 403);
    }

    if (status === 401 && originalRequest && !originalRequest._retried && !isExcluded) {
      originalRequest._retried = true;

      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        return apiClient(originalRequest);
      }
    }

    if (body && typeof body === 'object') {
      const errorMessage = body.message || body.error?.message || error.message;
      const errorCode = body.error?.code || 'API_ERROR';
      throw new ApiError(errorCode, errorMessage, status);
    }

    throw new ApiError('network_error', error.message, status);
  }
);
