/**
 * FAQs module types — mirror of the backend DTOs and validators (faqs.dto.ts / faqs.validators.ts).
 * FAQs may be assigned to zero or more registered main pages (faqs.pages.registry.ts on the
 * backend), each with its own independent order; the FAQ's own `display_order` is only the central
 * /faqs directory order. Publishable **P** content carrying the publishing-workflow mixin,
 * authorized with the shared `content.*` RBAC keys.
 *
 * `page_assignments` is optional on write (omit to leave existing assignments untouched on PATCH;
 * send `[]` to clear them all). `question_en`/`answer_en` are required. Server-managed fields
 * (slug, state, *_by, published_at) are never produced by the client.
 */

import type { HighlightType, PublicationState } from '@/types/common';

export interface FaqPageAssignment {
  page_key: string;
  display_order: number;
}

/** Admin list summary. */
export interface FaqSummary {
  id: string;
  slug: string;
  question_en: string;
  question_hi: string | null;
  page_assignments: FaqPageAssignment[];
  publication_state: PublicationState;
  public_visibility: boolean;
  highlight_type: HighlightType | null;
  display_order: number | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Admin detail — all fields including the answer. */
export interface FaqDetail extends FaqSummary {
  answer_en: string;
  answer_hi: string | null;
  publish_start_at: string | null;
  highlight_start_at: string | null;
  highlight_end_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Write payload — model-backed fields + workflow fields the backend validator accepts
 * (faqs.validators.ts `baseShape`). Nothing else.
 */
export interface FaqWriteInput {
  page_assignments?: FaqPageAssignment[];
  question_en?: string;
  question_hi?: string | null;
  answer_en?: string;
  answer_hi?: string | null;
  // workflow
  public_visibility?: boolean;
  publish_start_at?: string | null;
  highlight_type?: HighlightType | null;
  highlight_start_at?: string | null;
  highlight_end_at?: string | null;
  display_order?: number | null;
}

/** A registered FAQ main page (GET /admin/faqs/pages). */
export interface FaqPageOption {
  page_key: string;
  path: string;
  label_en: string;
  label_hi: string;
}

/** POST /admin/faqs/pages/:pageKey/reorder */
export interface FaqPageReorderInput {
  order: Array<{ id: string; display_order: number }>;
}
