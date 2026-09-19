import * as React from 'react';

/**
 * Flips a popover above its trigger when there isn't enough room below —
 * e.g. a "Per page" select docked at the bottom of a scrolled table.
 */
export function usePopoverPlacement<A extends HTMLElement, P extends HTMLElement>(
  open: boolean,
  anchorRef: React.RefObject<A | null>,
  panelRef: React.RefObject<P | null>
): 'top' | 'bottom' {
  const [placement, setPlacement] = React.useState<'top' | 'bottom'>('bottom');

  React.useLayoutEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const panelHeight = panelRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    setPlacement(spaceBelow < panelHeight + 12 && spaceAbove > spaceBelow ? 'top' : 'bottom');
  }, [open, anchorRef, panelRef]);

  return open ? placement : 'bottom';
}
