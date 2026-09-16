/**
 * Mirrors the backend's `operational_reports.*` keys — this feature replaces the six-report
 * catalogue's CMS screen, so it reuses the same view/export grants rather than minting new ones.
 * `<Can>` here is an affordance; the backend remains the security boundary.
 */
export const REPORTS_PERMS = {
  view: 'operational_reports.view',
  export: 'operational_reports.export',
} as const;

/** FY snapshot publication (Task 5) — a separate permission set from report generation/export. */
export const REPORT_PUBLICATIONS_PERMS = {
  view: 'report_publications.view',
  publish: 'report_publications.publish',
} as const;
