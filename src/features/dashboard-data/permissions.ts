/**
 * Permission keys for the Dashboard Data module (dashboard.permissions.ts).
 *
 * The dashboard reuses the project's existing RBAC — no new authorization system.
 *
 * `publish`/`unpublish`/`archive`/`restore` and `REPORT_DEFINITION_ROLES` used to gate the fixed
 * "Dashboard Reports" report-DEFINITION lifecycle (create/PATCH was Super-Admin-only via
 * `REPORT_DEFINITION_ROLES`; the public lifecycle actions used the `dashboard.*` permission keys
 * below). The backend retired that feature entirely (its admin routes, services, and rows are
 * gone), and its only CMS consumer (`report-lifecycle-actions.tsx` / `report-list-page.tsx` /
 * `report-form-page.tsx`) was removed with it, so those exports were removed here too.
 *
 * `manageData` (`dashboard.manage_data`) is kept even though nothing in this feature calls it
 * operationally any more (it previously gated the already-removed legacy Metrics/Datasets/Excel
 * Import UI) — `src/features/roles/types.ts`'s permission catalogue for the Roles management UI
 * still lists `dashboard.manage_data` as an assignable backend permission, and that catalogue is a
 * legitimate reason to keep the string constant mirrored here even with no active CMS route using it.
 */

export const DASHBOARD_PERMS = {
  manageData: 'dashboard.manage_data',
} as const;
