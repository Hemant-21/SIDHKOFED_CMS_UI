'use client';

/** Small shared pieces used by all three report table views. */
import { ChevronDown, ChevronRight } from 'lucide-react';

export function formatCount(value: number | null): string {
  if (value === null) return 'Unavailable';
  return value.toLocaleString('en-IN');
}

/** Recorded participants: null (unknown) is rendered distinctly from a real 0. */
export function ParticipantsCell({ value, missingAttendance }: { value: number | null; missingAttendance: number }) {
  if (value === null) {
    return (
      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold italic text-warning">Unavailable</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-medium text-foreground">{formatCount(value)}</span>
      {missingAttendance > 0 ? (
        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning">
          {missingAttendance} missing
        </span>
      ) : null}
    </span>
  );
}

export function ExpandToggle({ expanded, onToggle, label }: { expanded: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="flex items-center gap-1.5 text-left font-medium text-foreground hover:text-primary"
    >
      {expanded ? (
        <ChevronDown className="h-4 w-4 shrink-0 text-primary" />
      ) : (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className="break-words">{label}</span>
    </button>
  );
}
