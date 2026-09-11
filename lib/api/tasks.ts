import type {
  Task,
  TaskStats,
  TaskType,
  VerificationMethod,
  TaskCompletionLogEntry,
  TaskAssignmentStats,
  PendingReviewItem,
  RewardEligibility,
  TaskInput,
} from '@/types/task';

function daysAgoIso(days: number, hour = 9): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function deriveRewardEligibility(xpReward: number, method: VerificationMethod): RewardEligibility {
  if (method === 'gps_tracked' || method === 'health_sync') return xpReward >= 200 ? 'premium' : 'bonus';
  if (xpReward >= 150) return 'bonus';
  return 'standard';
}

type TaskSeed = {
  title: string;
  description: string;
  tag: string;
  type: TaskType;
  targetValue: number;
  targetUnit: string;
  xpReward: number;
  verificationMethod: VerificationMethod;
  status: Task['status'];
  isDefaultDaily?: boolean;
  levelTarget?: number | null;
};

const TASK_SEEDS: TaskSeed[] = [
  { title: 'Morning 5K Run', description: 'Complete a 5km run before 9am, tracked live via GPS.', tag: 'Fitness', type: 'daily', targetValue: 5, targetUnit: 'km', xpReward: 220, verificationMethod: 'gps_tracked', status: 'active', isDefaultDaily: true },
  { title: '10-Minute Meditation', description: 'Practice mindful breathing for 10 minutes.', tag: 'Mindfulness', type: 'daily', targetValue: 10, targetUnit: 'minutes', xpReward: 60, verificationMethod: 'manual', status: 'active', isDefaultDaily: true },
  { title: 'Deep Work Block', description: 'Focus on a single task for 90 minutes, distraction-free.', tag: 'Productivity', type: 'daily', targetValue: 90, targetUnit: 'minutes', xpReward: 250, verificationMethod: 'manual', status: 'active' },
  { title: 'Read 20 Pages', description: 'Read at least 20 pages of any book.', tag: 'Learning', type: 'daily', targetValue: 20, targetUnit: 'pages', xpReward: 80, verificationMethod: 'manual', status: 'active' },
  { title: 'Cold Shower Challenge', description: 'Take a 3-minute cold shower.', tag: 'Fitness', type: 'daily', targetValue: 3, targetUnit: 'minutes', xpReward: 200, verificationMethod: 'photo_review', status: 'inactive' },
  { title: 'Weekly Journal Entry', description: 'Write a reflection on the past week.', tag: 'Mindfulness', type: 'weekly', targetValue: 1, targetUnit: 'entry', xpReward: 120, verificationMethod: 'manual', status: 'inactive' },
  { title: '10,000 Steps', description: 'Hit 10,000 steps, synced automatically from your health app.', tag: 'Fitness', type: 'daily', targetValue: 10000, targetUnit: 'steps', xpReward: 150, verificationMethod: 'health_sync', status: 'active', isDefaultDaily: true },
  { title: 'Sleep 7+ Hours', description: 'Log 7 or more hours of sleep, synced from your health app.', tag: 'Wellness', type: 'daily', targetValue: 7, targetUnit: 'hours', xpReward: 100, verificationMethod: 'health_sync', status: 'active' },
  { title: 'Trail Hike Challenge', description: 'Complete a 10km trail hike, tracked via GPS.', tag: 'Fitness', type: 'weekly', targetValue: 10, targetUnit: 'km', xpReward: 300, verificationMethod: 'gps_tracked', status: 'active', levelTarget: 5 },
  { title: 'Meal Prep Photo', description: 'Submit a photo of a healthy home-cooked meal.', tag: 'Nutrition', type: 'daily', targetValue: 1, targetUnit: 'meal', xpReward: 90, verificationMethod: 'photo_review', status: 'active' },
  { title: 'No Sugar Day', description: 'Log a full day without added sugar.', tag: 'Nutrition', type: 'daily', targetValue: 1, targetUnit: 'day', xpReward: 110, verificationMethod: 'manual', status: 'active' },
  { title: 'Monthly Distance Goal', description: 'Accumulate 100km of tracked movement this month.', tag: 'Fitness', type: 'monthly', targetValue: 100, targetUnit: 'km', xpReward: 500, verificationMethod: 'gps_tracked', status: 'active', levelTarget: 10 },
  { title: 'Gratitude List', description: 'Write down three things you are grateful for.', tag: 'Mindfulness', type: 'daily', targetValue: 3, targetUnit: 'items', xpReward: 50, verificationMethod: 'manual', status: 'active' },
  { title: 'Progress Photo Check-in', description: 'Submit a physique progress photo for review.', tag: 'Fitness', type: 'weekly', targetValue: 1, targetUnit: 'photo', xpReward: 140, verificationMethod: 'photo_review', status: 'active' },
  { title: 'Founders Launch Challenge', description: 'One-time challenge for early hunters — complete any 5 tasks.', tag: 'Community', type: 'one_time', targetValue: 5, targetUnit: 'tasks', xpReward: 400, verificationMethod: 'manual', status: 'inactive' },
];

