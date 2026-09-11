import { getUsers, getUserStats } from '@/lib/api/users';
import { StatCard } from '@/components/stat-card';
import { Users as UsersIcon, Activity, TrendingUp, Flame } from 'lucide-react';
import { UsersTable } from './_components/users-table';

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage registered players, review progress, and moderate accounts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard name="Total Users" value={stats.totalUsers} icon={UsersIcon} color="text-accent-ink" />
        <StatCard name="Active Today" value={stats.activeToday} icon={Activity} color="text-ok-ink" />
        <StatCard name="Avg Level" value={stats.avgLevel} icon={TrendingUp} color="text-warn-ink" />
        <StatCard name="Avg Streak" value={`${stats.avgStreak}d`} icon={Flame} color="text-caution-ink" />
      </div>

      <UsersTable users={users} />
    </div>
  );
}
