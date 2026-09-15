/**
 * Website Metrics module types (Stage 5 of the Operational Reports / Website Metrics plan).
 *
 * Verified LIVE-EQUIVALENT against the backend source (Sidhkofed-Website repo — the backend was
 * not re-run for this stage; instead `website-metrics.controller.ts` / `.service.ts` /
 * `.validators.ts` / `.types.ts` were read directly, which Stage 4's own `operational-reports/api.ts`
 * header already flagged as authoritative for this exact asymmetry). The wire shape has a
 * deliberate REQUEST/RESPONSE casing split within the SAME resource:
 *
 *   - `POST /admin/dashboard/website-metrics` and `PATCH /admin/dashboard/website-metrics/:id`
 *     REQUEST bodies are **camelCase** (`website-metrics.validators.ts` zod schemas:
 *     `reportKey`, `measureKey`, `filterConfig`, `periodConfig`, `labelEn`, `labelHi`,
 *     `placementKey`, `displayOrder`).
 *   - Every RESPONSE (create/detail/list/patch/unpublish/archive/restore/flag/unflag) is
 *     **snake_case** (`website-metrics.service.ts`'s `toDto()`: `report_key`, `measure_key`,
 *     `filter_config`, `period_config`, `label_en`, `label_hi`, `placement_key`, `display_order`,
 *     `is_enabled`, `is_archived`, `config_revision`, `current_snapshot` — a NESTED snapshot object,
 *     not a bare `current_snapshot_id` as the stage brief guessed).
 *   - `POST /:id/preview`'s response (`PreviewResult` in `website-metrics.service.ts`) is its own
 *     THIRD shape: **camelCase**, matching neither the request nor the detail response
 *     (`previewToken`, `resolvedFilters`, `resolvedPeriod`, `labelEn`, `labelHi`, `calculatedAt`,
 *     `configRevision`) — confirmed by reading the `preview()` function's return statement, not
 *     assumed from the detail casing.
 *   - `POST /:id/publish` REQUEST body is camelCase (`{ previewToken }`, `controller.ts`'s
 *     `publish` handler); its RESPONSE is the same snake_case detail DTO as everything else.
 *   - `GET /:id/history` returns an array of snake_case snapshot DTOs (`toSnapshotDto()`):
 *     `resolved_filters`, `resolved_period`, `label_en`, `definition_note_en`, `flagged_for_review`,
 *     `published_at`, `published_by`, etc.
 */

import type { PeriodMode } from '../operational-reports/types';

export type { PeriodMode };

/** Mirrors the backend's `ALLOWED_PLACEMENTS` registry (`website-metrics.types.ts`) exactly —
 * there is no endpoint that exposes this list, so it is hardcoded here the same way Stage 4's
 * `operational-reports/types.ts` already hardcoded it for the "Use on website" flow. */
export const WEBSITE_METRIC_PLACEMENTS = ['homepage', 'about_us'] as const;
export type WebsiteMetricPlacementKey = (typeof WEBSITE_METRIC_PLACEMENTS)[number];

/** Request-side period selector — identical shape to Operational Reports' `PeriodInput`. */
export interface WebsiteMetricPeriodConfig {
  mode: PeriodMode;
  startDate?: string;
  endDate?: string;
  financialYearLabel?: string;
}

// ── Requests (camelCase) ────────────────────────────────────────────────────────

/** `POST /admin/dashboard/website-metrics` request body. */
export interface WebsiteMetricCreatePayload {
  reportKey: string;
  measureKey: string;
  filterConfig: Record<string, string[]>;
  periodConfig: WebsiteMetricPeriodConfig;
  labelEn: string;
  labelHi?: string | null;
  placementKey: WebsiteMetricPlacementKey;
  displayOrder?: number;
}

/** `PATCH /admin/dashboard/website-metrics/:id` request body — every field optional. */
export type WebsiteMetricUpdatePayload = Partial<WebsiteMetricCreatePayload>;

// ── Responses (snake_case) ───────────────────────────────────────────────────────

export interface WebsiteMetricSnapshot {
  id: string;
  metric_id: string;
  config_revision: number;
  resolved_filters: Record<string, string[]>;
  resolved_period: unknown;
  value: number | null;
  unit: string | null;
  label_en: string;
  label_hi: string | null;
  definition_note_en: string;
  definition_note_hi: string | null;
  completeness: unknown;
  public_scope_policy_version: number;
  calculated_at: string;
  published_at: string | null;
  published_by: string | null;
  flagged_for_review: boolean;
  created_at: string;
}

