/**
 * Dashboard Data feature. Built on the shared 15.0/15.1 infrastructure and backend contracts. The
 * dashboard is backend-driven — no builder, no client-side aggregation, no computed KPI (codex §13).
 *
 * The legacy manual Metrics/Datasets/Excel-Import surfaces (dummy/test data, never real historical
 * figures) were removed entirely in an earlier cleanup. The fixed "Dashboard Reports"
 * report-definition feature (list/detail/form/lifecycle, `/dashboard/reports*`) that survived that
 * cleanup has now been removed too — the backend retired the `DashboardReport`/`DashboardMetric`/
 * `DashboardDataset` admin routes, services, and every `/public/dashboard*` public route, and
 * deleted the underlying rows. Only Operational Reports and Website Metrics remain below.
 */

// Operational Reports (Stage 4) — the live-calculated "Generate Reports" sub-feature, added
// alongside the fixed-catalogue generation above (not replacing it — see routing note in
// `operational-reports/generate-reports-page.tsx` and the app route at
// `/dashboard/reports/generate`).
export { GenerateReportsPage } from './operational-reports/generate-reports-page';
export { OPERATIONAL_REPORTS_PERMS, WEBSITE_METRICS_PERMS as USE_ON_WEBSITE_PERMS } from './operational-reports/permissions';

// Website Metrics (Stage 5) — the full configure/preview/publish editor for admin-configured
// public figures. A sibling of the fixed-catalogue generation above and of Operational Reports
// (Stage 4) — its own backend resource (`/admin/dashboard/website-metrics`), own lifecycle.
export { WebsiteMetricsListPage } from './website-metrics/website-metrics-list-page';
export { WebsiteMetricEditorPage } from './website-metrics/website-metric-editor-page';
export { WEBSITE_METRICS_PERMS } from './website-metrics/permissions';
