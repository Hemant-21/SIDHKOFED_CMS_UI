/**
 * Centralized client route map. Components/nav never hardcode path strings —
 * they reference ROUTES so a path change is a one-line edit. Module pages are NOT
 * built in this foundation; their routes are reserved here so future modules slot
 * in by adding a folder under src/app/(admin) and wiring nav config.
 */

export const ROUTES = {
  home: '/',
  login: '/login',

  // Admin Dashboard — fixed KPIs, activity, and report status (Phase 15.2).
  dashboard: '/dashboard',

  // Global search results page (Phase 15.2). The search modal (Ctrl/Cmd+K) is
  // available everywhere; this is the dedicated, deep-linkable results surface.
  search: '/search',

  // Knowledge Centre (Phase 15.4) — a curated reader over Documents whose document type
  // resolves to document_section=publications, grouped by knowledge category. It reuses the
  // documents resource; it is not a separate backend entity.
  knowledgeCentre: '/knowledge-centre',

  // Dashboard Data — the fixed "Dashboard Reports" report-definition feature (Phase 15.8) that
  // used to live at `/dashboard/reports*` was removed entirely: the backend retired the
  // `DashboardReport`/`DashboardMetric`/`DashboardDataset` admin routes, services, and every
  // `/public/dashboard*` public route, and deleted the underlying rows. Only the two sibling
  // concepts below remain under the dashboard umbrella.
  //
  // NOTE: the legacy manual Metrics/Datasets/Excel-Import routes (`/dashboard/metrics`,
  // `/dashboard/datasets`, `/dashboard/import`) and the `/dashboard-data` "Legacy Figures" route
  // were removed entirely too — the underlying data was dummy/test data, not real historical figures.

  // Reports — the single "Generate Reports" surface: Programme / District Activity Coverage /
  // Commodity-wise, replacing the earlier six-report Operational Reports catalogue on this screen
  // (`features/dashboard-data/reports/reports-page.tsx`). The old `/generate` segment is kept as
  // the path so existing bookmarks/links still resolve.
  dashboardGenerateReports: '/dashboard/reports/generate',

  // Error / status routes. Runtime errors are caught by error.tsx / global-error.tsx;
  // these are addressable status pages (e.g. for a reverse-proxy `error_page` map).
  // NOTE: avoid the reserved `/500` segment — it collides with Next's generated
  // 500.html at build time on the App Router, so the 500 surface lives at
  // `/server-error`.
  forbidden: '/403',
  notFound: '/404',
  serverError: '/server-error',

  // Reserved future module list routes (folders not created in this foundation).
  // Kept here so navigation + breadcrumbs resolve without magic strings.
  events: '/events',
  news: '/news',
  programmes: '/programmes',
  toolkits: '/toolkits',
  institutions: '/institutions',
  documents: '/documents',
  communications: '/official-communications',
  tenders: '/tenders',
  procurement: '/procurement-updates',
  media: '/media',
  galleries: '/galleries',
  videos: '/videos',
  memberships: '/memberships',
  faqs: '/faqs',
  digitalServices: '/digital-services',
  leadership: '/leadership',
  enquiries: '/enquiries',
  masters: '/masters',
  users: '/users',
  roles: '/roles',
  auditLog: '/audit-log',
  settings: '/settings',
  profile: '/profile',
} as const;
