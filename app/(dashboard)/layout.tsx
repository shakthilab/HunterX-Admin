'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction, getSessionUser } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import type { User } from '@/types/user';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Trophy,
  Target,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    getSessionUser().then((sessionUser) => {
      if (sessionUser) {
        setUser(sessionUser);
      }
    });
  }, []);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard, active: pathname === '/overview' },
    { name: 'Users', href: '/users', icon: Users, active: pathname.startsWith('/users') },
    { name: 'Missions', href: '/missions', icon: Target, active: pathname.startsWith('/missions') },
    { name: 'Leaderboards', href: '/leaderboards', icon: Trophy, active: pathname.startsWith('/leaderboards') },
  ];

  const pageTitles: Record<string, string> = {
    '/overview': 'Dashboard Overview',
    '/users': 'Users',
    '/missions': 'Missions',
    '/leaderboards': 'Leaderboards',
  };
  const pageTitle =
    pageTitles[Object.keys(pageTitles).find((path) => pathname.startsWith(path)) ?? ''] ?? 'Admin Area';

  return (
    <div className="flex h-screen overflow-hidden bg-app text-ink">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-line">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
            <Sparkles className="w-4 h-4 text-accent-ink" />
          </div>
          <span className="font-bold tracking-tight text-ink">Arise Control</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? 'bg-accent/10 text-accent-ink border border-accent/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]'
                    : 'text-ink-muted hover:text-ink hover:bg-surface/60 border border-transparent'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.name}</span>
                {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Admin Profile */}
        <div className="p-4 border-t border-line bg-surface-inset/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink font-bold overflow-hidden">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {user?.displayName || 'Loading Admin...'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span className="text-[10px] text-accent-ink font-bold uppercase tracking-wider">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-ink-muted hover:text-bad-ink hover:bg-red-950/20 border border-line hover:border-red-900/30 py-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-line bg-surface/95 backdrop-blur-md transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent-ink" />
            </div>
            <span className="font-bold tracking-tight text-ink">Arise Control</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-ink-muted hover:bg-line focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? 'bg-accent/10 text-accent-ink border border-accent/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]'
                    : 'text-ink-muted hover:text-ink hover:bg-surface/60 border border-transparent'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.name}</span>
                {item.active && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Admin Profile */}
        <div className="p-4 border-t border-line bg-surface-inset/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink font-bold overflow-hidden">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {user?.displayName || 'Loading Admin...'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span className="text-[10px] text-accent-ink font-bold uppercase tracking-wider">
                  {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-ink-muted hover:text-bad-ink hover:bg-red-950/20 border border-line hover:border-red-900/30 py-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-x-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-6 h-16 border-b border-line bg-surface/20 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg text-ink-muted hover:bg-line focus:outline-none md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-ink md:text-lg">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-ink">{user?.email}</span>
              <span className="text-[10px] text-ink-faint">ID: {user?.id}</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
