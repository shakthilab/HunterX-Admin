'use client';

import * as React from 'react';
import { getSessionUser } from '@/lib/auth/actions';
import { Card } from '@/components/ui/card';
import type { User } from '@/types/user';
import { 
  Users, 
  Target, 
  ShieldCheck, 
  Network,
  Cpu
} from 'lucide-react';
import { env } from '@/config/env';

export default function OverviewPage() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    getSessionUser().then((sessionUser) => {
      setUser(sessionUser);
    });
  }, []);

  const stats = [
    { name: 'Connected Backend', value: env.apiUrl, icon: Network, color: 'text-emerald-400', desc: 'Active environment URL' },
    { name: 'Admin Session Role', value: user?.role || 'Admin', icon: ShieldCheck, color: 'text-violet-400', desc: 'Current authorization status' },
    { name: 'System Engine', value: 'Express + Supabase', icon: Cpu, color: 'text-amber-400', desc: 'Backend infrastructure' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl border border-violet-500/20 bg-slate-900/40 overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.05)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Welcome back, {user?.displayName || 'Admin'}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Arise Admin dashboard project base foundation has successfully loaded. Authentication, session parsing, route middleware, and design primitives are running successfully.
          </p>
        </div>
      </div>

      {/* Connection Info */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} glow className="flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.name}</span>
                <div className={`p-2 rounded-lg bg-slate-950/60 border border-slate-800 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-slate-100 truncate">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature CRUD Preview List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight text-white">System Status & Module Ready States</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-slate-200">User CRUD Operations</h4>
                <span className="text-[10px] bg-slate-950/60 text-slate-500 px-2 py-0.5 rounded-full border border-slate-800 font-bold uppercase tracking-wider">
                  Pending Phase 2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                View, search, edit user levels, reset streaks, and review custom achievements.
              </p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-slate-200">Mission & Task Configurator</h4>
                <span className="text-[10px] bg-slate-950/60 text-slate-500 px-2 py-0.5 rounded-full border border-slate-800 font-bold uppercase tracking-wider">
                  Pending Phase 2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Define daily habits, assign game XP values, edit descriptions, and structure reward categories.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