const MOCK_TASKS: Task[] = TASK_SEEDS.map((seed, i) => ({
  id: `tsk_${2001 + i}`,
  title: seed.title,
  description: seed.description,
  tag: seed.tag,
  imageUrl: null,
  type: seed.type,
  isDefaultDaily: seed.isDefaultDaily ?? false,
  recurrenceDays: seed.type === 'weekly' ? ['mon', 'wed', 'fri'] : null,
  startDate: daysAgoIso(180 - i * 5, 0),
  endDate: null,
  levelTarget: seed.levelTarget ?? null,
  targetValue: seed.targetValue,
  targetUnit: seed.targetUnit,
  allowsPartial: seed.verificationMethod !== 'photo_review',
  xpPartial: seed.verificationMethod !== 'photo_review' ? Math.round(seed.xpReward * 0.4) : null,
  xpReward: seed.xpReward,
  verificationMethod: seed.verificationMethod,
  verificationConfig:
    seed.verificationMethod === 'gps_tracked'
      ? { gpsMinDistanceKm: seed.targetValue, gpsMaxDurationMin: 180 }
      : seed.verificationMethod === 'health_sync'
        ? { healthMetric: seed.targetUnit === 'steps' ? 'steps' : 'sleep_hours', healthSyncProvider: 'apple_health' }
        : seed.verificationMethod === 'photo_review'
          ? { photoRequiresTimestamp: true, photoInstructions: 'Ensure good lighting and full framing.' }
          : { requiresNote: false },
  rewardEligibility: deriveRewardEligibility(seed.xpReward, seed.verificationMethod),
  status: seed.status,
  createdAt: daysAgoIso(200 - i * 5, 7),
}));

const USER_NAMES = ['Ava Thompson', 'Marcus Lee', 'Priya Sharma', 'Diego Fernandez', 'Grace Kim', 'Noah Williams', 'Liam Carter', 'Sofia Rossi'];

const MOCK_COMPLETION_LOG: TaskCompletionLogEntry[] = MOCK_TASKS.flatMap((task, ti) =>
  Array.from({ length: 4 }, (_, i) => ({
    id: `cmp_${task.id}_${i}`,
    taskId: task.id,
    userId: `usr_${1001 + ((ti + i) % 8)}`,
    userName: USER_NAMES[(ti + i) % USER_NAMES.length],
    date: daysAgoIso(i + 1, 8 + i),
    valueAchieved: task.targetValue - (i % 2 === 0 ? 0 : Math.round(task.targetValue * 0.2)),
    verificationStatus: (['approved', 'approved', 'pending', 'rejected'] as const)[(ti + i) % 4],
  }))
);

const REVIEW_TASKS = MOCK_TASKS.filter((t) => t.verificationMethod === 'gps_tracked' || t.verificationMethod === 'photo_review');

