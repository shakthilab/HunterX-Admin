'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { PendingReviewItem } from '@/types/task';
import { decideReview } from '@/lib/api/task-actions';
import { ArrowLeft, MapPin, Camera, Check, X, ClipboardList, AlertTriangle } from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

export function ReviewQueueClient({ initialReviews }: { initialReviews: PendingReviewItem[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const decide = async (id: string, status: 'approved' | 'rejected') => {
    setPendingId(id);
    try {
      const updated = await decideReview(id, status);
      setReviews((items) => items.map((item) => (item.id === id ? updated : item)));
    } finally {
      setPendingId(null);
    }
  };

  const pending = reviews.filter((r) => r.status === 'pending');
  const decided = reviews.filter((r) => r.status !== 'pending');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/tasks" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Tasks
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-ink mt-3">Pending Review Queue</h1>
        <p className="text-sm text-ink-muted mt-1">
          Flagged GPS and photo submissions awaiting manual verification.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <EmptyState icon={ClipboardList} message="No data found." />
        </Card>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <Card key={item.id} className="space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-ink">{item.taskTitle}</h3>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                  <p className="text-sm text-ink-muted mt-1">
                    {item.userName} · submitted {formatDateTime(item.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="danger" disabled={pendingId === item.id} onClick={() => decide(item.id, 'rejected')}>
                    <X className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button size="sm" disabled={pendingId === item.id} onClick={() => decide(item.id, 'approved')}>
                    <Check className="w-3.5 h-3.5 mr-1.5" /> Approve
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="p-3 rounded-lg border border-line bg-surface-inset/40">
                  <p className="text-xs text-ink-faint uppercase tracking-wider">Submitted Value</p>
                  <p className="text-sm font-semibold text-ink mt-1">{item.submittedValue.toFixed(1)} {item.submittedUnit}</p>
                </div>
                <div className="p-3 rounded-lg border border-line bg-surface-inset/40">
                  <p className="text-xs text-ink-faint uppercase tracking-wider flex items-center gap-1.5">
                    {item.verificationMethod === 'gps_tracked' ? <MapPin className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                    {item.verificationMethod === 'gps_tracked' ? 'GPS Session' : 'Photo Review'}
                  </p>
                  <p className="text-sm text-ink-muted mt-1">{item.gpsSessionSummary ?? 'Photo submitted for manual review.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-caution-ink/20 bg-caution-ink/10 text-caution-ink text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{item.flagReason}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wider">Recently Decided</h2>
          <Card className="divide-y divide-line/60">
            {decided.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{item.taskTitle}</p>
                  <p className="text-xs text-ink-faint">{item.userName}</p>
                </div>
                <Badge variant={item.status === 'approved' ? 'success' : 'danger'}>{item.status}</Badge>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
