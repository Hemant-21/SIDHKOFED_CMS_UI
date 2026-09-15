'use client';

/**
 * Dashboard React Query hooks (Phase 15.2). Each wraps an existing backend
 * endpoint with the standard caching/retry/refresh policy. They expose loading,
 * error, and refetch so every card renders skeleton → data → error → retry without
 * bespoke fetch logic (reuses the Phase-15.1 query stack).
 *
 * `useDashboardKpis` and `useDashboardReports` used to live here too, backing the
 * headline-figures grid and the report-status/system-status widgets. The backend
 * retired the fixed "Dashboard Reports" concept entirely (every `/public/dashboard*`
 * route and the admin report-definition routes are gone), so both hooks were
 * removed along with the widgets that used them. See the Dashboard Reports removal
 * note in `../dashboard-data`.
 */

import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/constants/query-keys';
import type { ListQuery } from '@/types/api';
import { fetchContentCount, fetchRecentActivity } from './api';

/** Recent administrative activity (audit log; Super Admin only — gate the call with `enabled`). */
export function useRecentActivity(query?: ListQuery, enabled = true) {
  return useQuery({
    queryKey: queryKeys.audit.list(query),
    queryFn: () => fetchRecentActivity(query),
    enabled,
    staleTime: 30_000,
  });
}

/** One KPI descriptor: a label + the resource/filters whose backend total it shows. */
export interface ContentCountSpec {
  key: string;
  resource: string;
  filters?: Record<string, string | number | boolean | undefined>;
}

/**
 * Fetch several content totals in parallel (one query per spec, independently
 * cached). Returns the raw query results aligned to the input specs so each KPI
 * card can render its own loading/error state.
 */
export function useContentCounts(specs: ContentCountSpec[], enabled = true) {
  return useQueries({
    queries: specs.map((spec) => ({
      queryKey: queryKeys.dashboard.contentCount(spec.resource, spec.filters),
      queryFn: () => fetchContentCount(spec.resource, spec.filters),
      enabled,
      staleTime: 60_000,
    })),
  });
}
