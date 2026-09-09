export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  currentStreak: number;
};

export type LeaderboardStats = {
  totalParticipants: number;
  topStreak: number;
  topXpThisWeek: number;
};
