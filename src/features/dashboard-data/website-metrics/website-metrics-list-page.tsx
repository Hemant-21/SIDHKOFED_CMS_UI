'use client';

/**
 * Website Metrics list page. Server-paginated/filtered (placement/enabled/archived) — mirrors
 * `dashboard-data/report-list-page.tsx`'s `useDataTable()` + `<DataTable>` pattern. The realistic
 * creation path is "Use on website" from Generate Reports (`operational-reports/components/
 * report-summary-cards.tsx`), which drafts a config and routes straight to the editor — but direct
 * creation is supported too via a minimal picker on the "New" route, since the editor itself already
 * has the full report/measure/filter/period form (`website-metric-editor-page.tsx` handles both the
 * `?draft=1` new-metric case and editing an existing id — see that file).
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus, Gauge, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Toolbar } from '@/components/layout/toolbar';
import { Card } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { DataTable, ColumnVisibility, useDataTable } from '@/components/data-table';
import { EmptyState } from '@/components/feedback/empty-state';
import { Can } from '@/components/auth';
import { useFilters } from '@/hooks/crud';
import { ROUTES } from '@/constants/routes';
import { useWebsiteMetricsList } from './api';
import { WEBSITE_METRICS_PERMS } from './permissions';
import type { WebsiteMetricSummary } from './types';
import { websiteMetricColumns } from './components/website-metric-columns';
import { WebsiteMetricFilters, WEBSITE_METRIC_FILTER_KEYS } from './components/website-metric-filters';

function toBool(value: string | undefined): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export function WebsiteMetricsListPage() {
  const filters = useFilters({ keys: WEBSITE_METRIC_FILTER_KEYS });
  const table = useDataTable();

  const query = useMemo(
    () => ({
      placement: filters.filters.placement,
      enabled: toBool(filters.filters.enabled),
      archived: toBool(filters.filters.archived),
      page: filters.page,
      sort: table.sort?.field,
      order: table.sort?.direction,
    }),
    [filters.filters, filters.page, table.sort],
  );

  const list = useWebsiteMetricsList(query);

  const columns = useMemo(
    () =>
      websiteMetricColumns((row) => (
        <Button asChild variant="ghost" size="sm">
          <Link href={`${ROUTES.dashboardWebsiteMetrics}/${row.id}/edit`}>Manage</Link>
        </Button>
      )),
    [],
  );

  const rows = list.data?.items ?? [];
  const pagination = list.data?.pagination;

  return (
    <Can
      permission={WEBSITE_METRICS_PERMS.view}
      fallback={
        <div className="space-y-6">
          <PageHeader title="Website Metrics" />
          <EmptyState
            icon={ShieldAlert}
            title="You do not have access to Website Metrics"
            description="Ask an administrator to grant the website_metrics.view permission."
          />
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Website Metrics"
          description="Admin-configured public figures — pointers at live Operational Report measures, previewed and published to the homepage or About Us page."
          breadcrumbs={[{ label: 'Dashboard', href: ROUTES.dashboard }, { label: 'Website Metrics' }]}
          actions={
            <Can permission={WEBSITE_METRICS_PERMS.manageData}>
              <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
                <Link href={`${ROUTES.dashboardWebsiteMetrics}/new`}>New metric</Link>
              </Button>
            </Can>
          }
        />

        <WebsiteMetricFilters filters={filters} />

        <Toolbar
          end={
            <ColumnVisibility
              columns={columns}
              hidden={table.hiddenColumns}
              onChange={table.setHiddenColumns}
            />
          }
        />

        <Card className="p-0">
          <DataTable<WebsiteMetricSummary>
            columns={columns}
            data={{
              rows,
              totalItems: pagination?.total_items ?? 0,
              totalPages: pagination?.total_pages ?? 0,
              isLoading: list.isLoading,
              isError: list.isError,
              error: list.error,
            }}
            getRowId={(row) => row.id}
            sort={table.sort}
            onSortChange={table.onSortChange}
            hiddenColumns={table.hiddenColumns}
            onRetry={() => void list.refetch()}
            emptyState={
              <EmptyState
                icon={Gauge}
                title={filters.isActive ? 'No metrics match your filters' : 'No website metrics configured'}
                description={
                  filters.isActive
                    ? 'Try adjusting or clearing the filters.'
                    : 'Configure one from Generate Reports ("Use on website") or create one directly.'
                }
                action={
                  filters.isActive ? (
                    <Button variant="outline" size="sm" onClick={filters.reset}>
                      Clear filters
                    </Button>
                  ) : null
                }
              />
            }
          />
        </Card>

        {pagination ? (
          <Pagination
            page={pagination.page}
            pageSize={pagination.page_size}
            totalItems={pagination.total_items}
            totalPages={pagination.total_pages}
            onPageChange={filters.setPage}
          />
        ) : null}
      </div>
    </Can>
  );
}
