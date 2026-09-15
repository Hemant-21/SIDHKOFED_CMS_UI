/**
 * Permission keys for the Operational Reports module (mirrors the backend's
 * `operational-reports.permissions.ts` — hand-picked keys, same precedent as `dashboard.*`,
 * because this is a read+export-only, code-fixed report catalogue with no create/update/publish
 * lifecycle of its own). These keys only MIRROR the seeded backend keys; the backend remains the
 * security boundary — `<Can>` here is an affordance, not enforcement.
 */

export const OPERATIONAL_REPORTS_PERMS = {
  view: 'operational_reports.view',
  export: 'operational_reports.export',
} as const;

/**
 * The one Website Metrics permission this sub-feature touches: creating a DRAFT config from the
 * "Use on website" action (`POST /admin/dashboard/website-metrics`, gated server-side by
 * `website_metrics.manage_data`). The rest of the Website Metrics permission surface
 * (publish/unpublish/archive/restore) belongs to Stage 5's editor, not here.
 */
export const WEBSITE_METRICS_PERMS = {
  manageData: 'website_metrics.manage_data',
} as const;