/** The `toDto()` shape — returned by list/detail/create/patch/publish/unpublish/archive/restore. */
export interface WebsiteMetricDetail {
  id: string;
  metric_key: string;
  report_key: string;
  measure_key: string;
  calculation_version: number;
  filter_config: Record<string, string[]>;
  period_config: WebsiteMetricPeriodConfig;
  label_en: string;
  label_hi: string | null;
  placement_key: WebsiteMetricPlacementKey;
  display_order: number;
  is_enabled: boolean;
  is_archived: boolean;
  config_revision: number;
  current_snapshot: WebsiteMetricSnapshot | null;
  created_at: string;
  updated_at: string;
}

/** List rows use the exact same `toDto()` mapper as detail — no separate summary shape. */
export type WebsiteMetricSummary = WebsiteMetricDetail;

export interface WebsiteMetricListFilters {
  placement?: string;
  enabled?: boolean;
  archived?: boolean;
}

export const WEBSITE_METRIC_ORDERING_FIELDS = ['display_order', 'created_at'] as const;
export type WebsiteMetricOrderingField = (typeof WEBSITE_METRIC_ORDERING_FIELDS)[number];

/** `POST /:id/preview` response — its own camelCase shape (see file header). */
export interface WebsiteMetricPreviewResult {
  previewToken: string;
  value: number | null;
  unit: string | null;
  resolvedFilters: Record<string, string[]>;
  resolvedPeriod: unknown;
  labelEn: string;
  labelHi: string | null;
  completeness: unknown;
  calculatedAt: string;
  configRevision: number;
}

// ── Round-trip mapper ────────────────────────────────────────────────────────────

/** The subset of a config the editor round-trips into a PATCH body. */
export interface WebsiteMetricConfigFormValue {
  reportKey: string;
  measureKey: string;
  filterConfig: Record<string, string[]>;
  periodConfig: WebsiteMetricPeriodConfig;
  labelEn: string;
  labelHi: string | null;
  placementKey: WebsiteMetricPlacementKey;
  displayOrder: number;
}

/**
 * Maps a fetched (snake_case) detail back into the camelCase shape the editor form and the
 * update mutation need — the one place this asymmetry is bridged, so no component reads
 * snake_case fields to build a request body by hand.
 */
export function detailToFormValue(detail: WebsiteMetricDetail): WebsiteMetricConfigFormValue {
  return {
    reportKey: detail.report_key,
    measureKey: detail.measure_key,
    filterConfig: detail.filter_config,
    periodConfig: detail.period_config,
    labelEn: detail.label_en,
    labelHi: detail.label_hi,
    placementKey: detail.placement_key,
    displayOrder: detail.display_order,
  };
}

/** Builds the exact `PATCH` body from the current form value (all fields sent — simplest safe
 * update given the backend re-validates the MERGED effective config either way). */
export function formValueToUpdatePayload(value: WebsiteMetricConfigFormValue): WebsiteMetricUpdatePayload {
  return {
    reportKey: value.reportKey,
    measureKey: value.measureKey,
    filterConfig: value.filterConfig,
    periodConfig: value.periodConfig,
    labelEn: value.labelEn,
    labelHi: value.labelHi,
    placementKey: value.placementKey,
    displayOrder: value.displayOrder,
  };
}

/** Deterministic JSON stringify (sorted keys) — used to compare the previewed config against the
 * current form state so the UI can warn "config changed since preview". Mirrors the backend's own
 * `stableStringify` in `website-metrics.shared.ts` (recursive key sort), reimplemented here since
 * the CMS cannot import backend code. */
export function stableConfigStringify(value: {
  reportKey: string;
  measureKey: string;
  filterConfig: Record<string, string[]>;
  periodConfig: WebsiteMetricPeriodConfig;
}): string {
  const sortDeep = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(sortDeep);
    if (v !== null && typeof v === 'object') {
      return Object.keys(v as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = sortDeep((v as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return v;
  };
  return JSON.stringify(
    sortDeep({
      reportKey: value.reportKey,
      measureKey: value.measureKey,
      filterConfig: value.filterConfig,
      periodConfig: value.periodConfig,
    }),
  );
}
