export type UserRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'mythic';
export type UserStatus = 'active' | 'banned';
export type AuthProvider = 'email' | 'google' | 'apple';

export type UserActivityLogEntry = {
  id: string;
  taskTitle: string;
  completedAt: string;
  xpEarned: number;
  verificationStatus: 'approved' | 'pending' | 'rejected';
};

export type UserBadge = {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
};

export type UserRewardClaim = {
  id: string;
  rewardName: string;
  type: 'coupon' | 'cosmetic' | 'xp_boost';
  claimedAt: string;
};

export type UserFeedbackTicket = {
  id: string;
  subject: string;
  message: string;
  rating: number | null;
  status: 'open' | 'resolved';
  createdAt: string;
};

export type User = {
  id: string;
  hunterId: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  rank: UserRank;
  currentStreak: number;
  longestStreak: number;
  dragonStage: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  status: UserStatus;
  banReason: string | null;
  authProvider: AuthProvider;
  role?: 'admin' | 'user' | string;
  createdAt: string;
  activityLog: UserActivityLogEntry[];
  badges: UserBadge[];
  rewardClaims: UserRewardClaim[];
  feedbackTickets: UserFeedbackTicket[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
};
