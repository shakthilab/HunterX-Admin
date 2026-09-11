'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AccentColorId =
  | 'violet'
  | 'indigo'
  | 'blue'
  | 'sky'
  | 'cyan'
  | 'teal'
  | 'fuchsia'
  | 'pink'
  | 'purple'
  | 'rose'
  | 'slate'
  | 'zinc';

const ACCENT_PRESETS: { id: AccentColorId; label: string; swatch: string }[] = [
  { id: 'violet', label: 'Violet', swatch: '#7c3aed' },
  { id: 'indigo', label: 'Indigo', swatch: '#4f46e5' },
  { id: 'blue', label: 'Blue', swatch: '#2563eb' },
  { id: 'sky', label: 'Sky', swatch: '#0284c7' },
  { id: 'cyan', label: 'Cyan', swatch: '#0891b2' },
  { id: 'teal', label: 'Teal', swatch: '#0d9488' },
  { id: 'fuchsia', label: 'Fuchsia', swatch: '#c026d3' },
  { id: 'pink', label: 'Pink', swatch: '#db2777' },
  { id: 'purple', label: 'Purple', swatch: '#9333ea' },
  { id: 'rose', label: 'Rose', swatch: '#e11d48' },
  { id: 'slate', label: 'Slate', swatch: '#334155' },
  { id: 'zinc', label: 'Zinc', swatch: '#52525b' },
];

export function applyAccentColor(id: AccentColorId) {
  if (id === 'violet') {
    document.documentElement.removeAttribute('data-accent');
  } else {
    document.documentElement.setAttribute('data-accent', id);
  }
  try {
    localStorage.setItem('accentColor', id);
  } catch {
    // localStorage unavailable (e.g. private browsing) — selection just won't persist
  }
}

export function useAccentColor() {
  const [accent, setAccentState] = React.useState<AccentColorId>('violet');

  React.useLayoutEffect(() => {
    const current = document.documentElement.getAttribute('data-accent') as AccentColorId | null;
    setAccentState(current ?? 'violet');
  }, []);

  const setAccent = React.useCallback((id: AccentColorId) => {
    applyAccentColor(id);
    setAccentState(id);
  }, []);

  return { accent, setAccent };
}

export function AccentColorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { accent, setAccent } = useAccentColor();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Theme Color"
      description="Pick the accent color used across buttons, links, and highlights."
      className="max-w-lg"
    >
      <div className="grid grid-cols-4 gap-2.5">
        {ACCENT_PRESETS.map((preset) => {
          const active = accent === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setAccent(preset.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-colors cursor-pointer',
                active ? 'border-accent/40 bg-accent/5' : 'border-line hover:border-line-strong'
              )}
            >
              <span
                className="relative w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
                style={{ backgroundColor: preset.swatch }}
              >
                {active && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
              </span>
              <span className="text-xs font-medium text-ink-muted">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}
