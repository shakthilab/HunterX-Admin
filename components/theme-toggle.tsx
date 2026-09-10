'use client';

import * as React from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  // Always starts at 'dark' so the client's first render matches the
  // server-rendered markup exactly (avoiding a hydration mismatch), then
  // syncs to the real attribute — already set pre-paint by the inline
  // script in the root layout — before the browser paints.
  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useLayoutEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-inset border border-transparent hover:border-line transition-colors cursor-pointer ${className ?? ''}`}
    >
      {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
    </button>
  );
}
