'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAction, getSessionUser } from '@/lib/auth/actions';
import { getUsers } from '@/lib/api/users';
import { getTasks } from '@/lib/api/tasks';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { DropdownMenu, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import type { User } from '@/types/user';
import type { Task } from '@/types/task';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  ListChecks,
  Trophy,
  CreditCard,
  Share2,
  Gift,
  MessageSquare,
  Gem,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Search,
  KeyRound,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  enabled: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, enabled: true },
  { name: 'Users', href: '/users', icon: Users, enabled: true },
  { name: 'Tasks', href: '/tasks', icon: ListChecks, enabled: true },
  { name: 'Leaderboards', href: '/leaderboards', icon: Trophy, enabled: false },
  { name: 'Subscriptions & Billing', href: '/subscriptions', icon: CreditCard, enabled: false },
  { name: 'Referrals', href: '/referrals', icon: Share2, enabled: false },
  { name: 'Rewards & Coupons', href: '/rewards', icon: Gift, enabled: false },
  { name: 'Feedback & Support', href: '/feedback', icon: MessageSquare, enabled: false },
  { name: 'Cosmetics & Dragons', href: '/cosmetics', icon: Gem, enabled: false },
  { name: 'Notifications', href: '/notifications', icon: Bell, enabled: false },
  { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3, enabled: false },
  { name: 'Settings & Permissions', href: '/settings', icon: Settings, enabled: false },
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              active
                ? 'bg-accent/10 text-accent-ink border border-accent/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]'
                : 'text-ink-muted hover:text-ink hover:bg-surface/60 border border-transparent'
            } ${!item.enabled && !active ? 'opacity-70' : ''}`}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span className="truncate">{item.name}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
            {!item.enabled && (
              <span className="ml-auto shrink-0 text-[9px] text-ink-faint border border-line rounded-full px-1.5 py-0.5 uppercase tracking-wider">
                Soon
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    getUsers().then(setUsers);
    getTasks().then(setTasks);
  }, []);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const matchedUsers = q ? users.filter((u) => `${u.displayName} ${u.email} ${u.hunterId}`.toLowerCase().includes(q)).slice(0, 4) : [];
  const matchedTasks = q ? tasks.filter((t) => `${t.title} ${t.tag}`.toLowerCase().includes(q)).slice(0, 4) : [];
  const showDropdown = focused && q.length > 0;

  const goTo = (href: string) => {
    setQuery('');
    setFocused(false);
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-xs" ref={ref}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="Search users, tasks..."
        className="w-full pl-9 pr-3 py-2 rounded-lg border border-line bg-surface-inset/50 text-sm text-ink placeholder-ink-faint transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      />
      {showDropdown && (
        <div className="absolute mt-2 w-full rounded-xl border border-line bg-surface shadow-2xl overflow-hidden z-40 max-h-80 overflow-y-auto">
          {matchedUsers.length === 0 && matchedTasks.length === 0 && (
            <p className="px-4 py-3 text-sm text-ink-faint">No matches for &ldquo;{query}&rdquo;.</p>
          )}
          {matchedUsers.length > 0 && (
            <div className="py-1">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Users</p>
              {matchedUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => goTo(`/users/${u.id}`)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-ink hover:bg-surface-inset cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                  <span className="truncate">{u.displayName}</span>
                  <span className="text-xs text-ink-faint truncate ml-auto">{u.hunterId}</span>
                </button>
              ))}
            </div>
          )}
          {matchedTasks.length > 0 && (
            <div className="py-1 border-t border-line">
              <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Tasks</p>
              {matchedTasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => goTo(`/tasks/${t.id}`)}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm text-ink hover:bg-surface-inset cursor-pointer"
                >
                  <ListChecks className="w-3.5 h-3.5 text-ink-faint shrink-0" />
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  const activeItem = NAV_ITEMS.find((item) => isActive(pathname, item.href));
  const pageTitle = activeItem?.name ?? 'Admin Area';

  return (
    <div className="flex h-screen overflow-hidden bg-app text-ink">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-line bg-surface/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-line shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
            <Sparkles className="w-4 h-4 text-accent-ink" />
          </div>
          <span className="font-bold tracking-tight text-ink">Arise Control</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </nav>

        {/* Desktop Admin Profile */}
        <div className="p-4 border-t border-line bg-surface-inset/40 shrink-0">
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
        <div className="flex items-center justify-between px-6 h-16 border-b border-line shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center border border-accent/20">
              <Sparkles className="w-4 h-4 text-accent-ink" />
            </div>
            <span className="font-bold tracking-tight text-ink">Arise Control</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-ink-muted hover:bg-line focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLinks pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
        </nav>

        {/* Mobile Admin Profile */}
        <div className="p-4 border-t border-line bg-surface-inset/40 shrink-0">
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
        <header className="shrink-0 flex items-center justify-between gap-4 px-6 h-16 border-b border-line bg-surface/20 backdrop-blur-md relative z-30">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-lg text-ink-muted hover:bg-line focus:outline-none md:hidden shrink-0"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-ink md:text-lg truncate">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="hidden lg:block">
              <GlobalSearch />
            </div>
            <ThemeToggle />
            <DropdownMenu
              trigger={
                <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface-inset border border-transparent hover:border-line transition-colors">
                  <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink text-xs font-bold shrink-0">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div className="hidden sm:flex flex-col items-start text-left">
                    <span className="text-xs font-semibold text-ink truncate max-w-[140px]">{user?.email}</span>
                    <span className="text-[10px] text-ink-faint">{user?.role || 'admin'}</span>
                  </div>
                </div>
              }
            >
              <div className="px-4 py-3 border-b border-line">
                <p className="text-sm font-semibold text-ink truncate">{user?.displayName}</p>
                <p className="text-xs text-ink-faint truncate">{user?.email}</p>
              </div>
              <DropdownMenuItem>
                <KeyRound className="w-4 h-4" />
                Auth: {user?.authProvider ?? 'email'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} danger>
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenu>
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
