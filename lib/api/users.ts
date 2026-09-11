import type {
  User,
  UserRank,
  UserActivityLogEntry,
  UserBadge,
  UserRewardClaim,
  UserFeedbackTicket,
} from '@/types/user';

export type UserStats = {
  totalUsers: number;
  activeToday: number;
  avgLevel: number;
  avgStreak: number;
};

const FIRST_NAMES = [
  'Ava', 'Marcus', 'Priya', 'Diego', 'Grace', 'Noah', 'Liam', 'Sofia', 'Kenji', 'Amara',
  'Elena', 'Tariq', 'Maya', 'Oscar', 'Zoe', 'Hassan', 'Ingrid', 'Leo', 'Nadia', 'Felix',
  'Ruby', 'Mateo', 'Anya', 'Caleb', 'Freya',
];
const LAST_NAMES = [
  'Thompson', 'Lee', 'Sharma', 'Fernandez', 'Kim', 'Williams', 'Carter', 'Rossi', 'Sato', 'Okafor',
  'Petrova', 'Malik', 'Singh', 'Novak', 'Ahmadi', 'Yusuf', 'Larsen', 'Tanaka', 'Haddad', 'Brandt',
  'Alvarez', 'Costa', 'Ivanov', 'Nakamura', 'Bergström',
];
const RANK_ORDER: UserRank[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];
const AUTH_PROVIDERS: User['authProvider'][] = ['email', 'google', 'apple'];
const BAN_REASONS = ['GPS spoofing detected', 'Abusive chat messages', 'Fraudulent referral activity'];
const BADGE_LIBRARY = [
  { name: 'First Steps', description: 'Completed your first task.' },
  { name: 'Streak Keeper', description: 'Maintained a 7-day streak.' },
  { name: 'Iron Will', description: 'Maintained a 30-day streak.' },
  { name: 'Dragon Rising', description: 'Reached Dragon Stage 3.' },
  { name: 'Community Pillar', description: 'Referred 5 active hunters.' },
  { name: 'Perfect Week', description: 'Completed every daily task for a week.' },
];
const FEEDBACK_SUBJECTS = [
  'GPS tracking loses signal indoors',
  'Love the new dragon cosmetics!',
  'XP not credited after workout',
  'Streak reset without warning',
  'Referral coupon never arrived',
];

function seeded(index: number, mod: number, offset = 0): number {
  return Math.floor(Math.abs(Math.sin(index * 12.9898 + offset) * 43758.5453)) % mod;
}

function daysAgoIso(days: number, hour = 9): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function buildActivityLog(index: number, level: number): UserActivityLogEntry[] {
  const count = seeded(index, 5, 1) + 1;
  const titles = ['Morning Run', '10-Minute Meditation', 'Deep Work Block', 'Read 20 Pages', 'Hydration Check'];
  return Array.from({ length: count }, (_, i) => ({
    id: `act_${index}_${i}`,
    taskTitle: titles[(index + i) % titles.length],
    completedAt: daysAgoIso(i * 2 + 1, 7 + i),
    xpEarned: 50 + seeded(index, 200, i) ,
    verificationStatus: (['approved', 'approved', 'pending', 'rejected'] as const)[seeded(index, 4, i + 2)],
  }));
}

function buildBadges(index: number, level: number): UserBadge[] {
  const count = Math.min(BADGE_LIBRARY.length, Math.max(0, Math.floor(level / 4)));
  return BADGE_LIBRARY.slice(0, count).map((badge, i) => ({
    id: `badge_${index}_${i}`,
    name: badge.name,
    description: badge.description,
    earnedAt: daysAgoIso(30 * (i + 1)),
  }));
}

function buildRewardClaims(index: number): UserRewardClaim[] {
  const count = seeded(index, 3, 3);
  const rewardNames = ['XP Booster Pack', "Hunter's Cloak Skin", 'Streak Freeze Token', 'Gold Dragon Emblem'];
  const types: UserRewardClaim['type'][] = ['coupon', 'cosmetic', 'xp_boost'];
  return Array.from({ length: count }, (_, i) => ({
    id: `rwd_${index}_${i}`,
    rewardName: rewardNames[(index + i) % rewardNames.length],
    type: types[(index + i) % types.length],
    claimedAt: daysAgoIso(10 * (i + 1)),
  }));
}

function buildFeedbackTickets(index: number): UserFeedbackTicket[] {
  const count = seeded(index, 2, 4);
  return Array.from({ length: count }, (_, i) => ({
    id: `fbk_${index}_${i}`,
    subject: FEEDBACK_SUBJECTS[(index + i) % FEEDBACK_SUBJECTS.length],
    message: 'Reported from in-app feedback form.',
    rating: seeded(index, 5, i + 5) + 1,
    status: seeded(index, 2, i + 6) === 0 ? 'open' : 'resolved',
    createdAt: daysAgoIso(5 * (i + 1)),
  }));
}

const MOCK_USERS: User[] = Array.from({ length: 25 }, (_, i) => {
  const firstName = FIRST_NAMES[i];
  const lastName = LAST_NAMES[i];
  const level = 1 + seeded(i, 40, 10);
  const xp = level * (300 + seeded(i, 250, 11));
  const rank = RANK_ORDER[Math.min(RANK_ORDER.length - 1, Math.floor(level / 8))];
  const currentStreak = seeded(i, 46, 12);
  const longestStreak = currentStreak + seeded(i, 20, 13);
  const isBanned = i % 9 === 8;
  const heightCm = 155 + seeded(i, 45, 14);
  const weightKg = 50 + seeded(i, 45, 15);

  return {
    id: `usr_${1001 + i}`,
    hunterId: `HTR-${(1001 + i).toString().padStart(5, '0')}`,
    displayName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    avatarUrl: null,
    level,
    xp,
    rank,
    currentStreak: isBanned ? 0 : currentStreak,
    longestStreak,
    dragonStage: Math.min(5, Math.floor(level / 7)),
    heightCm,
    weightKg,
    bmi: Math.round((weightKg / ((heightCm / 100) ** 2)) * 10) / 10,
    status: isBanned ? 'banned' : 'active',
    banReason: isBanned ? BAN_REASONS[i % BAN_REASONS.length] : null,
    authProvider: AUTH_PROVIDERS[i % AUTH_PROVIDERS.length],
    role: i === 0 ? 'admin' : 'user',
    createdAt: daysAgoIso(30 + seeded(i, 500, 16), 8),
    activityLog: buildActivityLog(i, level),
    badges: buildBadges(i, level),
    rewardClaims: buildRewardClaims(i),
    feedbackTickets: buildFeedbackTickets(i),
  };
});

export async function getUsers(): Promise<User[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/users -> { success: true, data: User[] }
  return MOCK_USERS;
}

export async function getUserById(id: string): Promise<User | null> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/users/:id -> { success: true, data: User }
  return MOCK_USERS.find((u) => u.id === id) ?? null;
}

export async function getUserStats(): Promise<UserStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/users/stats -> { success: true, data: { totalUsers: number, activeToday: number, avgLevel: number, avgStreak: number } }
  const active = MOCK_USERS.filter((u) => u.status === 'active');
  return {
    totalUsers: MOCK_USERS.length,
    activeToday: 14,
    avgLevel: Math.round(MOCK_USERS.reduce((sum, u) => sum + u.level, 0) / MOCK_USERS.length),
    avgStreak: Math.round(active.reduce((sum, u) => sum + u.currentStreak, 0) / active.length),
  };
}
