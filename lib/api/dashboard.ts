import type {
  CoreKpis,
  SubscriptionOverview,
  Transaction,
  ReferralOverview,
  TopReferrer,
  ReferralActivity,
  CouponOverview,
  CouponActivityEntry,
  TrendPoint,
  RankDistributionPoint,
  NeedsAttentionItem,
} from '@/types/dashboard';
import { getUsers } from '@/lib/api/users';
import { getPendingReviews } from '@/lib/api/tasks';

function daysAgoIso(days: number, hour = 9): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

function dateLabel(daysBack: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysBack);
  return d.toISOString().slice(0, 10);
}

export async function getCoreKpis(): Promise<CoreKpis> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/kpis -> { success: true, data: CoreKpis }
  return {
    totalUsers: 25,
    activeToday: 14,
    newSignupsToday: 3,
    activeSubscriptions: 18,
    tasksCompletedToday: 47,
    openFeedbackTickets: 6,
    totalUsersDelta: 4.2,
    activeTodayDelta: -2.1,
    newSignupsTodayDelta: 12.5,
    activeSubscriptionsDelta: 1.8,
    tasksCompletedTodayDelta: 6.4,
    openFeedbackTicketsDelta: -8.3,
  };
}

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/subscriptions -> { success: true, data: SubscriptionOverview }
  return {
    mrr: 8420,
    activeSubscribers: 18,
    newSubsToday: 2,
    newSubsWeek: 9,
    churnedThisWeek: 3,
    trialToPaidPct: 62,
    statusBreakdown: [
      { status: 'Active', count: 18 },
      { status: 'Trialing', count: 5 },
      { status: 'Past Due', count: 2 },
      { status: 'Canceled', count: 4 },
    ],
  };
}

export async function getMrrTrend(): Promise<TrendPoint[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/mrr-trend?days=90 -> { success: true, data: TrendPoint[] }
  return Array.from({ length: 90 }, (_, i) => {
    const daysBack = 89 - i;
    const growth = i * 42;
    const wave = Math.sin(i / 6) * 180;
    return { date: dateLabel(daysBack), value: Math.max(0, Math.round(3200 + growth + wave)) };
  });
}

export async function getDauTrend(): Promise<TrendPoint[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/dau-trend?days=30 -> { success: true, data: TrendPoint[] }
  return Array.from({ length: 30 }, (_, i) => {
    const daysBack = 29 - i;
    const weekday = new Date(dateLabel(daysBack)).getUTCDay();
    const weekendDip = weekday === 0 || weekday === 6 ? -3 : 0;
    const wave = Math.sin(i / 4) * 2.5;
    return { date: dateLabel(daysBack), value: Math.max(1, Math.round(12 + wave + weekendDip + i * 0.05)) };
  });
}

export async function getStreakDropoff(): Promise<{ day: number; usersRemaining: number }[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/streak-dropoff -> { success: true, data: { day: number, usersRemaining: number }[] }
  const start = 25;
  return Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    usersRemaining: Math.max(1, Math.round(start * Math.pow(0.88, i))),
  }));
}

export async function getRankDistribution(): Promise<RankDistributionPoint[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/rank-distribution -> { success: true, data: RankDistributionPoint[] }
  const users = await getUsers();
  const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];
  return order.map((rank) => ({
    rank: rank.charAt(0).toUpperCase() + rank.slice(1),
    users: users.filter((u) => u.rank === rank).length,
  }));
}

const TX_PLANS = ['Hunter Monthly', 'Hunter Annual', 'Guild Pro', 'Guild Pro Annual'];
const TX_METHODS = ['Visa •••• 4242', 'Mastercard •••• 8823', 'UPI', 'Apple Pay', 'PayPal'];
const TX_STATUSES: Transaction['status'][] = ['paid', 'paid', 'paid', 'failed', 'pending', 'refunded', 'paid', 'paid', 'failed', 'paid'];
const TX_USERS = ['Ava Thompson', 'Marcus Lee', 'Priya Sharma', 'Diego Fernandez', 'Grace Kim', 'Noah Williams', 'Liam Carter', 'Sofia Rossi', 'Kenji Sato', 'Amara Okafor'];

export async function getRecentTransactions(): Promise<Transaction[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/transactions?limit=10 -> { success: true, data: Transaction[] }
  return Array.from({ length: 10 }, (_, i) => ({
    id: `txn_${5001 + i}`,
    userName: TX_USERS[i],
    plan: TX_PLANS[i % TX_PLANS.length],
    amount: [12, 120, 29, 290][i % 4],
    status: TX_STATUSES[i],
    date: daysAgoIso(i, 10 + i),
    method: TX_METHODS[i % TX_METHODS.length],
  }));
}

export async function getReferralOverview(): Promise<ReferralOverview> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/referrals -> { success: true, data: ReferralOverview }
  return { totalLinksSent: 342, successfulSignups: 96, referralToPaidPct: 34 };
}

