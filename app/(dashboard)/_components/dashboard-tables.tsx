'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { EmptyState } from '@/components/ui/empty-state';
import { Inbox, MapPinned, MessageSquareWarning, CreditCard, UserX, ChevronRight } from 'lucide-react';
import type { Transaction, PaymentStatus, TopReferrer, ReferralActivity, CouponActivityEntry, NeedsAttentionItem } from '@/types/dashboard';

const PAYMENT_VARIANT: Record<PaymentStatus, 'success' | 'danger' | 'warning' | 'muted'> = {
  paid: 'success',
  failed: 'danger',
  pending: 'warning',
  refunded: 'muted',
};

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Method</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="font-medium">{t.userName}</TableCell>
            <TableCell className="text-ink-muted">{t.plan}</TableCell>
            <TableCell>${t.amount}</TableCell>
            <TableCell>
              <Badge variant={PAYMENT_VARIANT[t.status]}>{t.status}</Badge>
            </TableCell>
            <TableCell className="text-ink-muted">{new Date(t.date).toLocaleDateString()}</TableCell>
            <TableCell className="text-ink-muted">{t.method}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function TopReferrersTable({ referrers }: { referrers: TopReferrer[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hunter</TableHead>
          <TableHead>Links Sent</TableHead>
          <TableHead>Signups</TableHead>
          <TableHead>Paid Conversions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {referrers.map((r) => (
          <TableRow key={r.userId}>
            <TableCell className="font-medium">
              <Link href={`/users/${r.userId}`} className="hover:text-accent-ink transition-colors">
                {r.userName}
              </Link>
            </TableCell>
            <TableCell>{r.linksSent}</TableCell>
            <TableCell>{r.signups}</TableCell>
            <TableCell>{r.paidConversions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const REFERRAL_STATUS_VARIANT: Record<ReferralActivity['status'], 'success' | 'warning' | 'default'> = {
  converted: 'success',
  signed_up: 'default',
  pending: 'warning',
};

export function ReferralActivityTable({ activity }: { activity: ReferralActivity[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Referrer</TableHead>
          <TableHead>Referee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activity.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.referrerName}</TableCell>
            <TableCell className="text-ink-muted">{a.refereeName}</TableCell>
            <TableCell>
              <Badge variant={REFERRAL_STATUS_VARIANT[a.status]}>{a.status.replace('_', ' ')}</Badge>
            </TableCell>
            <TableCell className="text-ink-muted">{new Date(a.date).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const COUPON_ACTION_VARIANT: Record<CouponActivityEntry['action'], 'success' | 'default' | 'muted'> = {
  redeemed: 'success',
  issued: 'default',
  expired: 'muted',
};

export function CouponActivityTable({ entries }: { entries: CouponActivityEntry[] }) {
  const [partner, setPartner] = React.useState('all');
  const partners = React.useMemo(() => Array.from(new Set(entries.map((e) => e.partner))), [entries]);
  const filtered = partner === 'all' ? entries : entries.filter((e) => e.partner === partner);

  return (
    <div className="space-y-4">
      <div className="max-w-xs">
        <Select value={partner} onChange={(e) => setPartner(e.target.value)}>
          <option value="all">All Partners</option>
          {partners.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-mono text-xs">{e.code}</TableCell>
              <TableCell className="text-ink-muted">{e.partner}</TableCell>
              <TableCell>{e.userName}</TableCell>
              <TableCell>
                <Badge variant={COUPON_ACTION_VARIANT[e.action]}>{e.action}</Badge>
              </TableCell>
              <TableCell className="text-ink-muted">{new Date(e.date).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-ink-faint py-8">
                No coupon activity for this partner.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const ATTENTION_ICON: Record<NeedsAttentionItem['type'], typeof MapPinned> = {
  gps_review: MapPinned,
  feedback_ticket: MessageSquareWarning,
  failed_payment: CreditCard,
  banned_user: UserX,
};

const ATTENTION_COLOR: Record<NeedsAttentionItem['type'], string> = {
  gps_review: 'text-warn-ink',
  feedback_ticket: 'text-accent-ink',
  failed_payment: 'text-bad-ink',
  banned_user: 'text-bad-ink',
};

export function NeedsAttentionList({ items }: { items: NeedsAttentionItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={Inbox} message="Nothing needs attention right now." />;
  }

  return (
    <div className="divide-y divide-line/60">
      {items.map((item) => {
        const Icon = ATTENTION_ICON[item.type];
        return (
          <Link
            key={item.id}
            href={item.href}
            className="flex items-center gap-4 py-3.5 group hover:bg-surface-inset/40 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className={`p-2 rounded-lg bg-surface-inset/60 border border-line shrink-0 ${ATTENTION_COLOR[item.type]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.title}</p>
              <p className="text-xs text-ink-faint truncate">{item.description}</p>
            </div>
            <span className="text-xs text-ink-faint shrink-0 hidden sm:inline">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
            <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-ink-muted shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
