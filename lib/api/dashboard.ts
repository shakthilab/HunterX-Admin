'use server';

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
import { getUsers, getUserStats } from '@/lib/api/users';
import { getPendingReviews } from '@/lib/api/tasks';
import { apiClient } from '@/lib/api/client';

export async function getCoreKpis(): Promise<CoreKpis> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/kpis');
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch {}

  const stats = await getUserStats();
  return {
    totalUsers: stats.totalUsers,
    activeToday: stats.activeToday,
    newSignupsToday: 0,
    activeSubscriptions: 0,
    tasksCompletedToday: 0,
    openFeedbackTickets: 0,
    totalUsersDelta: 0,
    activeTodayDelta: 0,
    newSignupsTodayDelta: 0,
    activeSubscriptionsDelta: 0,
    tasksCompletedTodayDelta: 0,
    openFeedbackTicketsDelta: 0,
  };
}

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/subscriptions');
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch {}

  return {
    mrr: 0,
    activeSubscribers: 0,
    newSubsToday: 0,
    newSubsWeek: 0,
    churnedThisWeek: 0,
    trialToPaidPct: 0,
    statusBreakdown: [
      { status: 'Active', count: 0 },
      { status: 'Trialing', count: 0 },
      { status: 'Past Due', count: 0 },
      { status: 'Canceled', count: 0 },
    ],
  };
}

export async function getMrrTrend(): Promise<TrendPoint[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/mrr-trend');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}
  return [];
}

export async function getDauTrend(): Promise<TrendPoint[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/dau-trend');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}
  return [];
}

export async function getStreakDropoff(): Promise<{ day: number; usersRemaining: number }[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/streak-dropoff');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}
  return [];
}

export async function getRankDistribution(): Promise<RankDistributionPoint[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/rank-distribution');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}

  const users = await getUsers();
  const order = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'mythic'];
  return order.map((rank) => ({
    rank: rank.charAt(0).toUpperCase() + rank.slice(1),
    users: users.filter((u) => u.rank === rank).length,
  }));
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/transactions');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}
  return [];
}

export async function getReferralOverview(): Promise<ReferralOverview> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/referrals');
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch {}

  return { totalLinksSent: 0, successfulSignups: 0, referralToPaidPct: 0 };
}

export async function getTopReferrers(): Promise<TopReferrer[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/top-referrers');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}

  return [];
}

export async function getRecentReferralActivity(): Promise<ReferralActivity[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/referral-activity');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}

  return [];
}

export async function getCouponOverview(): Promise<CouponOverview> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/coupons');
    if (response.data?.success && response.data.data) {
      return response.data.data;
    }
  } catch {}

  return {
    issued: 0,
    redeemed: 0,
    unredeemed: 0,
    expired: 0,
    redemptionRatePct: 0,
    byTier: [
      { tier: 'Bronze', used: 0, unused: 0, expired: 0 },
      { tier: 'Silver', used: 0, unused: 0, expired: 0 },
      { tier: 'Gold', used: 0, unused: 0, expired: 0 },
      { tier: 'Platinum', used: 0, unused: 0, expired: 0 },
    ],
  };
}

export async function getCouponActivityLog(): Promise<CouponActivityEntry[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/coupon-activity');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}

  return [];
}

export async function getNeedsAttention(): Promise<NeedsAttentionItem[]> {
  try {
    const response = await apiClient.get<any>('/admin/dashboard/needs-attention');
    if (response.data?.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
  } catch {}

  const [reviews, users, transactions] = await Promise.all([
    getPendingReviews(),
    getUsers(),
    getRecentTransactions(),
  ]);

  const items: NeedsAttentionItem[] = [
    ...reviews.map((r) => ({
      id: `att_review_${r.id}`,
      type: 'gps_review' as const,
      title: `Flagged submission — ${r.taskTitle}`,
      description: `${r.userName}: ${r.flagReason}`,
      timestamp: r.submittedAt,
      href: '/tasks/review',
    })),
    ...users
      .flatMap((u) => (u.feedbackTickets || []).filter((t) => t.status === 'open').map((t) => ({ user: u, ticket: t })))
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
