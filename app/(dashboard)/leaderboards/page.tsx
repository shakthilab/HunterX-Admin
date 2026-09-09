import { getLeaderboard, getLeaderboardStats } from '@/lib/api/leaderboards';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, TrendingUp } from 'lucide-react';
import { LeaderboardTable } from './_components/leaderboard-table';

export default async function LeaderboardsPage() {
  const [entries, stats] = await Promise.all([getLeaderboard(), getLeaderboardStats()]);

  const statCards = [
    { name: 'Total Participants', value: stats.totalParticipants, icon: Trophy, color: 'text-violet-400' },
    { name: 'Top Streak', value: `${stats.topStreak}d`, icon: Flame, color: 'text-orange-400' },
    { name: 'Top XP This Week', value: stats.topXpThisWeek.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Leaderboards</h1>
        <p className="text-sm text-slate-400 mt-1">
          Track top performers by XP, level, and current streak.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      <LeaderboardTable entries={entries} />
    </div>
  );
}
