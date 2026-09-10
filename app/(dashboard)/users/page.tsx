import { getUsers, getUserStats } from '@/lib/api/users';
import { Card } from '@/components/ui/card';
import { Users as UsersIcon, Activity, TrendingUp, Flame } from 'lucide-react';
import { UsersTable } from './_components/users-table';

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'text-accent-ink' },
    { name: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-ok-ink' },
    { name: 'Avg Level', value: stats.avgLevel, icon: TrendingUp, color: 'text-warn-ink' },
    { name: 'Avg Streak', value: `${stats.avgStreak}d`, icon: Flame, color: 'text-caution-ink' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage registered players, review progress, and moderate accounts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-lg bg-surface-inset/60 border border-line ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-ink">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <UsersTable users={users} />
    </div>
  );
}
