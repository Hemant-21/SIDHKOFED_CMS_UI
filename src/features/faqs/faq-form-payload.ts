/**
 * Pure form ↔ API mapping for the FAQ form (unit-testable; no React). Converts the flat,
 * string-friendly form state into the typed `FaqWriteInput` the backend accepts: empties become
 * null, highlights only sent when active, ISO timestamps from calendar dates. Server-managed fields
 * (slug, state, *_by, published_at) are never produced.
 *
 * `page_assignments` replaces `faq_category_id`/`show_on_homepage` — the form always knows its
 * full current set of page assignments (managed by `FaqPageAssignmentManager`), so it always sends
 * the complete array on save; the backend's "omit to leave untouched" PATCH semantics matter for
 * non-form API callers, not this always-full-state form.
 */

import type { HighlightType } from '@/types/common';
import type { FaqDetail, FaqPageAssignment, FaqWriteInput } from './types';

export interface FaqFormValues {
  pageAssignments: FaqPageAssignment[];
  question_en: string;
  question_hi: string;
  answer_en: string;
  answer_hi: string;
  // workflow
  public_visibility: boolean;
  highlight_type: string;
  highlight_start_at: string;
  highlight_end_at: string;
  display_order: string;
  publish_start_at: string;
}

const blank = (v: string): string | null => (v.trim() === '' ? null : v.trim());
const dateToIso = (v: string): string | null => (v ? `${v}T00:00:00.000Z` : null);

export function emptyFaqForm(): FaqFormValues {
  return {
    pageAssignments: [],
    question_en: '',
    question_hi: '',
    answer_en: '',
    answer_hi: '',
    public_visibility: false,
    highlight_type: '',
    highlight_start_at: '',
    highlight_end_at: '',
    display_order: '',
    publish_start_at: '',
  };
}

export function faqToForm(f: FaqDetail): FaqFormValues {
  return {
    pageAssignments: f.page_assignments.map((a) => ({ ...a })),
    question_en: f.question_en,
    question_hi: f.question_hi ?? '',
    answer_en: f.answer_en,
    answer_hi: f.answer_hi ?? '',
    public_visibility: f.public_visibility,
    highlight_type: f.highlight_type ?? '',
    highlight_start_at: f.highlight_start_at ? f.highlight_start_at.slice(0, 10) : '',
    highlight_end_at: f.highlight_end_at ? f.highlight_end_at.slice(0, 10) : '',
    display_order: f.display_order != null ? String(f.display_order) : '',
    publish_start_at: f.publish_start_at ? f.publish_start_at.slice(0, 10) : '',
  };
}

export function buildFaqPayload(v: FaqFormValues): FaqWriteInput {
  const highlight = blank(v.highlight_type) as HighlightType | null;
  return {
    page_assignments: v.pageAssignments,
    question_en: v.question_en.trim(),
    question_hi: blank(v.question_hi),
    answer_en: v.answer_en.trim(),
    answer_hi: blank(v.answer_hi),
    public_visibility: v.public_visibility,
    highlight_type: highlight,
    highlight_start_at: highlight ? dateToIso(v.highlight_start_at) : null,
    highlight_end_at: highlight ? dateToIso(v.highlight_end_at) : null,
    display_order: v.display_order.trim() === '' ? null : Number(v.display_order),
    publish_start_at: dateToIso(v.publish_start_at),
  };
}
