'use client';

/**
 * Accessible dropdown menu. The trigger element itself becomes the toggle — its menu ARIA
 * (aria-haspopup/expanded/controls) and click handler are merged onto it via {@link Slot},
 * so there is NO wrapper <button> around the trigger (avoids nested interactive elements).
 * Keyboard support (Escape closes), outside-click dismiss, and role=menu/menuitem are kept.
 * Composed by the Topbar user menu, row action menus in DataTable, etc.
 *
 * The `trigger` must therefore be a single FOCUSABLE element (e.g. a <Button> or <button>) so
 * keyboard users can open the menu.
 *
 * Renders the menu into a `document.body` portal at a `position: fixed` coordinate computed
 * from the trigger's bounding rect, rather than as a CSS-relative sibling — a plain
 * absolutely-positioned sibling gets clipped whenever an ancestor sets any non-`visible`
 * overflow (e.g. DataTable's scrollable/rounded-corner wrapper), which silently clips or
 * squashes the menu instead of showing it — same root cause `Tooltip` already works around.
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Slot } from './slot';

interface DropdownItem {
  /** Optional — omitted for `separator` items. */
  label?: ReactNode;
  onSelect?: () => void;
  icon?: ReactNode;
  /** Render as a destructive action. */
  danger?: boolean;
  disabled?: boolean;
  /** Render a separator instead of an item (label ignored). */
  separator?: boolean;
}

export interface DropdownProps {
  /** A single focusable element (e.g. a <Button>); the toggle ARIA + onClick are merged onto it. */
  trigger: ReactElement;
  items: DropdownItem[];
  align?: 'start' | 'end';
  className?: string;
}

const GAP = 4;
const MIN_WIDTH = 192; // 12rem, matches the old min-w-[12rem]

interface Position {
  top: number;
  left: number;
  minWidth: number;
  alignEnd: boolean;
}

export function Dropdown({ trigger, items, align = 'end', className }: DropdownProps) {
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const open = position !== null;

  const close = () => setPosition(null);

  const toggle = () => {
    if (open) {
      close();
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({
      top: rect.bottom + GAP,
      left: align === 'end' ? rect.right : rect.left,
      minWidth: Math.max(rect.width, MIN_WIDTH),
      alignEnd: align === 'end',
    });
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <Slot
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={toggle}
      >
        {trigger}
      </Slot>
      {position
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              id={menuId}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                minWidth: position.minWidth,
                transform: position.alignEnd ? 'translateX(-100%)' : undefined,
              }}
              className={cn(
                'z-50 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-lg animate-content-show',
                className,
              )}
            >
              {items.map((item, i) =>
                item.separator ? (
                  <div key={i} role="separator" className="my-1 h-px bg-border" />
                ) : (
                  <button
                    key={i}
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      item.onSelect?.();
                      close();
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-left text-sm transition-colors',
                      'focus:outline-none focus-visible:bg-muted hover:bg-muted',
                      'disabled:pointer-events-none disabled:opacity-50',
                      item.danger ? 'text-danger' : 'text-surface-foreground',
                    )}
                  >
                    {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                    <span className="flex-1">{item.label}</span>
                  </button>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