const MOCK_PENDING_REVIEWS: PendingReviewItem[] = REVIEW_TASKS.flatMap((task, i) => [
  {
    id: `rev_${task.id}_a`,
    taskId: task.id,
    taskTitle: task.title,
    userId: `usr_${1001 + i}`,
    userName: USER_NAMES[i % USER_NAMES.length],
    submittedValue: task.targetValue * 1.1,
    submittedUnit: task.targetUnit,
    submittedAt: daysAgoIso(i, 10),
    verificationMethod: task.verificationMethod,
    gpsSessionSummary: task.verificationMethod === 'gps_tracked' ? `Route logged ${(task.targetValue * 1.1).toFixed(1)} ${task.targetUnit} over 38 min, avg pace steady.` : null,
    photoUrl: task.verificationMethod === 'photo_review' ? '/mock/review-photo-placeholder.jpg' : null,
    flagReason: task.verificationMethod === 'gps_tracked' ? 'GPS speed spike detected — possible vehicle assist.' : 'Photo metadata timestamp mismatch.',
    status: 'pending',
  },
  {
    id: `rev_${task.id}_b`,
    taskId: task.id,
    taskTitle: task.title,
    userId: `usr_${1005 + i}`,
    userName: USER_NAMES[(i + 3) % USER_NAMES.length],
    submittedValue: task.targetValue * 0.8,
    submittedUnit: task.targetUnit,
    submittedAt: daysAgoIso(i + 1, 15),
    verificationMethod: task.verificationMethod,
    gpsSessionSummary: task.verificationMethod === 'gps_tracked' ? `Route logged ${(task.targetValue * 0.8).toFixed(1)} ${task.targetUnit}, GPS signal dropped twice.` : null,
    photoUrl: task.verificationMethod === 'photo_review' ? '/mock/review-photo-placeholder.jpg' : null,
    flagReason: task.verificationMethod === 'gps_tracked' ? 'Distance below target — flagged for manual confirmation.' : 'Submitted photo appears reused from a prior week.',
    status: 'pending',
  },
]);

export async function getTasks(): Promise<Task[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks -> { success: true, data: Task[] }
  return MOCK_TASKS;
}

export async function getTaskById(id: string): Promise<Task | null> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks/:id -> { success: true, data: Task }
  return MOCK_TASKS.find((t) => t.id === id) ?? null;
}

export async function getTaskStats(): Promise<TaskStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks/stats -> { success: true, data: TaskStats }
  const active = MOCK_TASKS.filter((t) => t.status === 'active');
  return {
    totalTasks: MOCK_TASKS.length,
    activeTasks: active.length,
    pendingReviews: MOCK_PENDING_REVIEWS.filter((r) => r.status === 'pending').length,
    avgXpReward: Math.round(MOCK_TASKS.reduce((sum, t) => sum + t.xpReward, 0) / MOCK_TASKS.length),
    completionsToday: 47,
  };
}

export async function getTaskCompletionLog(taskId: string): Promise<TaskCompletionLogEntry[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks/:id/completions -> { success: true, data: TaskCompletionLogEntry[] }
  return MOCK_COMPLETION_LOG.filter((c) => c.taskId === taskId);
}

export async function getTaskAssignmentStats(taskId: string): Promise<TaskAssignmentStats> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks/:id/assignment-stats -> { success: true, data: TaskAssignmentStats }
  const logs = MOCK_COMPLETION_LOG.filter((c) => c.taskId === taskId);
  const approved = logs.filter((l) => l.verificationStatus === 'approved').length;
  return {
    usersAssigned: 40 + logs.length * 12,
    completionRate: logs.length ? Math.round((approved / logs.length) * 100) : 0,
    avgCompletionTimeMin: 25 + (taskId.length % 20),
  };
}

export async function getPendingReviews(): Promise<PendingReviewItem[]> {
  // TODO: API - replace with real endpoint. Expected: GET /api/v1/admin/tasks/review-queue -> { success: true, data: PendingReviewItem[] }
  return MOCK_PENDING_REVIEWS;
}

export async function createTask(input: TaskInput): Promise<Task> {
  // TODO: API - replace with real endpoint. Expected: POST /api/v1/admin/tasks -> { success: true, data: Task }
  const task: Task = {
    ...input,
    id: `tsk_${2001 + MOCK_TASKS.length + Math.floor(Math.random() * 1000)}`,
    rewardEligibility: deriveRewardEligibility(input.xpReward, input.verificationMethod),
    createdAt: new Date().toISOString(),
  };
  MOCK_TASKS.push(task);
  return task;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task | null> {
  // TODO: API - replace with real endpoint. Expected: PUT /api/v1/admin/tasks/:id -> { success: true, data: Task }
  const index = MOCK_TASKS.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated: Task = {
    ...MOCK_TASKS[index],
    ...input,
    rewardEligibility: deriveRewardEligibility(input.xpReward, input.verificationMethod),
  };
  MOCK_TASKS[index] = updated;
  return updated;
}
