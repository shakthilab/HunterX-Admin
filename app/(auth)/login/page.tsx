'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { Sparkles, Lock, Mail, AlertTriangle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await loginAction(email, password);
      if (res.success) {
        const redirectTo = searchParams.get('redirectTo') || '/';
        router.push(redirectTo);
        router.refresh();
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card glow className="border-line bg-surface-inset/60 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg border border-red-500/20 bg-red-500/10 text-bad-ink text-sm">
            <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-[38px] w-4.5 h-4.5 text-ink-faint" />
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@yopmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-[38px] w-4.5 h-4.5 text-ink-faint" />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2 cursor-pointer py-3"
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-app to-app relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <ThemeToggle className="absolute top-6 right-6 z-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20 mb-4 shadow-[0_0_20px_rgba(124,58,237,0.15)]">
            <Sparkles className="w-6 h-6 text-accent-ink" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Arise Admin</h1>
          <p className="text-sm text-ink-muted mt-1">Sign in to control the gaming engine</p>
        </div>

        <React.Suspense fallback={
          <Card className="border-line bg-surface-inset/60 shadow-xl flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent-ink animate-spin" />
            <p className="text-sm text-ink-muted">Loading secure portal...</p>
          </Card>
        }>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
