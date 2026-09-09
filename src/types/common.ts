/**
 * Shared domain primitives consumed by every future module. These mirror the
 * compact reference shapes in the API spec §1.4 and build-context §10.2. They are
 * intentionally generic — no module-specific fields live here.
 */

export type Language = 'en' | 'hi';

/** Publication lifecycle states (codex §8 / schema). Stored lower-case. */
export type PublicationState = 'draft' | 'published' | 'unpublished' | 'archived';

/** Common highlight set (codex §9 / reconciliation C6). */
export type HighlightType = 'new' | 'latest' | 'important' | 'urgent' | 'featured';

/** Compact master reference (API spec §1.4). */
export interface MasterRef {
  id: string;
  slug: string;
  name_en: string;
  name_hi?: string | null;
}

/** Compact media reference (API spec §1.4). */
export interface MediaRef {
  id: string;
  url: string;
  file_name?: string;
  mime_type?: string;
  variants?: Partial<Record<'thumb' | 'card' | 'hero', {
    url: string;
    mime_type: string;
    file_size: number;
    width: number;
    height: number;
  }>> | null;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Compact document reference (API spec §1.4). */
export interface DocumentRef {
  id: string;
  slug: string;
  title_en: string;
  title_hi?: string | null;
  document_type: string;
  file_url: string;
  language: Language;
  publication_date?: string | null;
}

