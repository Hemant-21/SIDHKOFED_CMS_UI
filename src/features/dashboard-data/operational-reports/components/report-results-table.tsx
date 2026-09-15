'use client';

/**
 * Supporting-rows table for a generated report. Report rows vary in shape by report key (the
 * backend returns whatever fields that report's underlying records have — see
 * `operational-reports.repository.ts` on the backend), so columns are derived from the keys of
 * the first row rather than hard-coded per report. This stays a faithful "show what the backend
 * sent" table — no client-side formatting beyond making raw values readable (dates, booleans,
 * null).
 */

import { useMemo } from 'react';
import { DataTable } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/empty-state';
import { Table2 } from 'lucide-react';
import type { ColumnDef } from '@/types/table';
import type { OperationalReportRow } from '../types';

function renderCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

interface ReportResultsTableProps {
  rows: OperationalReportRow[];
  totalItems: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  onRetry?: () => void;
}

export function ReportResultsTable({
  rows,
  totalItems,
  totalPages,
  isLoading,
  isError,
  error,
  onRetry,
}: ReportResultsTableProps) {
  const columns: ColumnDef<OperationalReportRow>[] = useMemo(() => {
    const sample = rows[0];
    const keys = sample ? Object.keys(sample) : [];
    return keys.map((key) => ({
      id: key,
      header: key,
      cell: (row: OperationalReportRow) => renderCell(row[key]),
    }));
  }, [rows]);

  return (
    <DataTable<OperationalReportRow>
      columns={columns}
      data={{ rows, totalItems, totalPages, isLoading, isError, error }}
      getRowId={(row) => String(row.id ?? JSON.stringify(row))}
      onRetry={onRetry}
      emptyState={<EmptyState icon={Table2} title="No supporting records" description="No rows match the selected period and filters." />}
    />
  );
}
