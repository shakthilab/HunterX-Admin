// Task shape matches the real backend (Arise-Backend prisma/schema.prisma
// `tasks` model) — task_type/level_target/recurrence_days etc, not the
// verification-method/monthly/one-time concepts from the old mock contract.
// Those old concepts (VerificationMethod, PendingReviewItem) are kept below
// only for the Review Queue page, which has no backing data model yet and
// always renders empty (see lib/api/tasks.ts#getPendingReviews) — nothing
// creates or edits a PendingReviewItem.

export type TaskType = 'DAILY_ADMIN' | 'WEEKLY' | 'DAILY_FIXED';
export type CreatableTaskType = 'DAILY_ADMIN' | 'WEEKLY';
export type TaskStatus = 'active' | 'inactive';
export type LevelTarget = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type RewardEligibility = 'standard' | 'bonus';
export type CompletionStatus = 'COMPLETED' | 'SKIPPED' | 'PARTIAL';

export type Task = {
  id: string;
  title: string;
  description: string;
  tag: string;
  imageUrl: string | null;
  taskType: TaskType;
  isDefaultDaily: boolean;
  isRecurring: boolean;
  recurrenceDays: number[]; // 0=Sun..6=Sat — WEEKLY only
  startDate: string | null;
  endDate: string | null;
  levelTarget: LevelTarget;
  targetValue: number | null;
  targetUnit: string | null;
  allowsPartial: boolean;
  xpPartial: number;
  xpReward: number;
  rewardEligibility: RewardEligibility;
  status: TaskStatus;
  createdAt: string;
};

// Only DAILY_ADMIN/WEEKLY are admin-creatable — DAILY_FIXED routines are
// seed-managed (see adminTaskService.js).
export type TaskInput = {
  title: string;
  description: string;
  tag: string;
  imageUrl: string | null;
  taskType: CreatableTaskType;
  isRecurring: boolean;
  recurrenceDays: number[];
  startDate: string | null; // 'YYYY-MM-DD'
  endDate: string | null; // 'YYYY-MM-DD', required when isRecurring
  levelTarget: LevelTarget;
  targetValue: number | null;
  targetUnit: string;
  allowsPartial: boolean;
  xpPartial: number | null;
  xpReward: number;
};

export type TaskStats = {
  totalTasks: number;
  activeTasks: number;
  pendingReviews: number;
  avgXpReward: number;
  completionsToday: number;
};

export type TaskCompletionLogEntry = {
  id: string;
  userId: string;
  userName: string;
  hunterId: string;
  date: string;
  valueAchieved: number | null;
  status: CompletionStatus;
  xpEarned: number;
};

export type TaskAssignmentStats = {
  usersAssigned: number;
  completionRate: number;
  avgCompletionTimeMin: number;
};

// ── Review Queue (no backing data model yet — see comment above) ──────────

export type VerificationMethod = 'manual' | 'gps_tracked' | 'health_sync' | 'photo_review';

export type PendingReviewItem = {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userName: string;
  submittedValue: number;
  submittedUnit: string;
  submittedAt: string;
  verificationMethod: VerificationMethod;
  gpsSessionSummary: string | null;
  photoUrl: string | null;
  flagReason: string;
  status: 'pending' | 'approved' | 'rejected';
};
