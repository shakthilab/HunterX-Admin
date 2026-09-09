import type { User } from '@/types/user';

export type UserStats = {
  totalUsers: number;
  activeToday: number;
  avgLevel: number;
  avgStreak: number;
};

const MOCK_USERS: User[] = [
  {
    id: 'usr_1001',
    displayName: 'Ava Thompson',
    email: 'ava.thompson@example.com',
    avatarUrl: null,
    level: 14,
    xp: 8420,
    currentStreak: 21,
    longestStreak: 34,
    role: 'admin',
    createdAt: '2025-01-12T09:15:00.000Z',
  },
  {
    id: 'usr_1002',
    displayName: 'Marcus Lee',
    email: 'marcus.lee@example.com',
    avatarUrl: null,
    level: 9,
    xp: 4210,
    currentStreak: 6,
    longestStreak: 18,
    role: 'user',
    createdAt: '2025-02-03T14:22:00.000Z',
  },
  {
    id: 'usr_1003',
    displayName: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    avatarUrl: null,
    level: 21,
    xp: 15230,
    currentStreak: 45,
    longestStreak: 45,
    role: 'user',
    createdAt: '2024-11-28T08:00:00.000Z',
  },
  {
    id: 'usr_1004',
    displayName: 'Diego Fernandez',
    email: 'diego.fernandez@example.com',
    avatarUrl: null,
    level: 3,
    xp: 620,
    currentStreak: 2,
    longestStreak: 5,
    role: 'user',
    createdAt: '2025-05-19T17:41:00.000Z',
  },
  {
    id: 'usr_1005',
    displayName: 'Grace Kim',
    email: 'grace.kim@example.com',
    avatarUrl: null,
    level: 17,
    xp: 10890,
    currentStreak: 12,
    longestStreak: 29,
    role: 'user',
    createdAt: '2025-01-30T11:05:00.000Z',
  },
  {
    id: 'usr_1006',
    displayName: 'Noah Williams',
    email: 'noah.williams@example.com',
    avatarUrl: null,
    level: 6,
    xp: 2140,
    currentStreak: 0,
    longestStreak: 11,
    role: 'user',
    createdAt: '2025-06-10T20:12:00.000Z',
  },
];

export async function getUsers(): Promise<User[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/users -> { success: true, data: User[] }
  return MOCK_USERS;
}

export async function getUserStats(): Promise<UserStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/users/stats -> { success: true, data: { totalUsers: number, activeToday: number, avgLevel: number, avgStreak: number } }
  return {
    totalUsers: MOCK_USERS.length,
    activeToday: 4,
    avgLevel: 12,
    avgStreak: 14,
  };
}
