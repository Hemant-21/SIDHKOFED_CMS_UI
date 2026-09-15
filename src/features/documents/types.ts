/**
 * Documents module types — a faithful mirror of the backend Document DTOs (documents.dto.ts)
 * and request validators (documents.validators.ts). The frontend consumes these contracts
 * exactly; it never invents fields. `snake_case` matches the API transport (API spec §0).
 *
 * IMPORTANT: the running backend's create/update validator is `.strict()` and accepts only the
 * fields below — notably it does NOT accept `programme_ids`/`institution_ids` (those junctions
 * land with later module tiers — see documents.types.ts in the backend). We match the backend,
 * not the broader spec prose.
 */

import type { MasterRef, HighlightType, PublicationState, Language } from '@/types/common';

/** Compact financial-year reference (documents.dto.ts → `{ id, label }`). */
interface FinancialYearRef {
  id: string;
  label: string;
}

/** Public-safe view of the linked file asset (documents.dto.ts → DocumentFileRef). */
interface DocumentFileRef {
  id: string;
  file_url: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  title: string | null;
}

/** Document section derived from the document's type (sole classification authority). */
export type DocumentSection = 'publications' | 'notifications';

/** Admin list summary (DocumentSummaryDto). */
export interface DocumentSummary {
  id: string;
  slug: string;
  title_en: string;
  title_hi: string | null;
  document_type: MasterRef;
  /** Derived from document_type; kept for backwards compatibility. */
  knowledge_category: MasterRef | null;
  /** Derived from document_type (new). */
  communication_type: MasterRef | null;
  /** Derived from document_type (new): which section this document belongs to. */
  document_section: DocumentSection;
  financial_year: FinancialYearRef | null;
  language: string;
  publication_date: string | null;
  is_public: boolean;
  /** Derived boolean, kept for backwards compatibility. */
  show_in_knowledge_centre: boolean;
  file: DocumentFileRef;
  publication_state: PublicationState;
  public_visibility: boolean;
  show_on_homepage: boolean;
  highlight_type: HighlightType | null;
  display_order: number | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Admin detail (DocumentDetailDto). */
export interface DocumentDetail extends DocumentSummary {
  description_en: string | null;
  description_hi: string | null;
  commodities: MasterRef[];
  districts: MasterRef[];
  publish_start_at: string | null;
  highlight_start_at: string | null;
  highlight_end_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  public_url: string;
}

/**
 * Create/Update body — only the model-backed fields + relation arrays + workflow fields the
 * backend validator accepts (documents.validators.ts). Server-managed fields (slug, state,
 * *_by, published_at) are never produced.
 *
 * `document_type_id` is now the sole classification input — the backend derives
 * `knowledge_category`/`communication_type`/`document_section`/`show_in_knowledge_centre` from
 * it. The legacy `knowledge_category_id`/`show_in_knowledge_centre` write fields are deprecated
 * (accepted only when they agree with what the type derives) and are deliberately NOT part of
 * this write shape — the CMS never sends them.
 */
export interface DocumentWriteInput {
  title_en?: string;
  title_hi?: string | null;
  description_en?: string | null;
  description_hi?: string | null;
  document_type_id?: string;
  file_asset_id?: string;
  publication_date?: string | null;
  language?: Language;
  is_public?: boolean;
  financial_year_id?: string | null;
  commodity_ids?: string[];
  district_ids?: string[];
  // workflow
  public_visibility?: boolean;
  publish_start_at?: string | null;
  highlight_type?: HighlightType | null;
  highlight_start_at?: string | null;
  highlight_end_at?: string | null;
  display_order?: number | null;
  show_on_homepage?: boolean;
}