export async function getTopReferrers(): Promise<TopReferrer[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/top-referrers -> { success: true, data: TopReferrer[] }
  return [
    { userId: 'usr_1003', userName: 'Priya Sharma', linksSent: 48, signups: 21, paidConversions: 9 },
    { userId: 'usr_1001', userName: 'Ava Thompson', linksSent: 39, signups: 17, paidConversions: 7 },
    { userId: 'usr_1005', userName: 'Grace Kim', linksSent: 31, signups: 12, paidConversions: 5 },
    { userId: 'usr_1002', userName: 'Marcus Lee', linksSent: 24, signups: 9, paidConversions: 3 },
    { userId: 'usr_1007', userName: 'Liam Carter', linksSent: 18, signups: 6, paidConversions: 2 },
  ];
}

export async function getRecentReferralActivity(): Promise<ReferralActivity[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/referral-activity -> { success: true, data: ReferralActivity[] }
  const statuses: ReferralActivity['status'][] = ['converted', 'signed_up', 'pending', 'signed_up', 'converted', 'pending', 'signed_up', 'converted'];
  const referrers = ['Priya Sharma', 'Ava Thompson', 'Grace Kim', 'Marcus Lee', 'Priya Sharma', 'Liam Carter', 'Ava Thompson', 'Grace Kim'];
  const referees = ['Oscar Petrova', 'Zoe Malik', 'Hassan Singh', 'Ingrid Novak', 'Leo Ahmadi', 'Nadia Yusuf', 'Felix Larsen', 'Ruby Tanaka'];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `ref_${i}`,
    referrerName: referrers[i],
    refereeName: referees[i],
    status: statuses[i],
    date: daysAgoIso(i, 11),
  }));
}

export async function getCouponOverview(): Promise<CouponOverview> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/coupons -> { success: true, data: CouponOverview }
  return {
    issued: 210,
    redeemed: 134,
    unredeemed: 58,
    expired: 18,
    redemptionRatePct: 64,
    byTier: [
      { tier: 'Bronze', used: 40, unused: 15, expired: 5 },
      { tier: 'Silver', used: 38, unused: 18, expired: 6 },
      { tier: 'Gold', used: 32, unused: 14, expired: 4 },
      { tier: 'Platinum', used: 24, unused: 11, expired: 3 },
    ],
  };
}

export async function getCouponActivityLog(): Promise<CouponActivityEntry[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/coupon-activity -> { success: true, data: CouponActivityEntry[] }
  const partners = ['FitGear Co.', 'PulseWear', 'GreenBlend Nutrition', 'FitGear Co.', 'TrailForge', 'PulseWear'];
  const actions: CouponActivityEntry['action'][] = ['redeemed', 'issued', 'redeemed', 'expired', 'issued', 'redeemed'];
  const users = ['Ava Thompson', 'Marcus Lee', 'Priya Sharma', 'Diego Fernandez', 'Grace Kim', 'Noah Williams'];
  return Array.from({ length: 6 }, (_, i) => ({
    id: `cpn_${i}`,
    code: `ARISE-${(3000 + i * 17).toString(36).toUpperCase()}`,
    partner: partners[i],
    userName: users[i],
    action: actions[i],
    date: daysAgoIso(i * 2, 13),
  }));
}

export async function getNeedsAttention(): Promise<NeedsAttentionItem[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/dashboard/needs-attention -> { success: true, data: NeedsAttentionItem[] }
  const [reviews, users, transactions] = await Promise.all([getPendingReviews(), getUsers(), getRecentTransactions()]);

  const items: NeedsAttentionItem[] = [
    ...reviews.slice(0, 2).map((r) => ({
      id: `att_review_${r.id}`,
      type: 'gps_review' as const,
      title: `Flagged submission — ${r.taskTitle}`,
      description: `${r.userName}: ${r.flagReason}`,
      timestamp: r.submittedAt,
      href: '/tasks/review',
    })),
    ...users
      .flatMap((u) => u.feedbackTickets.filter((t) => t.status === 'open').map((t) => ({ user: u, ticket: t })))
      .slice(0, 2)
      .map(({ user, ticket }) => ({
        id: `att_fbk_${ticket.id}`,
        type: 'feedback_ticket' as const,
        title: ticket.subject,
        description: `Open ticket from ${user.displayName}`,
        timestamp: ticket.createdAt,
        href: `/users/${user.id}`,
      })),
    ...transactions
      .filter((t) => t.status === 'failed')
      .slice(0, 2)
      .map((t) => ({
        id: `att_txn_${t.id}`,
        type: 'failed_payment' as const,
        title: `Payment failed — ${t.userName}`,
        description: `${t.plan} · $${t.amount} via ${t.method}`,
        timestamp: t.date,
        href: '/subscriptions',
      })),
    ...users
      .filter((u) => u.status === 'banned')
      .slice(0, 2)
      .map((u) => ({
        id: `att_ban_${u.id}`,
        type: 'banned_user' as const,
        title: `Account banned — ${u.displayName}`,
        description: u.banReason ?? 'No reason on file',
        timestamp: u.createdAt,
        href: `/users/${u.id}`,
      })),
  ];

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
