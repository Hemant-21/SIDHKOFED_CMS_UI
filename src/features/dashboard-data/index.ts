/**
 * Dashboard Data feature. Built on the shared 15.0/15.1 infrastructure and backend contracts. The
 * dashboard is backend-driven — no builder, no client-side aggregation, no computed KPI (codex §13).
 *
 * The legacy manual Metrics/Datasets/Excel-Import surfaces, the fixed "Dashboard Reports"
 * report-definition feature, the six-report Operational Reports catalogue, and Website Metrics
 * (curated public figures) have all been removed — the backend retired their admin/public routes
 * and dropped the underlying rows/tables. Only Reports (Programme/District/Commodity, with FY
 * snapshot publication) remains below.
 */

// Reports — Programme / District Activity Coverage / Commodity-wise, `/dashboard/reports/generate`.
export { ReportsPage } from './reports/reports-page';
export { REPORTS_PERMS, REPORT_PUBLICATIONS_PERMS } from './reports/permissions';
