/**
 * Operational Reports module types — a faithful mirror of the backend's
 * `operational-reports.types.ts` / `.validators.ts` (Sidhkofed-Website repo, Stage 1 of the
 * Operational Reports / Website Metrics plan). Verified against a live local backend (see
 * `api.ts` header) rather than assumed from the plan doc: the wire shape is **camelCase**
 * end-to-end for this module (unlike the legacy `dashboard-data` DTOs, which are snake_case —
 * the two modules simply predate/postdate different API conventions).
 *
 * This module computes reports LIVE from operational records; there is no stored, editable
 * number here, so these types have no create/update input — only read (generate) and export.
 */

/** The fixed set of report keys (code-defined; adding one is a backend change). */
export type OperationalReportKey =
  | 'event_activity_outcomes'
  | 'training_attendance'
  | 'programme_activity_coverage'
  | 'district_activity_coverage'
  | 'toolkit_item_distribution'
  | 'procurement_register';

export type PeriodMode = 'fixed_range' | 'financial_year' | 'current_financial_year';

export type CompletenessRequirement = 'none' | 'date_basis' | 'attendance' | 'quantity_and_unit';

/** Request-side period selector. `startDate`/`endDate` are `YYYY-MM-DD`. */
export interface PeriodInput {
  mode: PeriodMode;
  startDate?: string;
  endDate?: string;
  financialYearLabel?: string;
}

/** The period the backend actually resolved + used to filter records. */
export interface ResolvedPeriod {
  mode: PeriodMode;
  start: string;
  end: string;
  basisDescription: string;
  financialYearLabel?: string;
}

export interface OperationalReportMeasure {
  key: string;
  calculationVersion: number;
  labelEn: string;
  labelHi?: string;
  unit: string | null;
  noteEn: string;
  noteHi?: string;
  supportedFilters: string[];
  supportedPeriodModes: PeriodMode[];
  /** Whether this measure may ever be surfaced publicly via a Website Metric (Stage 2/5). */
  publicEligible: boolean;
  completenessRequirement: CompletenessRequirement;
}

export interface OperationalReportDefinition {
  key: OperationalReportKey;
  titleEn: string;
  titleHi?: string;
  /** Human description of which date field anchors period filtering for this report. */
  dateBasisField: string;
  supportedFilters: string[];
  measures: OperationalReportMeasure[];
}

export interface CompletenessInfo {
  /** Records in the resolved period with the relevant field populated. */
  known: number;
  /** Records in the resolved period missing the relevant field. */
  missing: number;
  /** Records excluded from the period filter entirely — no date-basis value. */
  undated: number;
}

export interface MeasureResult {
  key: string;
  calculationVersion: number;
  labelEn: string;
  labelHi?: string;
  unit: string | null;
  /** Null is preserved (no eligible records) — the UI must not coalesce this to 0. */
  value: number | null;
  completeness: CompletenessInfo | null;
  noteEn: string;
  noteHi?: string;
}

/** One supporting record row. The report's columns vary by report key — kept loose. */
export type OperationalReportRow = Record<string, unknown>;

export interface PaginatedRows<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OperationalReportResult {
  reportKey: OperationalReportKey;
  resolvedPeriod: ResolvedPeriod;
  filters: Record<string, string[]>;
  summary: MeasureResult[];
  rows: PaginatedRows<OperationalReportRow>;
  calculatedAt: string;
}

/** `POST .../:key/generate` body. */
export interface GenerateReportBody {
  periodInput: PeriodInput;
  filters?: Record<string, string[]>;
  page?: number;
  pageSize?: number;
}

/** `POST .../:key/export` body — same as generate, minus pagination. */
export interface ExportReportBody {
  periodInput: PeriodInput;
  filters?: Record<string, string[]>;
}

// ── Website Metrics (Stage 2 backend / Stage 5 CMS editor) ─────────────────────────
// Only what "Use on website" needs to create a DRAFT config. The full editor is Stage 5's job.

export const WEBSITE_METRIC_PLACEMENTS = ['homepage', 'about_us'] as const;
export type WebsiteMetricPlacementKey = (typeof WEBSITE_METRIC_PLACEMENTS)[number];

/** `POST /admin/dashboard/website-metrics` request body — camelCase (verified live). */
export interface WebsiteMetricCreateInput {
  reportKey: string;
  measureKey: string;
  filterConfig: Record<string, string[]>;
  periodConfig: PeriodInput;
  labelEn: string;
  labelHi?: string | null;
  placementKey: WebsiteMetricPlacementKey;
  displayOrder?: number;
}

/**
 * The created record, as returned by the API — snake_case (verified live). This module never
 * reads more than `id` from it (to build the Stage 5 edit-page navigation target), but the full
 * shape is recorded here for whoever builds Stage 5's editor next.
 */
export interface WebsiteMetricRecord {
  id: string;
  metric_key: string;
  report_key: string;
  measure_key: string;
  calculation_version: number;
  filter_config: Record<string, string[]>;
  period_config: PeriodInput;
  label_en: string;
  label_hi: string | null;
  placement_key: WebsiteMetricPlacementKey;
  display_order: number;
  is_enabled: boolean;
  is_archived: boolean;
  config_revision: number;
  current_snapshot: unknown;
  created_at: string;
  updated_at: string;
}
