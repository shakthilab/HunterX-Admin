import * as React from 'react';
import { getSessionUser } from '@/lib/auth/actions';
import { redirect } from 'next/navigation';
import { UsersClient } from './_components/users-client';
import { Card } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default async function UsersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role && user.role.toLowerCase() !== 'admin') {
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

  return (
    <React.Suspense
      fallback={
        <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
          <div className="h-8 w-48 bg-line/50 rounded" />
          <div className="grid gap-4 grid-cols-4">
            <div className="h-24 bg-line/40 rounded-xl" />
            <div className="h-24 bg-line/40 rounded-xl" />
            <div className="h-24 bg-line/40 rounded-xl" />
            <div className="h-24 bg-line/40 rounded-xl" />
          </div>
          <div className="h-96 bg-line/30 rounded-xl" />
        </div>
      }
    >
      <UsersClient />
    </React.Suspense>
  );
}
