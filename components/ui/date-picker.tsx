'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { usePopoverPlacement } from '@/lib/hooks/use-popover-placement';

export interface DatePickerChangeEvent {
  target: { value: string; name?: string };
}

export interface DatePickerProps {
  label?: string;
  value?: string | null;
  onChange?: (e: DatePickerChangeEvent) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

interface YMD {
  y: number;
  m: number; // 1-12
  d: number;
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseISO(value?: string | null): YMD | null {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null;
  return match ? { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) } : null;
}

function toISO({ y, m, d }: YMD): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatDisplay({ y, m, d }: YMD): string {
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function today(): YMD {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

function sameDay(a: YMD | null, b: YMD): boolean {
  return !!a && a.y === b.y && a.m === b.m && a.d === b.d;
}

// 6-week grid including the leading/trailing days of adjacent months.
function buildGrid(y: number, m: number): (YMD & { inMonth: boolean })[] {
  const firstWeekday = new Date(y, m - 1, 1).getDay();
  const totalDays = new Date(y, m, 0).getDate();
  const cells: (YMD & { inMonth: boolean })[] = [];

  const prevMonth = m === 1 ? 12 : m - 1;
  const prevYear = m === 1 ? y - 1 : y;
  const prevTotal = new Date(prevYear, prevMonth, 0).getDate();
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ y: prevYear, m: prevMonth, d: prevTotal - firstWeekday + 1 + i, inMonth: false });
  }

  for (let d = 1; d <= totalDays; d++) cells.push({ y, m, d, inMonth: true });

  const nextMonth = m === 12 ? 1 : m + 1;
  const nextYear = m === 12 ? y + 1 : y;
  let nextDay = 1;
  while (cells.length % 7 !== 0) cells.push({ y: nextYear, m: nextMonth, d: nextDay++, inMonth: false });

  return cells;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ label, value, onChange, disabled, className, name, id }, ref) => {
    const selected = parseISO(value);
    const t = today();
    const [open, setOpen] = React.useState(false);
    const [view, setView] = React.useState<YMD>(() => selected ?? t);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const placement = usePopoverPlacement(open, containerRef, panelRef);

    const close = React.useCallback(() => setOpen(false), []);
    useOutsideClick(containerRef, close, open);

    React.useEffect(() => {
      if (open) setView(selected ?? t);
      // Re-sync the visible month only when the popover opens.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const pick = (cell: YMD) => {
      onChange?.({ target: { value: toISO(cell), name } });
      setOpen(false);
    };

    const clear = () => {
      onChange?.({ target: { value: '', name } });
      setOpen(false);
    };

    const grid = React.useMemo(() => buildGrid(view.y, view.m), [view.y, view.m]);
    const monthLabel = new Date(view.y, view.m - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="w-full space-y-1.5" ref={containerRef}>
        {label && (
          <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{label}</label>
        )}
        <div className="relative">
          <button
            ref={ref}
            type="button"
            id={id}
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/50 text-left text-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface-inset disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
              open && 'border-accent ring-1 ring-accent bg-surface-inset',
              className
            )}
          >
            <span className={selected ? 'text-ink' : 'text-ink-faint'}>
              {selected ? formatDisplay(selected) : 'mm/dd/yyyy'}
            </span>
            <CalendarIcon className={cn('w-4 h-4 text-ink-faint shrink-0', open && 'text-accent-ink')} />
          </button>

          {open && (
            <div
              ref={panelRef}
              data-placement={placement}
              className={cn(
                'popover-pop absolute z-40 w-72 rounded-xl border border-line bg-surface shadow-2xl p-3',
                placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setView((v) => (v.m === 1 ? { y: v.y - 1, m: 12, d: v.d } : { ...v, m: v.m - 1 }))}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-inset cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold text-ink">{monthLabel}</span>
                <button
                  type="button"
                  onClick={() => setView((v) => (v.m === 12 ? { y: v.y + 1, m: 1, d: v.d } : { ...v, m: v.m + 1 }))}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-surface-inset cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-center">
                {WEEKDAY_LABELS.map((w) => (
                  <span key={w} className="text-[11px] font-semibold text-ink-faint py-1">
                    {w}
                  </span>
                ))}
                {grid.map((cell, i) => {
                  const isSelected = sameDay(selected, cell);
                  const isToday = sameDay(t, cell);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => pick(cell)}
                      className={cn(
                        'mx-auto w-8 h-8 rounded-lg text-sm transition-colors cursor-pointer',
                        cell.inMonth ? 'text-ink' : 'text-ink-faint/50',
                        isSelected
                          ? 'bg-accent text-white font-semibold hover:bg-accent-hover'
                          : 'hover:bg-surface-inset',
                        isToday && !isSelected && 'ring-1 ring-inset ring-accent/60 font-semibold text-accent-ink'
                      )}
                    >
                      {cell.d}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={clear}
                  className="text-xs font-medium text-ink-muted hover:text-ink cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  className="text-xs font-medium text-accent-ink hover:underline cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
DatePicker.displayName = 'DatePicker';
