import { getMissions, getMissionStats } from '@/lib/api/missions';
import { Card } from '@/components/ui/card';
import { Target, Zap, CheckCircle2, Coins } from 'lucide-react';
import { MissionsTable } from './_components/missions-table';

export default async function MissionsPage() {
  const [missions, stats] = await Promise.all([getMissions(), getMissionStats()]);

  const statCards = [
    { name: 'Total Missions', value: stats.totalMissions, icon: Target, color: 'text-accent-ink' },
    { name: 'Active Missions', value: stats.activeMissions, icon: Zap, color: 'text-ok-ink' },
    { name: 'Completions Today', value: stats.completionsToday, icon: CheckCircle2, color: 'text-warn-ink' },
    { name: 'Avg XP Reward', value: stats.avgXpReward, icon: Coins, color: 'text-caution-ink' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Missions</h1>
        <p className="text-sm text-ink-muted mt-1">
          Define daily habits, assign XP rewards, and manage mission availability.
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

      <MissionsTable missions={missions} />
    </div>
  );
}
