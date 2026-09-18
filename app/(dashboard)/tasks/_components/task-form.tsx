'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deriveRewardEligibility } from '@/lib/api/reward-eligibility';
import { createTask, updateTask } from '@/lib/api/task-actions';
import type { Task, TaskInput, TaskType, VerificationMethod } from '@/types/task';
import { Lock } from 'lucide-react';

const WEEKDAYS = [
  { value: 'mon', label: 'Mon' },
  { value: 'tue', label: 'Tue' },
  { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' },
  { value: 'fri', label: 'Fri' },
  { value: 'sat', label: 'Sat' },
  { value: 'sun', label: 'Sun' },
];

const DEFAULT_FORM: TaskInput = {
  title: '',
  description: '',
  tag: '',
  imageUrl: '',
  type: 'daily',
  isDefaultDaily: false,
  recurrenceDays: null,
  startDate: null,
  endDate: null,
  levelTarget: null,
  targetValue: 1,
  targetUnit: '',
  allowsPartial: false,
  xpPartial: null,
  xpReward: 100,
  verificationMethod: 'manual',
  verificationConfig: { requiresNote: false },
  status: 'active',
};

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function TaskForm({ initialTask }: { initialTask?: Task }) {
  const router = useRouter();
  const [form, setForm] = React.useState<TaskInput>(
    initialTask
      ? {
          title: initialTask.title,
          description: initialTask.description,
          tag: initialTask.tag,
          imageUrl: initialTask.imageUrl ?? '',
          type: initialTask.type,
          isDefaultDaily: initialTask.isDefaultDaily,
          recurrenceDays: initialTask.recurrenceDays,
          startDate: initialTask.startDate,
          endDate: initialTask.endDate,
          levelTarget: initialTask.levelTarget,
          targetValue: initialTask.targetValue,
          targetUnit: initialTask.targetUnit,
          allowsPartial: initialTask.allowsPartial,
          xpPartial: initialTask.xpPartial,
          xpReward: initialTask.xpReward,
          verificationMethod: initialTask.verificationMethod,
          verificationConfig: initialTask.verificationConfig,
          status: initialTask.status,
        }
      : DEFAULT_FORM
  );
  const [submitting, setSubmitting] = React.useState(false);

  const update = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f: TaskInput) => ({ ...f, [key]: value }));

  const toggleRecurrenceDay = (day: string) => {
    const current = form.recurrenceDays ?? [];
    update('recurrenceDays', current.includes(day) ? current.filter((d: string) => d !== day) : [...current, day]);
  };

  const rewardEligibility = deriveRewardEligibility(form.xpReward, form.verificationMethod);

  const isValid = form.title.trim().length > 0 && form.targetUnit.trim().length > 0 && form.xpReward > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (initialTask) {
        await updateTask(initialTask.id, form);
        router.push(`/tasks/${initialTask.id}`);
      } else {
        const created = await createTask(form);
        router.push(`/tasks/${created.id}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
      <Card className="space-y-5">
        <SectionHeader title="Basic Info" description="What hunters will see for this task." />
        <Input label="Title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        <Textarea label="Description" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tag" placeholder="e.g. Fitness" value={form.tag} onChange={(e) => update('tag', e.target.value)} required />
          <Input label="Image URL" placeholder="https://..." value={form.imageUrl ?? ''} onChange={(e) => update('imageUrl', e.target.value)} />
        </div>
      </Card>

      <Card className="space-y-5">
        <SectionHeader title="Task Type & Schedule" description="How often this task recurs and who it targets." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" value={form.type} onChange={(e) => update('type', e.target.value as TaskType)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="one_time">One-Time</option>
          </Select>
          <Input
            label="Level Target (optional)"
            type="number"
            placeholder="Minimum hunter level"
            value={form.levelTarget ?? ''}
            onChange={(e) => update('levelTarget', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <Switch
          checked={form.isDefaultDaily}
          onCheckedChange={(checked) => update('isDefaultDaily', checked)}
          label="Is Default Daily"
          description="Automatically assigned to every hunter's daily task list."
        />
        {form.type === 'weekly' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Recurrence Days</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = (form.recurrenceDays ?? []).includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleRecurrenceDay(day.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      active ? 'bg-accent/10 text-accent-ink border-accent/30' : 'text-ink-muted border-line hover:border-line-strong'
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={toDateInput(form.startDate)}
            onChange={(e) => update('startDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
          <Input
            label="End Date (optional)"
            type="date"
            value={toDateInput(form.endDate)}
            onChange={(e) => update('endDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
      </Card>

      <Card className="space-y-5">
        <SectionHeader title="Completion Criteria" description="What counts as done, and the XP it earns." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Target Value"
            type="number"
            value={form.targetValue}
            onChange={(e) => update('targetValue', Number(e.target.value))}
            required
          />
          <Input label="Unit" placeholder="e.g. km, minutes, steps" value={form.targetUnit} onChange={(e) => update('targetUnit', e.target.value)} required />
        </div>
        <Input label="XP Reward" type="number" value={form.xpReward} onChange={(e) => update('xpReward', Number(e.target.value))} required />
        <Switch
          checked={form.allowsPartial}
          onCheckedChange={(checked) => update('allowsPartial', checked)}
          label="Allows Partial Completion"
          description="Award reduced XP when the target isn't fully met."
        />
        {form.allowsPartial && (
          <Input
            label="Partial XP"
            type="number"
            value={form.xpPartial ?? ''}
            onChange={(e) => update('xpPartial', e.target.value ? Number(e.target.value) : null)}
          />
        )}
      </Card>

      <Card className="space-y-5">
        <SectionHeader title="Verification Method" description="How submissions are confirmed." />
        <Select
          label="Method"
          value={form.verificationMethod}
          onChange={(e) => {
            const method = e.target.value as VerificationMethod;
            update('verificationMethod', method);
            update(
              'verificationConfig',
              method === 'manual'
                ? { requiresNote: false }
                : method === 'gps_tracked'
                  ? { gpsMinDistanceKm: 1, gpsMaxDurationMin: 60 }
                  : method === 'health_sync'
                    ? { healthMetric: 'steps', healthSyncProvider: 'apple_health' }
                    : { photoRequiresTimestamp: true, photoInstructions: '' }
            );
          }}
        >
          <option value="manual">Manual</option>
          <option value="gps_tracked">GPS Tracked</option>
          <option value="health_sync">Health Sync</option>
          <option value="photo_review">Photo Review</option>
        </Select>

        {form.verificationMethod === 'manual' && (
          <Switch
            checked={!!form.verificationConfig.requiresNote}
            onCheckedChange={(checked) => update('verificationConfig', { ...form.verificationConfig, requiresNote: checked })}
            label="Requires Note"
            description="Hunter must submit a short note describing completion."
          />
        )}

        {form.verificationMethod === 'gps_tracked' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Min Distance (km)"
              type="number"
              value={form.verificationConfig.gpsMinDistanceKm ?? ''}
              onChange={(e) => update('verificationConfig', { ...form.verificationConfig, gpsMinDistanceKm: Number(e.target.value) })}
            />
            <Input
              label="Max Duration (min)"
              type="number"
              value={form.verificationConfig.gpsMaxDurationMin ?? ''}
              onChange={(e) => update('verificationConfig', { ...form.verificationConfig, gpsMaxDurationMin: Number(e.target.value) })}
            />
          </div>
        )}

        {form.verificationMethod === 'health_sync' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Health Metric"
              value={form.verificationConfig.healthMetric ?? 'steps'}
              onChange={(e) => update('verificationConfig', { ...form.verificationConfig, healthMetric: e.target.value as 'steps' | 'heart_rate' | 'sleep_hours' | 'calories' })}
            >
              <option value="steps">Steps</option>
              <option value="heart_rate">Heart Rate</option>
              <option value="sleep_hours">Sleep Hours</option>
              <option value="calories">Calories</option>
            </Select>
            <Select
              label="Sync Provider"
              value={form.verificationConfig.healthSyncProvider ?? 'apple_health'}
              onChange={(e) => update('verificationConfig', { ...form.verificationConfig, healthSyncProvider: e.target.value as 'apple_health' | 'google_fit' | 'fitbit' })}
            >
              <option value="apple_health">Apple Health</option>
              <option value="google_fit">Google Fit</option>
              <option value="fitbit">Fitbit</option>
            </Select>
          </div>
        )}

        {form.verificationMethod === 'photo_review' && (
          <div className="space-y-4">
            <Switch
              checked={!!form.verificationConfig.photoRequiresTimestamp}
              onCheckedChange={(checked) => update('verificationConfig', { ...form.verificationConfig, photoRequiresTimestamp: checked })}
              label="Requires Timestamp"
              description="Photo metadata must include a valid capture timestamp."
            />
            <Textarea
              label="Photo Instructions"
              rows={2}
              value={form.verificationConfig.photoInstructions ?? ''}
              onChange={(e) => update('verificationConfig', { ...form.verificationConfig, photoInstructions: e.target.value })}
            />
          </div>
        )}
      </Card>

      <Card className="space-y-3">
        <SectionHeader title="Reward Eligibility" description="Auto-derived from XP reward and verification method." />
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/30 text-ink-muted">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <Badge variant={rewardEligibility === 'premium' ? 'default' : rewardEligibility === 'bonus' ? 'warning' : 'muted'}>
            {rewardEligibility}
          </Badge>
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Saving...' : initialTask ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="text-sm text-ink-faint mt-0.5">{description}</p>
    </div>
  );
}
