import {
  getCoreKpis,
  getSubscriptionOverview,
  getMrrTrend,
  getRecentTransactions,
  getReferralOverview,
  getTopReferrers,
  getRecentReferralActivity,
  getCouponOverview,
  getCouponActivityLog,
  getDauTrend,
  getRankDistribution,
  getStreakDropoff,
  getNeedsAttention,
} from '@/lib/api/dashboard';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import {
  MrrTrendChart,
  DauTrendChart,
  StreakDropoffChart,
  SubscriptionDonut,
  CouponTierChart,
  RankDistributionChart,
} from './_components/charts';
import {
  TransactionsTable,
  TopReferrersTable,
  ReferralActivityTable,
  CouponActivityTable,
  NeedsAttentionList,
} from './_components/dashboard-tables';
import {
  Users,
  Activity,
  UserPlus,
  CreditCard,
  CheckCircle2,
  MessageSquare,
  DollarSign,
  UserMinus,
  Percent,
  Share2,
  UserCheck,
  Gift,
  Clock,
  XCircle,
  TrendingUp,
  HeartPulse,
  Trophy,
  AlertCircle,
} from 'lucide-react';

export default async function DashboardPage() {
  const [
    kpis,
    subscriptionOverview,
    mrrTrend,
    transactions,
    referralOverview,
    topReferrers,
    referralActivity,
    couponOverview,
    couponActivity,
    dauTrend,
    rankDistribution,
    streakDropoff,
    needsAttention,
  ] = await Promise.all([
    getCoreKpis(),
    getSubscriptionOverview(),
    getMrrTrend(),
    getRecentTransactions(),
    getReferralOverview(),
    getTopReferrers(),
    getRecentReferralActivity(),
    getCouponOverview(),
    getCouponActivityLog(),
    getDauTrend(),
    getRankDistribution(),
    getStreakDropoff(),
    getNeedsAttention(),
  ]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted mt-1">
          A live snapshot of hunters, revenue, referrals, rewards, and engagement health.
        </p>
      </div>

      {/* 1. KPI Strip */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard name="Total Users" value={kpis.totalUsers} icon={Users} color="text-accent-ink" delta={kpis.totalUsersDelta} href="/users" />
        <StatCard name="Active Today" value={kpis.activeToday} icon={Activity} color="text-ok-ink" delta={kpis.activeTodayDelta} href="/users" />
        <StatCard name="New Signups Today" value={kpis.newSignupsToday} icon={UserPlus} color="text-warn-ink" delta={kpis.newSignupsTodayDelta} href="/users" />
        <StatCard name="Active Subscriptions" value={kpis.activeSubscriptions} icon={CreditCard} color="text-accent-ink" delta={kpis.activeSubscriptionsDelta} href="/subscriptions" />
        <StatCard name="Tasks Completed Today" value={kpis.tasksCompletedToday} icon={CheckCircle2} color="text-ok-ink" delta={kpis.tasksCompletedTodayDelta} href="/tasks" />
        <StatCard name="Open Feedback Tickets" value={kpis.openFeedbackTickets} icon={MessageSquare} color="text-caution-ink" delta={kpis.openFeedbackTicketsDelta} href="/feedback" />
      </div>

      {/* 2. Subscription & Revenue */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">Subscription & Revenue</h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
          <StatCard name="MRR" value={`$${subscriptionOverview.mrr.toLocaleString()}`} icon={DollarSign} color="text-ok-ink" />
          <StatCard name="Active Subscribers" value={subscriptionOverview.activeSubscribers} icon={Users} />
          <StatCard name="New Subs Today / Week" value={`${subscriptionOverview.newSubsToday} / ${subscriptionOverview.newSubsWeek}`} icon={UserPlus} color="text-warn-ink" />
          <StatCard name="Churned This Week" value={subscriptionOverview.churnedThisWeek} icon={UserMinus} color="text-bad-ink" />
          <StatCard name="Trial → Paid" value={`${subscriptionOverview.trialToPaidPct}%`} icon={Percent} color="text-accent-ink" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-ink mb-4">MRR — Last 90 Days</h3>
            <MrrTrendChart data={mrrTrend} />
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4">Subscription Status</h3>
            <SubscriptionDonut data={subscriptionOverview.statusBreakdown} />
          </Card>
        </div>
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">Recent Transactions</h3>
          <TransactionsTable transactions={transactions} />
        </Card>
      </section>

      {/* 3. Referrals */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">Referrals</h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
          <StatCard name="Total Links Sent" value={referralOverview.totalLinksSent} icon={Share2} />
          <StatCard name="Successful Signups" value={referralOverview.successfulSignups} icon={UserCheck} color="text-ok-ink" />
          <StatCard name="Referral → Paid" value={`${referralOverview.referralToPaidPct}%`} icon={Percent} color="text-accent-ink" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-ink">Top Referrers</h3>
            <TopReferrersTable referrers={topReferrers} />
          </Card>
          <Card className="space-y-4">
            <h3 className="text-sm font-semibold text-ink">Recent Referral Activity</h3>
            <ReferralActivityTable activity={referralActivity} />
          </Card>
        </div>
      </section>

      {/* 4. Rewards & Coupons */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">Rewards & Coupons</h2>
        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
          <StatCard name="Issued" value={couponOverview.issued} icon={Gift} />
          <StatCard name="Redeemed" value={couponOverview.redeemed} icon={CheckCircle2} color="text-ok-ink" />
          <StatCard name="Unredeemed" value={couponOverview.unredeemed} icon={Clock} color="text-warn-ink" />
          <StatCard name="Expired" value={couponOverview.expired} icon={XCircle} color="text-bad-ink" />
          <StatCard name="Redemption Rate" value={`${couponOverview.redemptionRatePct}%`} icon={Percent} color="text-accent-ink" />
        </div>
        <Card>
          <h3 className="text-sm font-semibold text-ink mb-4">Coupons by Reward Tier</h3>
          <CouponTierChart data={couponOverview.byTier} />
        </Card>
        <Card className="space-y-4">
          <h3 className="text-sm font-semibold text-ink">Coupon Activity Log</h3>
          <CouponActivityTable entries={couponActivity} />
        </Card>
      </section>

      {/* 5. Engagement Health */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink">Engagement Health</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent-ink" /> Daily Active Users — Last 30 Days
            </h3>
            <DauTrendChart data={dauTrend} />
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent-ink" /> Users by Rank
            </h3>
            <RankDistributionChart data={rankDistribution} />
          </Card>
        </div>
        <Card>
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-accent-ink" /> Streak Drop-off — First 14 Days
          </h3>
          <StreakDropoffChart data={streakDropoff} />
        </Card>
      </section>

      {/* 6. Needs Attention */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-ink flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-caution-ink" /> Needs Attention
        </h2>
        <Card>
          <NeedsAttentionList items={needsAttention} />
        </Card>
      </section>
    </div>
  );
}
