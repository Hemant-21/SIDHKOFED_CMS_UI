'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const GAP = 8;

interface Position {
  top: number;
  left: number;
  transform: string;
}

function computePosition(rect: DOMRect, side: NonNullable<TooltipProps['side']>): Position {
  switch (side) {
    case 'bottom':
      return { top: rect.bottom + GAP, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - GAP, transform: 'translate(-100%, -50%)' };
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + GAP, transform: 'translateY(-50%)' };
    case 'top':
    default:
      return { top: rect.top - GAP, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' };
  }
}

/**
 * Lightweight tooltip shown on hover AND keyboard focus (accessibility). Wires
 * `aria-describedby` so assistive tech announces the description.
 *
 * Renders the bubble into a `document.body` portal at a `position: fixed`
 * coordinate computed from the trigger's bounding rect, rather than as a
 * CSS-relative sibling — a plain absolutely-positioned sibling gets clipped
 * whenever an ancestor sets any non-`visible` overflow (e.g. the sidebar's
 * scrollable nav list), which silently hides the tooltip instead of showing it.
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const id = useId();
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPosition(computePosition(rect, side));
  };
  const hide = () => setPosition(null);

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={position ? id : undefined}>{children}</span>
      {position
        ? createPortal(
            <span
              role="tooltip"
              id={id}
              style={{ position: 'fixed', top: position.top, left: position.left, transform: position.transform }}
              className={cn(
                'z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md animate-fade-in',
                className,
              )}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
