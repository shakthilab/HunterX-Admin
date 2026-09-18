'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { RankBadge } from '@/components/rank-badge';
import type { User } from '@/types/user';
import { banUser, unbanUser, adjustUserXp, resetUserStreak } from '@/lib/api/user-actions';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  Flame,
  Sparkles,
  Ruler,
  Weight,
  Activity,
  Award,
  Gift,
  MessageSquare,
  ShieldOff,
  ShieldCheck,
  Zap,
  RotateCcw,
  KeyRound,
  Mail,
  Globe,
  Apple,
} from 'lucide-react';

const AUTH_ICON = { email: Mail, google: Globe, apple: Apple } as const;

const TAB_ITEMS = [
  { value: 'overview', label: 'Overview' },
  { value: 'activity', label: 'Activity History' },
  { value: 'badges', label: 'Badges' },
  { value: 'rewards', label: 'Rewards' },
  { value: 'feedback', label: 'Feedback / Ratings' },
];

export function UserDetailClient({ user: initialUser }: { user: User }) {
  const [user, setUser] = React.useState(initialUser);
  const [tab, setTab] = React.useState('overview');
  const [xpModalOpen, setXpModalOpen] = React.useState(false);
  const [streakDialogOpen, setStreakDialogOpen] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [xpDelta, setXpDelta] = React.useState('');
  const [xpReason, setXpReason] = React.useState('');
  const [actionPending, setActionPending] = React.useState(false);

  const AuthIcon = AUTH_ICON[user.authProvider];

  const toggleBan = async () => {
    setActionPending(true);
    try {
      const updated = user.status === 'active' ? await banUser(user.id, 'Manually banned by admin') : await unbanUser(user.id);
      setUser(updated);
    } finally {
      setActionPending(false);
    }
  };

  const applyXpAdjustment = async () => {
    const delta = Number(xpDelta);
    if (!delta || !xpReason.trim()) return;
    setActionPending(true);
    try {
      const updated = await adjustUserXp(user.id, delta, xpReason.trim());
      setUser(updated);
      setXpDelta('');
      setXpReason('');
      setXpModalOpen(false);
    } finally {
      setActionPending(false);
    }
  };

  const confirmResetStreak = async () => {
    setActionPending(true);
    try {
      const updated = await resetUserStreak(user.id);
      setUser(updated);
      setStreakDialogOpen(false);
    } finally {
      setActionPending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      {/* Header */}
      <Card className="flex flex-wrap items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink text-xl font-bold shrink-0">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-ink">{user.displayName}</h1>
            <RankBadge rank={user.rank} />
            <Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge>
          </div>
          <p className="text-sm text-ink-faint mt-1">
            {user.hunterId} · Level {user.level} · Member since {formatDate(user.createdAt)}
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Tabs content */}
        <Card className="space-y-6">
          <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} />

          {tab === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <OverviewStat icon={Sparkles} label="Total XP" value={user.xp.toLocaleString()} />
              <OverviewStat icon={Flame} label="Current / Longest Streak" value={`${user.currentStreak}d / ${user.longestStreak}d`} />
              <OverviewStat icon={Award} label="Dragon Stage" value={`Stage ${user.dragonStage}`} />
              <OverviewStat icon={Activity} label="BMI" value={`${user.bmi}`} />
              <OverviewStat icon={Ruler} label="Height" value={`${user.heightCm} cm`} />
              <OverviewStat icon={Weight} label="Weight" value={`${user.weightKg} kg`} />
            </div>
          )}

          {tab === 'activity' && (
            user.activityLog.length === 0 ? (
              <EmptyState icon={Activity} message="No data found." />
            ) : (
              <div className="divide-y divide-line/60">
                {user.activityLog.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{entry.taskTitle}</p>
                      <p className="text-xs text-ink-faint">{formatDateTime(entry.completedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ok-ink">+{entry.xpEarned} XP</span>
                      <Badge variant={entry.verificationStatus === 'approved' ? 'success' : entry.verificationStatus === 'pending' ? 'warning' : 'danger'}>
                        {entry.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'badges' && (
            user.badges.length === 0 ? (
              <EmptyState icon={Award} message="No data found." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {user.badges.map((badge) => (
                  <div key={badge.id} className="flex items-start gap-3 p-4 rounded-xl border border-line bg-surface-inset/40">
                    <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent-ink shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{badge.name}</p>
                      <p className="text-xs text-ink-muted">{badge.description}</p>
                      <p className="text-xs text-ink-faint mt-1">Earned {formatDate(badge.earnedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'rewards' && (
            user.rewardClaims.length === 0 ? (
              <EmptyState icon={Gift} message="No data found." />
            ) : (
              <div className="divide-y divide-line/60">
                {user.rewardClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{claim.rewardName}</p>
                      <p className="text-xs text-ink-faint">Claimed {formatDate(claim.claimedAt)}</p>
                    </div>
                    <Badge variant="muted">{claim.type.replace('_', ' ')}</Badge>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'feedback' && (
            user.feedbackTickets.length === 0 ? (
              <EmptyState icon={MessageSquare} message="No data found." />
            ) : (
              <div className="divide-y divide-line/60">
                {user.feedbackTickets.map((ticket) => (
                  <div key={ticket.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink">{ticket.subject}</p>
                      <Badge variant={ticket.status === 'open' ? 'warning' : 'success'}>{ticket.status}</Badge>
                    </div>
                    <p className="text-xs text-ink-muted">{ticket.message}</p>
                    <p className="text-xs text-ink-faint">
                      {ticket.rating ? `Rating: ${ticket.rating}/5 · ` : ''}
                      {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}
        </Card>

        {/* Actions panel */}
        <Card className="space-y-3 h-fit">
          <h3 className="text-sm font-semibold text-ink">Actions</h3>
          <Button
            variant={user.status === 'active' ? 'danger' : 'secondary'}
            className="w-full justify-start"
            disabled={actionPending}
            onClick={toggleBan}
          >
            {user.status === 'active' ? <ShieldOff className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            {user.status === 'active' ? 'Ban User' : 'Unban User'}
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled={actionPending} onClick={() => setXpModalOpen(true)}>
            <Zap className="w-4 h-4 mr-2" /> Adjust XP
          </Button>
          <Button variant="outline" className="w-full justify-start" disabled={actionPending} onClick={() => setStreakDialogOpen(true)}>
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Streak
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => setAuthDialogOpen(true)}>
            <KeyRound className="w-4 h-4 mr-2" /> View Auth Details
          </Button>
        </Card>
      </div>

      {/* Adjust XP modal */}
      <Dialog
        open={xpModalOpen}
        onClose={() => setXpModalOpen(false)}
        title="Manually Adjust XP"
        description={`Current XP: ${user.xp.toLocaleString()}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setXpModalOpen(false)}>Cancel</Button>
            <Button onClick={applyXpAdjustment} disabled={!xpDelta || !xpReason.trim() || actionPending}>Apply</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="XP Change (use a negative number to deduct)"
            type="number"
            placeholder="e.g. 500 or -200"
            value={xpDelta}
            onChange={(e) => setXpDelta(e.target.value)}
          />
          <Textarea
            label="Reason"
            placeholder="Why is this adjustment being made?"
            rows={3}
            value={xpReason}
            onChange={(e) => setXpReason(e.target.value)}
          />
        </div>
      </Dialog>

      {/* Reset streak confirm */}
      <Dialog
        open={streakDialogOpen}
        onClose={() => setStreakDialogOpen(false)}
        title="Reset Current Streak?"
        description={`This will set ${user.displayName}'s current streak to 0. Their longest streak record is unaffected.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setStreakDialogOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmResetStreak} disabled={actionPending}>Reset Streak</Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">Current streak: {user.currentStreak} days</p>
      </Dialog>

      {/* Auth details */}
      <Dialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} title="Authentication Details">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Provider</span>
            <span className="flex items-center gap-2 text-ink font-medium capitalize">
              <AuthIcon className="w-4 h-4" /> {user.authProvider}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Email</span>
            <span className="text-ink font-medium">{user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink-muted">Internal ID</span>
            <span className="text-ink font-medium font-mono text-xs">{user.id}</span>
          </div>
          {user.status === 'banned' && (
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Ban Reason</span>
              <span className="text-bad-ink font-medium">{user.banReason}</span>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

function OverviewStat({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-line bg-surface-inset/40">
      <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent-ink shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-ink-faint uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}
