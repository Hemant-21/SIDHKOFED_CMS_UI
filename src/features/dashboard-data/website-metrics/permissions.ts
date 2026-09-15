/**
 * Permission keys for the Website Metrics module (mirrors the backend's
 * `website-metrics.permissions.ts` — hand-picked keys, since configure → preview → publish does
 * not fit the generic content lifecycle). These keys only MIRROR the seeded backend keys; the
 * backend remains the security boundary — `<Can>` here is an affordance, not enforcement.
 *
 * Seeded backend precedent (`website-metrics.routes.ts`): `.view`/`.manageData` → content_editor +
 * publisher (super_admin implicit); `.publish`/`.unpublish`/`.archive`/`.restore` → publisher only.
 * flag/unflag-review is gated by `.manageData` (a data-quality note, not a publish action).
 */
export const WEBSITE_METRICS_PERMS = {
  view: 'website_metrics.view',
  manageData: 'website_metrics.manage_data',
  publish: 'website_metrics.publish',
  unpublish: 'website_metrics.unpublish',
  archive: 'website_metrics.archive',
  restore: 'website_metrics.restore',
} as const;
