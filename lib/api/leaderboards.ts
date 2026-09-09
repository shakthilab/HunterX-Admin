import type { LeaderboardEntry, LeaderboardStats } from '@/types/leaderboard';

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'usr_1003', displayName: 'Priya Sharma', avatarUrl: null, level: 21, xp: 15230, currentStreak: 45 },
  { rank: 2, userId: 'usr_1005', displayName: 'Grace Kim', avatarUrl: null, level: 17, xp: 10890, currentStreak: 12 },
  { rank: 3, userId: 'usr_1001', displayName: 'Ava Thompson', avatarUrl: null, level: 14, xp: 8420, currentStreak: 21 },
  { rank: 4, userId: 'usr_1002', displayName: 'Marcus Lee', avatarUrl: null, level: 9, xp: 4210, currentStreak: 6 },
  { rank: 5, userId: 'usr_1006', displayName: 'Noah Williams', avatarUrl: null, level: 6, xp: 2140, currentStreak: 0 },
  { rank: 6, userId: 'usr_1004', displayName: 'Diego Fernandez', avatarUrl: null, level: 3, xp: 620, currentStreak: 2 },
];

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/leaderboard?period=all_time -> { success: true, data: LeaderboardEntry[] }
  return MOCK_LEADERBOARD;
}

export async function getLeaderboardStats(): Promise<LeaderboardStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/leaderboard/stats -> { success: true, data: { totalParticipants: number, topStreak: number, topXpThisWeek: number } }
  return {
    totalParticipants: MOCK_LEADERBOARD.length,
    topStreak: Math.max(...MOCK_LEADERBOARD.map((e) => e.currentStreak)),
    topXpThisWeek: 2140,
  };
}
