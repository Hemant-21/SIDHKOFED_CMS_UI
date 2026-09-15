/**
 * Admin Dashboard DTOs (Phase 15.2). Mirrors the backend audit contract EXACTLY
 * (src/modules/audit/audit.dto.ts) so the frontend never invents a shape.
 *
 * This file used to also carry the fixed "Dashboard Reports" DTOs (report/metric
 * summaries, the public KPI response, financial-year/reporting-period refs). The
 * backend retired that concept entirely — every `/public/dashboard*` route, the
 * admin report-definition routes, and the underlying rows are gone — so those
 * types were removed along with the CMS pages that used them. See the Dashboard
 * Reports removal note in `src/features/dashboard-data`.
 */

/** One audit-log entry (`GET /admin/audit-logs`). Drives Recent Activity. */
export interface AuditLogEntry {
  id: string;
  action: string;
  event: string | null;
  module: string;
  record_id: string | null;
  previous_state: string | null;
  new_state: string | null;
  change_summary: string | null;
  metadata: unknown;
  user: { id: string; email: string; full_name: string } | null;
  created_at: string;
}
