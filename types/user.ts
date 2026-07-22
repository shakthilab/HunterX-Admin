export type User = {
  id: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  role?: 'admin' | 'user' | string;
  createdAt: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
};
