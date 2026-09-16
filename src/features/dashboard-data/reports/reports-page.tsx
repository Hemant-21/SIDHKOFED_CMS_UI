'use client';

/**
 * Reports — replaces the six-report "Generate Reports" screen with exactly three: Programme,
 * District Activity Coverage, Commodity-wise. A shared single-select FY (default current FY) lives
 * at the page level, retained across tabs and surviving each tab's Reset; each tab keeps its own
 * applied multiselect filters independently.
 */
import { useMemo, useState } from 'react';
import { Download, FileBarChart2, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { SkeletonText } from '@/components/feedback/skeleton';
import { Can } from '@/components/auth';
import { ROUTES } from '@/constants/routes';
import { useReportFilterOptions, useGenerateReport, useExportReport } from './api';
import { REPORTS_PERMS } from './permissions';
import { ReportFiltersPanel } from './components/report-filters-panel';
import { PublicationPanel } from './components/publication-panel';
import { ProgrammeReportTable } from './components/programme-report-view';
import { DistrictReportTable } from './components/district-report-view';
import { CommodityReportTable } from './components/commodity-report-view';
import type {
  CommodityReportRow,
  DistrictReportRow,
  FilterOptions,
  ProgrammeReportRow,
  ReportFilterInput,
  ReportKey,
  ReportResult,
} from './types';

const REPORT_TABS: { key: ReportKey; label: string }[] = [
  { key: 'programme_report', label: 'Programme' },
  { key: 'district_activity_coverage', label: 'District Activity' },
  { key: 'commodity_report', label: 'Commodity-wise' },
];

function ReportTabPanel({ reportKey, options, financialYearId }: { reportKey: ReportKey; options: FilterOptions; financialYearId: string }) {
  const [applied, setApplied] = useState<ReportFilterInput | undefined>(undefined);

  const generate = useGenerateReport(reportKey, applied);
  const exportReport = useExportReport(reportKey);

  const handleApply = (filters: ReportFilterInput) => setApplied({ ...filters, financialYearId });
  const handleReset = () => setApplied(undefined);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <ReportFiltersPanel
            reportKey={reportKey}
            options={options}
            financialYearId={financialYearId}
            onApply={handleApply}
            onReset={handleReset}
            isPending={generate.isFetching}
          />
        </CardContent>
      </Card>

      {applied ? (
        <Card>
          <CardHeader
            title="Results"
            actions={
              <Can permission={REPORTS_PERMS.export}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  isLoading={exportReport.isPending}
                  onClick={() => exportReport.mutate(applied)}
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
              <ReportResultView result={generate.data} />
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ReportResultView({ result }: { result: ReportResult }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Financial year <strong className="text-foreground">{result.financialYear.label}</strong> · {result.rows.length}{' '}
        {result.rows.length === 1 ? 'result' : 'results'} · generated {new Date(result.generatedAt).toLocaleString('en-IN')}
      </div>

      <ResultTable result={result} />
    </div>
  );
}

function ResultTable({ result }: { result: ReportResult }) {
  if (result.reportKey === 'programme_report') return <ProgrammeReportTable rows={result.rows as ProgrammeReportRow[]} />;
  if (result.reportKey === 'district_activity_coverage') return <DistrictReportTable rows={result.rows as DistrictReportRow[]} />;
  return <CommodityReportTable rows={result.rows as CommodityReportRow[]} />;
}

export function ReportsPage() {
  const [tab, setTab] = useState<ReportKey>('programme_report');
  const tabContents = useMemo(() => REPORT_TABS, []);
  const optionsQuery = useReportFilterOptions();
  const [fyId, setFyId] = useState('');

  const options = optionsQuery.data;
  const effectiveFyId = fyId || options?.financialYears.find((f) => f.isCurrent)?.id || options?.financialYears[0]?.id || '';
  const effectiveFy = options?.financialYears.find((f) => f.id === effectiveFyId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Live-calculated Programme, District Activity Coverage, and Commodity-wise reports for the selected financial year."
        breadcrumbs={[{ label: 'Dashboard', href: ROUTES.dashboard }, { label: 'Reports' }]}
      />

      <Can
        permission={REPORTS_PERMS.view}
        fallback={
          <EmptyState
            icon={ShieldAlert}
            title="You do not have access to Reports"
            description="Ask an administrator to grant the operational_reports.view permission."
          />
        }
      >
        {optionsQuery.isLoading ? (
          <Card>
            <CardContent>
              <SkeletonText lines={4} />
            </CardContent>
          </Card>
        ) : optionsQuery.isError || !options ? (
          <ErrorState error={optionsQuery.error} onRetry={() => void optionsQuery.refetch()} />
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-wrap items-end gap-4">
                <div className="w-48 space-y-1.5">
                  <Label>Financial year</Label>
                  <Select value={effectiveFyId} onChange={(e) => setFyId(e.target.value)}>
                    {options.financialYears.map((fy) => (
                      <option key={fy.id} value={fy.id}>
                        {fy.label}
                        {fy.isAllYearsAggregate ? ' (combined)' : fy.isCurrent ? ' (current)' : ''}
                      </option>
                    ))}
                  </Select>
                </div>
                <p className="pb-2 text-xs text-muted-foreground">
                  Shared across all three tabs. Each tab&apos;s Reset keeps this financial year selection.
                </p>
              </CardContent>
            </Card>

            {effectiveFy ? (
              <PublicationPanel
                financialYearId={effectiveFy.id}
                financialYearLabel={effectiveFy.label}
                isAllYearsAggregate={effectiveFy.isAllYearsAggregate}
              />
            ) : null}

            <Tabs defaultValue={tab} value={tab} onValueChange={(v) => setTab(v as ReportKey)}>
              <TabsList>
                {tabContents.map((t) => (
                  <TabsTrigger key={t.key} value={t.key}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {tabContents.map((t) => (
                <TabsContent key={t.key} value={t.key}>
                  {tab === t.key ? <ReportTabPanel reportKey={t.key} options={options} financialYearId={effectiveFyId} /> : null}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </Can>
    </div>
  );
}
