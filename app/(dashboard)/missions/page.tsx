import { getMissions, getMissionStats } from '@/lib/api/missions';
import { Card } from '@/components/ui/card';
import { Target, Zap, CheckCircle2, Coins } from 'lucide-react';
import { MissionsTable } from './_components/missions-table';

export default async function MissionsPage() {
  const [missions, stats] = await Promise.all([getMissions(), getMissionStats()]);

  const statCards = [
    { name: 'Total Missions', value: stats.totalMissions, icon: Target, color: 'text-violet-400' },
    { name: 'Active Missions', value: stats.activeMissions, icon: Zap, color: 'text-emerald-400' },
    { name: 'Completions Today', value: stats.completionsToday, icon: CheckCircle2, color: 'text-amber-400' },
    { name: 'Avg XP Reward', value: stats.avgXpReward, icon: Coins, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Missions</h1>
        <p className="text-sm text-slate-400 mt-1">
          Define daily habits, assign XP rewards, and manage mission availability.
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

      <MissionsTable missions={missions} />
    </div>
  );
}
