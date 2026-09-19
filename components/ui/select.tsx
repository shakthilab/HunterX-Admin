'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOutsideClick } from '@/lib/hooks/use-outside-click';
import { usePopoverPlacement } from '@/lib/hooks/use-popover-placement';

export interface SelectChangeEvent {
  target: { value: string; name?: string };
}

export interface SelectProps {
  label?: string;
  value?: string | number;
  onChange?: (e: SelectChangeEvent) => void;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

interface OptionData {
  value: string;
  label: React.ReactNode;
  disabled: boolean;
}

// `children` is always a flat list of <option> — see call sites under app/**/_components.
function extractOptions(children: React.ReactNode): OptionData[] {
  const options: OptionData[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement>>(child)) return;
    options.push({
      value: String(child.props.value ?? ''),
      label: child.props.children,
      disabled: !!child.props.disabled,
    });
  });
  return options;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ className, label, children, value, onChange, disabled, name, id }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [highlighted, setHighlighted] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);

    const options = React.useMemo(() => extractOptions(children), [children]);
    const selectedIndex = options.findIndex((o) => o.value === String(value ?? ''));
    const placement = usePopoverPlacement(open, containerRef, panelRef);

    const close = React.useCallback(() => setOpen(false), []);
    useOutsideClick(containerRef, close, open);

    React.useEffect(() => {
      if (open) setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    }, [open, selectedIndex]);

    const commit = (index: number) => {
      const opt = options[index];
      if (!opt || opt.disabled) return;
      onChange?.({ target: { value: opt.value, name } });
      setOpen(false);
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (!open) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted((h) => Math.min(options.length - 1, h + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted((h) => Math.max(0, h - 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        commit(highlighted);
      } else if (e.key === 'Tab') {
        setOpen(false);
      }
    };

    const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

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
            name={name}
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            onKeyDown={handleTriggerKeyDown}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-line bg-surface-inset/50 text-ink text-left text-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent focus:bg-surface-inset disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
              open && 'border-accent ring-1 ring-accent bg-surface-inset',
              className
            )}
          >
            <span className="truncate">{selected ? selected.label : ' '}</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-ink-faint shrink-0 transition-transform duration-200',
                open && 'rotate-180 text-accent-ink'
              )}
            />
          </button>

          {open && (
            <div
              ref={panelRef}
              role="listbox"
              data-placement={placement}
              className={cn(
                'popover-pop absolute z-40 left-0 min-w-full w-max max-w-[min(20rem,90vw)] max-h-64 overflow-y-auto rounded-xl border border-line bg-surface shadow-2xl py-1',
                placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
              )}
            >
              {options.length === 0 && (
                <div className="px-3.5 py-2.5 text-sm text-ink-faint">No options</div>
              )}
              {options.map((opt, i) => {
                const isSelected = i === selectedIndex;
                const isHighlighted = i === highlighted;
                return (
                  <div
                    key={`${opt.value}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onMouseEnter={() => setHighlighted(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => commit(i)}
                    className={cn(
                      'flex items-center justify-between gap-2 mx-1 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors',
                      isHighlighted && !opt.disabled ? 'bg-accent/10 text-ink' : 'text-ink-muted',
                      isSelected && 'text-accent-ink font-medium',
                      opt.disabled && 'opacity-40 pointer-events-none cursor-not-allowed'
                    )}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
