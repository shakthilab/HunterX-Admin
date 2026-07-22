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

async function getAccessToken(): Promise<string | null> {
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

async function getRefreshToken(): Promise<string | null> {
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

async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('access_token', accessToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      cookieStore.set('refresh_token', refreshToken, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    } catch {}
  } else {
    document.cookie = `access_token=${encodeURIComponent(accessToken)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    document.cookie = `refresh_token=${encodeURIComponent(refreshToken)}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }
}

async function clearTokens(): Promise<void> {
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
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      `${env.apiUrl}/auth/refresh`,
      { refreshToken }
    );
    if (!data.success) return null;

    await setTokens(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
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

    const body = error.response?.data;
    if (body && typeof body === 'object' && body.success === false && body.error) {
      throw new ApiError(body.error.code, body.error.message, error.response?.status);
    }
    throw new ApiError('network_error', error.message, error.response?.status);
  }
);
