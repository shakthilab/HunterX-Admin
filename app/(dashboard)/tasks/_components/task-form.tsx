'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { deriveRewardEligibility } from '@/lib/api/reward-eligibility';
import { createTask, updateTask } from '@/lib/api/task-actions';
import type { Task, TaskInput, CreatableTaskType, LevelTarget } from '@/types/task';
import { Lock, AlertCircle } from 'lucide-react';

// 0 = Sun .. 6 = Sat, matching the backend's recurrence_days convention
// (adminTaskService.js). Displayed Mon-first for a familiar week layout.
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const LEVEL_TARGET_OPTIONS: LevelTarget[] = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

// Mirrors adminTaskService.js#XP_CAP — daily admin-authored tasks cap at 10
// XP, weekly quests at 70, keeping admin-created tasks in line with the
// fixed routine tasks instead of skewing the XP economy.
const XP_CAP: Record<CreatableTaskType, number> = { DAILY_ADMIN: 10, WEEKLY: 70 };

const DEFAULT_FORM: TaskInput = {
  title: '',
  description: '',
  tag: '',
  imageUrl: '',
  taskType: 'DAILY_ADMIN',
  isRecurring: false,
  recurrenceDays: [],
  startDate: null,
  endDate: null,
  levelTarget: 'ALL',
  targetValue: 1,
  targetUnit: '',
  allowsPartial: false,
  xpPartial: null,
  xpReward: 10,
};

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

export function TaskForm({ initialTask }: { initialTask?: Task }) {
  const router = useRouter();
  const [form, setForm] = React.useState<TaskInput>(
    initialTask && (initialTask.taskType === 'DAILY_ADMIN' || initialTask.taskType === 'WEEKLY')
      ? {
          title: initialTask.title,
          description: initialTask.description,
          tag: initialTask.tag,
          imageUrl: initialTask.imageUrl ?? '',
          taskType: initialTask.taskType,
          isRecurring: initialTask.isRecurring,
          recurrenceDays: initialTask.recurrenceDays,
          // Normalized to plain 'YYYY-MM-DD' up front (matching what the date
          // inputs' onChange produces) — the backend rejects the full ISO
          // datetime string these come back from the API as.
          startDate: toDateInput(initialTask.startDate) || null,
          endDate: toDateInput(initialTask.endDate) || null,
          levelTarget: initialTask.levelTarget,
          targetValue: initialTask.targetValue ?? 1,
          targetUnit: initialTask.targetUnit ?? '',
          allowsPartial: initialTask.allowsPartial,
          xpPartial: initialTask.xpPartial,
          xpReward: initialTask.xpReward,
        }
      : DEFAULT_FORM
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((f: TaskInput) => ({ ...f, [key]: value }));

  const changeTaskType = (taskType: CreatableTaskType) => {
    const cap = XP_CAP[taskType];
    setForm((f) => ({ ...f, taskType, xpReward: Math.min(f.xpReward, cap), recurrenceDays: taskType === 'WEEKLY' ? f.recurrenceDays : [] }));
  };

  const toggleRecurrenceDay = (day: number) => {
    const current = form.recurrenceDays ?? [];
    update('recurrenceDays', current.includes(day) ? current.filter((d) => d !== day) : [...current, day]);
  };

  const cap = XP_CAP[form.taskType];
  const rewardEligibility = deriveRewardEligibility(form.xpReward, form.taskType);

  const isValid =
    form.title.trim().length > 0 &&
    form.targetUnit.trim().length > 0 &&
    form.xpReward > 0 &&
    form.xpReward <= cap &&
    !!form.startDate &&
    (form.taskType !== 'WEEKLY' || form.recurrenceDays.length > 0) &&
    (!form.isRecurring || !!form.endDate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setSubmitting(true);
    setError(null);
    try {
      if (initialTask) {
        await updateTask(initialTask.id, form);
        router.push(`/tasks/${initialTask.id}`);
      } else {
        const created = await createTask(form);
        router.push(`/tasks/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save this task.');
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
          <Select label="Type" value={form.taskType} onChange={(e) => changeTaskType(e.target.value as CreatableTaskType)}>
            <option value="DAILY_ADMIN">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </Select>
          <Select label="Level Target" value={form.levelTarget} onChange={(e) => update('levelTarget', e.target.value as LevelTarget)}>
            {LEVEL_TARGET_OPTIONS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl === 'ALL' ? 'All Levels' : lvl.charAt(0) + lvl.slice(1).toLowerCase()}</option>
            ))}
          </Select>
        </div>
        <Switch
          checked={form.isRecurring}
          onCheckedChange={(checked) => update('isRecurring', checked)}
          label="Recurring"
          description={
            form.taskType === 'WEEKLY'
              ? 'On: repeats every week through an end date you set. Off: a single 7-day window.'
              : 'On: repeats every day through an end date you set. Off: assignable on start date only.'
          }
        />
        {form.taskType === 'WEEKLY' && (
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
          <DatePicker
            label="Start Date"
            value={toDateInput(form.startDate)}
            onChange={(e) => update('startDate', e.target.value || null)}
            required
          />
          {form.isRecurring && (
            <DatePicker
              label="End Date"
              value={toDateInput(form.endDate)}
              onChange={(e) => update('endDate', e.target.value || null)}
              required
            />
          )}
        </div>
      </Card>

      <Card className="space-y-5">
        <SectionHeader title="Completion Criteria" description="What counts as done, and the XP it earns." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Target Value"
            type="number"
            value={form.targetValue ?? ''}
            onChange={(e) => update('targetValue', e.target.value ? Number(e.target.value) : null)}
          />
          <Input label="Unit" placeholder="e.g. km, minutes, steps" value={form.targetUnit} onChange={(e) => update('targetUnit', e.target.value)} required />
        </div>
        <Input
          label={`XP Reward (max ${cap} for ${form.taskType === 'WEEKLY' ? 'Weekly' : 'Daily'} tasks)`}
          type="number"
          max={cap}
          value={form.xpReward}
          onChange={(e) => update('xpReward', Number(e.target.value))}
          required
        />
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
            max={form.xpReward - 1}
            value={form.xpPartial ?? ''}
            onChange={(e) => update('xpPartial', e.target.value ? Number(e.target.value) : null)}
          />
        )}
      </Card>

      <Card className="space-y-3">
        <SectionHeader title="Reward Eligibility" description="Auto-derived from the XP reward relative to this task type's cap." />
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/30 text-ink-muted">
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <Badge variant={rewardEligibility === 'bonus' ? 'warning' : 'muted'}>
            {rewardEligibility}
          </Badge>
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-bad-ink/20 bg-bad-ink/10 text-bad-ink text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

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
