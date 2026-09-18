'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RankBadge } from '@/components/rank-badge';
import { StatCard } from '@/components/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { getUserStatsApi, getUsersRanksApi, getUsersListApi, type UserStats } from '@/lib/api/users';
import type { ApiUser, PaginationInfo } from '@/types/user';
import { formatDate } from '@/lib/utils';
import {
  Users as UsersIcon,
  Activity,
  TrendingUp,
  Flame,
  Search,
  Mail,
  Globe,
  Apple,
  UsersRound,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  ArrowUpDown,
} from 'lucide-react';

const LEVEL_BUCKETS = [
  { value: 'all', label: 'All Levels' },
  { value: '1-10', label: 'Level 1–10' },
  { value: '11-20', label: 'Level 11–20' },
  { value: '21-30', label: 'Level 21–30' },
  { value: '31-40', label: 'Level 31–40' },
  { value: '41-50', label: 'Level 41–50' },
  { value: '51-100', label: 'Level 51–100' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BANNED', label: 'Banned' },
];

const DATE_PRESETS = [
  { value: 'all', label: 'All Time' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const SORT_OPTIONS = [
  { value: 'signup_date', label: 'Signup Date' },
  { value: 'name', label: 'Name' },
  { value: 'level', label: 'Level' },
  { value: 'streak', label: 'Streak' },
];

function AuthIcons({ providers }: { providers?: string[] }) {
  if (!providers || providers.length === 0) return <Mail className="w-4 h-4 text-ink-faint" />;

  return (
    <div className="flex items-center gap-1.5">
      {providers.map((p, i) => {
        const upper = p.toUpperCase();
        if (upper === 'GOOGLE') return <span key={i} title="Google"><Globe className="w-4 h-4 text-accent-ink" /></span>;
        if (upper === 'APPLE') return <span key={i} title="Apple"><Apple className="w-4 h-4 text-ink" /></span>;
        return <span key={i} title="Email"><Mail className="w-4 h-4 text-ink-muted" /></span>;
      })}
    </div>
  );
}

export function UsersClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Stats (fetched once on mount, independent of table filters)
  const [stats, setStats] = React.useState<UserStats>({
    totalUsers: 0,
    activeToday: 0,
    avgLevel: 0,
    avgStreak: 0,
  });

  // 2. Ranks dropdown list (fetched once on mount)
  const [ranks, setRanks] = React.useState<string[]>([]);

  // 3. Table state
  const [users, setUsers] = React.useState<ApiUser[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total_count: 0,
    total_pages: 1,
    has_next_page: false,
  });
  const [loading, setLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [forbidden, setForbidden] = React.useState(false);

  // Read URL query parameters
  const currentSearch = searchParams.get('search') || '';
  const currentRank = searchParams.get('rank') || 'all';
  const currentLevel = searchParams.get('level') || 'all';
  const currentStatus = searchParams.get('status') || 'all';
  const currentDatePreset = searchParams.get('date_preset') || (searchParams.get('start_date') ? 'custom' : 'all');
  const currentStartDate = searchParams.get('start_date') || '';
  const currentEndDate = searchParams.get('end_date') || '';
  const currentSortBy = searchParams.get('sort_by') || 'signup_date';
  const currentPage = Number(searchParams.get('page')) || 1;
  const currentLimit = Number(searchParams.get('limit')) || 20;

  // Local state for debounced search input
  const [searchInput, setSearchInput] = React.useState(currentSearch);
  const [isCustomDate, setIsCustomDate] = React.useState(currentDatePreset === 'custom');

  // Keep local search input in sync if URL search param changes externally
  React.useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Sync custom date state
  React.useEffect(() => {
    setIsCustomDate(currentDatePreset === 'custom' || Boolean(currentStartDate || currentEndDate));
  }, [currentDatePreset, currentStartDate, currentEndDate]);

  // Fetch whole-roster stats and ranks once on mount
  React.useEffect(() => {
    async function loadInitial() {
      try {
        const [s, r] = await Promise.all([getUserStatsApi(), getUsersRanksApi()]);
        setStats(s);
        setRanks(r);
      } catch (err: any) {
        if (err?.response?.status === 403) setForbidden(true);
        if (err?.response?.status === 401) router.push('/login');
      }
    }
    loadInitial();
  }, [router]);

  // Helper to update URL search parameters
  const updateFilters = React.useCallback(
    (newParams: Record<string, string | number | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '' || val === 'all') {
          params.delete(key);
        } else {
          params.set(key, String(val));
        }
      });

      // Reset page to 1 if filters (other than page) change
      if (!('page' in newParams)) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Debounce search input (~300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilters({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateFilters]);

  // Fetch users table whenever URL query params change
  React.useEffect(() => {
    let isMounted = true;
    async function fetchTableData() {
      setLoading(true);
      setApiError(null);

      try {
        const result = await getUsersListApi({
          search: currentSearch,
          rank: currentRank,
          level: currentLevel,
          status: currentStatus,
          date_preset: isCustomDate ? undefined : currentDatePreset,
          start_date: isCustomDate ? currentStartDate : undefined,
          end_date: isCustomDate ? currentEndDate : undefined,
          sort_by: currentSortBy,
          page: currentPage,
          limit: currentLimit,
        });

        if (!isMounted) return;

        if (result.success) {
          setUsers(result.users);
          setPagination(result.pagination);
        } else {
          setUsers([]);
          setApiError(result.message || 'Failed to load users.');
          setPagination({ page: 1, limit: currentLimit, total_count: 0, total_pages: 0, has_next_page: false });
        }
      } catch (err: any) {
        if (!isMounted) return;
        if (err?.response?.status === 401) {
          router.push('/login');
          return;
        }
        if (err?.response?.status === 403) {
          setForbidden(true);
          return;
        }
        setUsers([]);
        setApiError(err?.message || 'An unexpected error occurred.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTableData();

    return () => {
      isMounted = false;
    };
  }, [
    currentSearch,
    currentRank,
    currentLevel,
    currentStatus,
    currentDatePreset,
    currentStartDate,
    currentEndDate,
    currentSortBy,
    currentPage,
    currentLimit,
    isCustomDate,
    router,
  ]);

  if (forbidden) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4 border-red-500/20 bg-red-500/5">
          <div className="p-3 rounded-full bg-red-500/10 text-bad-ink">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-ink">403 — Forbidden</h1>
          <p className="text-sm text-ink-muted max-w-md">
            Access Denied. You do not have administrator permissions to view or manage users.
          </p>
        </Card>
      </div>
    );
  }

  const hasActiveFilters =
    Boolean(currentSearch) ||
    currentRank !== 'all' ||
    currentLevel !== 'all' ||
    currentStatus !== 'all' ||
    currentDatePreset !== 'all' ||
    Boolean(currentStartDate) ||
    Boolean(currentEndDate) ||
    currentSortBy !== 'signup_date';

  const resetAllFilters = () => {
    setSearchInput('');
    setIsCustomDate(false);
    router.push(pathname, { scroll: false });
  };

  const handleDatePresetChange = (val: string) => {
    if (val === 'custom') {
      setIsCustomDate(true);
      updateFilters({ date_preset: null });
    } else {
      setIsCustomDate(false);
      updateFilters({ date_preset: val, start_date: null, end_date: null });
    }
  };

  const startIdx = (pagination.page - 1) * pagination.limit + 1;
  const endIdx = Math.min(pagination.page * pagination.limit, pagination.total_count);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Users</h1>
        <p className="text-sm text-ink-muted mt-1">
          Manage registered players, review progress, and moderate accounts.
        </p>
      </div>

      {/* 1. Whole-roster Stat Cards */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(190px,1fr))]">
        <StatCard name="TOTAL USERS" value={stats.totalUsers} icon={UsersIcon} color="text-accent-ink" />
        <StatCard name="ACTIVE TODAY" value={stats.activeToday} icon={Activity} color="text-ok-ink" />
        <StatCard name="AVG LEVEL" value={stats.avgLevel} icon={TrendingUp} color="text-warn-ink" />
        <StatCard name="AVG STREAK" value={`${stats.avgStreak}d`} icon={Flame} color="text-caution-ink" />
      </div>

      {/* 2. Main Table & Filters Card */}
      <Card className="space-y-4">
        {/* Inline API Validation Error */}
        {apiError && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-red-500/20 bg-red-500/10 text-bad-ink text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint" />
            <Input
              placeholder="Search hunter ID, name, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* All Ranks Dropdown */}
          <div className="w-38">
            <Select value={currentRank} onChange={(e) => updateFilters({ rank: e.target.value })}>
              <option value="all">All Ranks</option>
              {ranks.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>

          {/* Level Range Dropdown */}
          <div className="w-38">
            <Select value={currentLevel} onChange={(e) => updateFilters({ level: e.target.value })}>
              {LEVEL_BUCKETS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Status Dropdown (Only ACTIVE and BANNED) */}
          <div className="w-36">
            <Select value={currentStatus} onChange={(e) => updateFilters({ status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Date Preset Dropdown */}
          <div className="w-40">
            <Select
              value={isCustomDate ? 'custom' : currentDatePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              {DATE_PRESETS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Sort By Dropdown */}
          <div className="w-40">
            <Select value={currentSortBy} onChange={(e) => updateFilters({ sort_by: e.target.value })}>
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  Sort: {s.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetAllFilters} className="h-10 text-xs text-ink-muted">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>

        {/* Custom Date Pickers (Revealed when Custom Range is selected) */}
        {isCustomDate && (
          <div className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface-inset/40 flex-wrap text-xs">
            <Calendar className="w-4 h-4 text-accent-ink shrink-0" />
            <span className="font-medium text-ink">Custom Date Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-ink-faint">Start:</label>
              <input
                type="date"
                value={currentStartDate}
                onChange={(e) => updateFilters({ start_date: e.target.value })}
                className="bg-surface border border-line rounded px-2 py-1 text-ink focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-ink-faint">End:</label>
              <input
                type="date"
                value={currentEndDate}
                onChange={(e) => updateFilters({ end_date: e.target.value })}
                className="bg-surface border border-line rounded px-2 py-1 text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Main Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => updateFilters({ sort_by: 'name' })}>
                <span className="inline-flex items-center gap-1">
                  HUNTER {currentSortBy === 'name' && <ArrowUpDown className="w-3 h-3 text-accent-ink" />}
                </span>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => updateFilters({ sort_by: 'level' })}>
                <span className="inline-flex items-center gap-1">
                  LEVEL {currentSortBy === 'level' && <ArrowUpDown className="w-3 h-3 text-accent-ink" />}
                </span>
              </TableHead>
              <TableHead>RANK</TableHead>
              <TableHead className="cursor-pointer" onClick={() => updateFilters({ sort_by: 'streak' })}>
                <span className="inline-flex items-center gap-1">
                  STREAK {currentSortBy === 'streak' && <ArrowUpDown className="w-3 h-3 text-accent-ink" />}
                </span>
              </TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead className="cursor-pointer" onClick={() => updateFilters({ sort_by: 'signup_date' })}>
                <span className="inline-flex items-center gap-1">
                  SIGNUP DATE {currentSortBy === 'signup_date' && <ArrowUpDown className="w-3 h-3 text-accent-ink" />}
                </span>
              </TableHead>
              <TableHead>AUTH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              /* Loading Table Skeleton */
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-line/50" />
                      <div className="space-y-1.5">
                        <div className="w-28 h-3.5 rounded bg-line/50" />
                        <div className="w-36 h-2.5 rounded bg-line/30" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><div className="w-8 h-4 rounded bg-line/40" /></TableCell>
                  <TableCell><div className="w-16 h-5 rounded-full bg-line/40" /></TableCell>
                  <TableCell><div className="w-10 h-4 rounded bg-line/40" /></TableCell>
                  <TableCell><div className="w-14 h-5 rounded-full bg-line/40" /></TableCell>
                  <TableCell><div className="w-20 h-4 rounded bg-line/40" /></TableCell>
                  <TableCell><div className="w-6 h-4 rounded bg-line/40" /></TableCell>
                </TableRow>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-surface-inset/40 transition-colors">
                  <TableCell>
                    <Link href={`/users/${user.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent-ink text-xs font-bold shrink-0 overflow-hidden">
                        {user.avatar_url ? (
                          // eslint-disable-next-next-line @next/next/no-img-element
                          <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          (user.name || 'H').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-ink group-hover:text-accent-ink transition-colors">
                          {user.name || 'Unnamed Hunter'}
                        </p>
                        <p className="text-xs text-ink-faint">
                          {user.hunter_id} · {user.email}
                        </p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">{user.level}</TableCell>
                  <TableCell>
                    <RankBadge rank={user.rank} />
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 font-medium">
                      <Flame className={`w-3.5 h-3.5 ${user.streak > 0 ? 'text-caution-ink' : 'text-ink-faint'}`} />
                      {user.streak}d
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-ink-muted">{formatDate(user.signup_date)}</TableCell>
                  <TableCell>
                    <AuthIcons providers={user.auth_providers} />
                  </TableCell>
                </TableRow>
              ))
            ) : null}
          </TableBody>
        </Table>

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <EmptyState
            icon={UsersRound}
            message="No hunters match these filters."
          />
        )}

        {/* 3. Pagination Bar */}
        {!loading && pagination.total_count > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-line/60 text-xs text-ink-muted">
            <div>
              Showing <span className="font-semibold text-ink">{startIdx}</span> to{' '}
              <span className="font-semibold text-ink">{endIdx}</span> of{' '}
              <span className="font-semibold text-ink">{pagination.total_count}</span> hunters
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>Per page:</span>
                <select
                  value={pagination.limit}
                  onChange={(e) => updateFilters({ limit: Number(e.target.value), page: 1 })}
                  className="bg-surface border border-line rounded px-2 py-1 text-ink focus:outline-none focus:border-accent text-xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>
                  Page <span className="font-semibold text-ink">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-ink">{pagination.total_pages || 1}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => updateFilters({ page: pagination.page - 1 })}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.has_next_page}
                  onClick={() => updateFilters({ page: pagination.page + 1 })}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
