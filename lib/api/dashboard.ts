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
import type { ApiResponse } from '@/types/api';
import { apiClient, unwrap } from '@/lib/api/client';

// Server Functions backing the dashboard page. Marked 'use server' (not just
// plain async exports) even though only Server Components call these today:
// a client component elsewhere in this codebase once imported a similarly
// "read-only" lib/api module directly, which silently bundled the backend
// call into the browser (see lib/api/users.ts) — this keeps that class of
// bug from recurring here.

export async function getCoreKpis(): Promise<CoreKpis> {
  return unwrap(apiClient.get<ApiResponse<CoreKpis>>('/admin/dashboard/kpis'));
}

export async function getSubscriptionOverview(): Promise<SubscriptionOverview> {
  return unwrap(apiClient.get<ApiResponse<SubscriptionOverview>>('/admin/dashboard/subscriptions'));
}

export async function getMrrTrend(): Promise<TrendPoint[]> {
  return unwrap(apiClient.get<ApiResponse<TrendPoint[]>>('/admin/dashboard/mrr-trend', { params: { days: 90 } }));
}

export async function getDauTrend(): Promise<TrendPoint[]> {
  return unwrap(apiClient.get<ApiResponse<TrendPoint[]>>('/admin/dashboard/dau-trend', { params: { days: 30 } }));
}

export async function getStreakDropoff(): Promise<{ day: number; usersRemaining: number }[]> {
  return unwrap(apiClient.get<ApiResponse<{ day: number; usersRemaining: number }[]>>('/admin/dashboard/streak-dropoff'));
}

export async function getRankDistribution(): Promise<RankDistributionPoint[]> {
  return unwrap(apiClient.get<ApiResponse<RankDistributionPoint[]>>('/admin/dashboard/rank-distribution'));
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  return unwrap(apiClient.get<ApiResponse<Transaction[]>>('/admin/dashboard/transactions', { params: { limit: 10 } }));
}

export async function getReferralOverview(): Promise<ReferralOverview> {
  return unwrap(apiClient.get<ApiResponse<ReferralOverview>>('/admin/dashboard/referrals'));
}

export async function getTopReferrers(): Promise<TopReferrer[]> {
  return unwrap(apiClient.get<ApiResponse<TopReferrer[]>>('/admin/dashboard/top-referrers'));
}

export async function getRecentReferralActivity(): Promise<ReferralActivity[]> {
  return unwrap(apiClient.get<ApiResponse<ReferralActivity[]>>('/admin/dashboard/referral-activity'));
}

export async function getCouponOverview(): Promise<CouponOverview> {
  return unwrap(apiClient.get<ApiResponse<CouponOverview>>('/admin/dashboard/coupons'));
}

export async function getCouponActivityLog(): Promise<CouponActivityEntry[]> {
  return unwrap(apiClient.get<ApiResponse<CouponActivityEntry[]>>('/admin/dashboard/coupon-activity'));
}

export async function getNeedsAttention(): Promise<NeedsAttentionItem[]> {
  return unwrap(apiClient.get<ApiResponse<NeedsAttentionItem[]>>('/admin/dashboard/needs-attention'));
}
