import * as React from 'react';

/** Closes a popover/menu on an outside pointer press or Escape, while `active`. */
export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onOutside: () => void,
  active: boolean
) {
  React.useEffect(() => {
    if (!active) return;

    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOutside();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, ref, onOutside]);
}
