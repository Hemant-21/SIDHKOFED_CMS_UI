'use client';

/**
 * Reports data layer. Consumes `/admin/dashboard/reports/*` (backend `reports.routes.ts`), guarded
 * by the same `operational_reports.view`/`.export` permissions the six-report catalogue used —
 * this replaces that catalogue's CMS screen, not the permission grant.
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { get, post, postBlob } from '@/lib/api/http';
import { errorMessage } from '@/lib/api/server-errors';
import { useToast } from '@/hooks/use-toast';
import { downloadBlob } from '@/utils/browser';
import type { FilterOptions, ReportFilterInput, ReportKey, ReportResult } from './types';

const REPORTS_BASE = '/admin/dashboard/reports';

const generatePath = (key: ReportKey) => `${REPORTS_BASE}/${key}/generate`;
const exportPath = (key: ReportKey) => `${REPORTS_BASE}/${key}/export`;

/** FY + programme/district/block/eventType/commodity options, shared across all three tabs. */
export function useReportFilterOptions() {
  return useQuery({
    queryKey: ['reports', 'filter-options'] as const,
    queryFn: () => get<FilterOptions>(`${REPORTS_BASE}/filter-options`),
    staleTime: 5 * 60_000,
  });
}

/**
 * Live-calculate a report (`POST /admin/dashboard/reports/:key/generate`). Disabled until filters
 * are applied — the caller's Apply button controls when `filters` actually changes.
 */
export function useGenerateReport(reportKey: ReportKey, filters: ReportFilterInput | undefined) {
  return useQuery({
    queryKey: ['reports', 'generate', reportKey, filters] as const,
    queryFn: () => post<ReportResult, ReportFilterInput>(generatePath(reportKey), filters ?? {}),
    enabled: Boolean(filters),
    staleTime: 30_000,
  });
}

/** XLSX export — a one-shot mutation with a file-download side effect. */
export function useExportReport(reportKey: ReportKey) {
  const toast = useToast();
  return useMutation({
    mutationFn: (filters: ReportFilterInput) => postBlob(exportPath(reportKey), filters),
    onSuccess: (blob) => {
      const today = new Date().toISOString().slice(0, 10);
      downloadBlob(blob, `${reportKey}-${today}.xlsx`);
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
