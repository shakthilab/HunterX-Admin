import { getUsers, getUserStats } from '@/lib/api/users';
import { Card } from '@/components/ui/card';
import { Users as UsersIcon, Activity, TrendingUp, Flame } from 'lucide-react';
import { UsersTable } from './_components/users-table';

export default async function UsersPage() {
  const [users, stats] = await Promise.all([getUsers(), getUserStats()]);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'text-violet-400' },
    { name: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-emerald-400' },
    { name: 'Avg Level', value: stats.avgLevel, icon: TrendingUp, color: 'text-amber-400' },
    { name: 'Avg Streak', value: `${stats.avgStreak}d`, icon: Flame, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Users</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage registered players, review progress, and moderate accounts.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.name}
                </span>
                <div className={`p-2 rounded-lg bg-slate-950/60 border border-slate-800 ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <UsersTable users={users} />
    </div>
  );
}
