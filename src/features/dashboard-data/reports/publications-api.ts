'use client';

/**
 * FY snapshot publication data layer. Consumes `/admin/dashboard/reports/publications/*`
 * (backend `publications.routes.ts`), guarded by `report_publications.view`/`.publish`.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { get, post } from '@/lib/api/http';
import { errorMessage } from '@/lib/api/server-errors';
import { useToast } from '@/hooks/use-toast';
import type { ReportResult } from './types';

const BASE = '/admin/dashboard/reports/publications';

export interface PublicationStatus {
  financialYearId: string;
  financialYearLabel: string;
  published: boolean;
  lastPublished: {
    id: string;
    publishedAt: string;
    publishedByName: string;
    generatedAt: string;
    calculationVersion: number;
  } | null;
}

export interface PublicationHistoryEntry {
  id: string;
  publishedAt: string;
  publishedByName: string;
  generatedAt: string;
  calculationVersion: number;
}

export interface PublicationPreview {
  previewToken: string;
  financialYearId: string;
  calculationVersion: number;
  fyStartDate: string;
  fyEndDate: string;
  generatedAt: string;
  programmeReport: ReportResult;
  districtReport: ReportResult;
  commodityReport: ReportResult;
}

export function usePublicationStatus(financialYearId: string | undefined) {
  return useQuery({
    queryKey: ['reports', 'publications', 'status', financialYearId] as const,
    queryFn: () => get<PublicationStatus>(`${BASE}/${financialYearId}/status`),
    enabled: Boolean(financialYearId),
    staleTime: 30_000,
  });
}

export function usePublicationHistory(financialYearId: string | undefined) {
  return useQuery({
    queryKey: ['reports', 'publications', 'history', financialYearId] as const,
    queryFn: () => get<PublicationHistoryEntry[]>(`${BASE}/${financialYearId}/history`),
    enabled: Boolean(financialYearId),
    staleTime: 30_000,
  });
}

export function useGeneratePublicationPreview(financialYearId: string | undefined) {
  const toast = useToast();
  return useMutation({
    mutationFn: () => post<PublicationPreview>(`${BASE}/${financialYearId}/preview`),
    onError: (error) => toast.error(errorMessage(error)),
  });
}

export function useApprovePublication(financialYearId: string | undefined) {
  const toast = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (previewToken: string) => post(`${BASE}/${financialYearId}/publish`, { previewToken }),
    onSuccess: () => {
      toast.success('Published. All three reports now point at this FY snapshot.');
      void qc.invalidateQueries({ queryKey: ['reports', 'publications', 'status', financialYearId] });
      void qc.invalidateQueries({ queryKey: ['reports', 'publications', 'history', financialYearId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
