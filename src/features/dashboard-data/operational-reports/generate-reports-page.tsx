'use client';

/**
 * Generate Reports (Stage 4) — the live-calculated Operational Reports surface: pick a report,
 * period and filters (Apply/Reset — see `report-filter-form.tsx` for why this deviates from the
 * rest of the CMS's immediate-apply filter convention), see the resulting summary + supporting
 * rows, export to XLSX, or push a public-eligible measure onto the website as a draft metric.
 *
 * The applied selection is mirrored into the URL (a single opaque `q` param) purely for
 * shareability/refresh-survival — it is read once on mount and written only on Apply/Reset, never
 * on every keystroke, matching the spec's "reflect filters in the URL" requirement without
 * reintroducing the immediate-apply behavior this form deliberately avoids.
 */

import { useMemo, useState } from 'react';
import { Download, FileBarChart2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { SkeletonText } from '@/components/feedback/skeleton';
import { Pagination } from '@/components/ui/pagination';
import { Can } from '@/components/auth';
import { ROUTES } from '@/constants/routes';
import { useQueryParams } from '@/hooks/use-query-params';
import {
  useOperationalReportsCatalogue,
  useGenerateOperationalReport,
  useExportOperationalReport,
} from './api';
import { OPERATIONAL_REPORTS_PERMS } from './permissions';
import { ReportFilterForm, type ReportFilterFormValue } from './components/report-filter-form';
import { ReportSummaryCards } from './components/report-summary-cards';
import { ReportResultsTable } from './components/report-results-table';
import type { GenerateReportBody, OperationalReportKey } from './types';

const PARAM_KEY = 'q';

function encodeParams(value: ReportFilterFormValue): string {
  return encodeURIComponent(JSON.stringify(value));
}

function decodeParams(raw: string | null): ReportFilterFormValue | null {
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as ReportFilterFormValue;
  } catch {
    return null;
  }
}

function toFormInitial(value: ReportFilterFormValue) {
  const { reportKey, body } = value;
  const { periodInput, filters } = body;
  return {
    reportKey,
    periodMode: periodInput.mode,
    startDate: periodInput.startDate ?? '',
    endDate: periodInput.endDate ?? '',
    financialYearLabel: periodInput.financialYearLabel ?? '',
    filters: filters ?? {},
  };
}

export function GenerateReportsPage() {
  const qp = useQueryParams();
  // Read once on mount only — Apply/Reset are the only writers, so re-decoding on every render
  // (as qp.get would after any unrelated navigation.replace) would fight the local state below.
  const [initialApplied] = useState<ReportFilterFormValue | null>(() => decodeParams(qp.get(PARAM_KEY)));

  const [applied, setApplied] = useState<ReportFilterFormValue | null>(initialApplied);
  const [page, setPage] = useState(initialApplied?.body.page ?? 1);

  const catalogue = useOperationalReportsCatalogue();

  const activeBody: GenerateReportBody | undefined = useMemo(
    () => (applied ? { ...applied.body, page, pageSize: applied.body.pageSize ?? 50 } : undefined),
    [applied, page],
  );

  const generate = useGenerateOperationalReport(applied?.reportKey, activeBody);
  const exportReport = useExportOperationalReport(applied?.reportKey ?? '');

  const reportDef = catalogue.data?.find((r) => r.key === applied?.reportKey);

  const handleApply = (value: ReportFilterFormValue) => {
    setApplied(value);
    setPage(1);
    qp.set({ [PARAM_KEY]: encodeParams(value) }, { resetPage: false });
  };

  const handleReset = () => {
    setApplied(null);
    setPage(1);
    qp.remove(PARAM_KEY);
  };

  const handleExport = () => {
    if (!applied) return;
    exportReport.mutate({ periodInput: applied.body.periodInput, filters: applied.body.filters });
  };

  const totalPages = generate.data
    ? Math.max(1, Math.ceil(generate.data.rows.total / generate.data.rows.pageSize))
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Reports"
        description="Live-calculated operational reports — pick a report, a period and filters, then Apply."
        breadcrumbs={[
          { label: 'Dashboard', href: ROUTES.dashboard },
          { label: 'Reports' },
          { label: 'Generate' },
        ]}
      />

      <Can
        permission={OPERATIONAL_REPORTS_PERMS.view}
        fallback={
          <EmptyState
            icon={ShieldAlert}
            title="You do not have access to Operational Reports"
            description="Ask an administrator to grant the operational_reports.view permission."
          />
        }
      >
      {catalogue.isLoading ? (
        <Card>
          <CardContent>
            <SkeletonText lines={4} />
          </CardContent>
        </Card>
      ) : catalogue.isError ? (
        <ErrorState error={catalogue.error} onRetry={() => void catalogue.refetch()} />
      ) : (
        <ReportFilterForm
          catalogue={catalogue.data ?? []}
          onApply={handleApply}
          onReset={handleReset}
          initial={applied ? toFormInitial(applied) : undefined}
        />
      )}

      {applied ? (
        <Card>
          <CardHeader
            title="Results"
            actions={
              <Can permission={OPERATIONAL_REPORTS_PERMS.export}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  isLoading={exportReport.isPending}
                  onClick={handleExport}
                >
                  Export (XLSX)
                </Button>
              </Can>
            }
          />
          <CardContent className="space-y-6">
            {generate.isLoading ? (
              <SkeletonText lines={4} />
            ) : generate.isError ? (
              <ErrorState error={generate.error} onRetry={() => void generate.refetch()} />
            ) : !generate.data ? (
              <EmptyState icon={FileBarChart2} title="No results" />
            ) : (
              <>
                <ReportSummaryCards
                  reportKey={applied.reportKey as OperationalReportKey}
                  body={activeBody as GenerateReportBody}
                  summary={generate.data.summary}
                  measureDefinitions={reportDef?.measures ?? []}
                />
                <ReportResultsTable
                  rows={generate.data.rows.items}
                  totalItems={generate.data.rows.total}
                  totalPages={totalPages}
                  isLoading={generate.isFetching}
                  isError={false}
                  onRetry={() => void generate.refetch()}
                />
                <Pagination
                  page={generate.data.rows.page}
                  pageSize={generate.data.rows.pageSize}
                  totalItems={generate.data.rows.total}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      ) : null}
      </Can>
    </div>
  );
}
