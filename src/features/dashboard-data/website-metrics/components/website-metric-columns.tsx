import Link from 'next/link';
import { Eye, EyeOff, Flag } from 'lucide-react';
import type { ColumnDef } from '@/types/table';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import type { WebsiteMetricSummary } from '../types';

/**
 * Website Metrics list columns. A metric is "published" when it has a `current_snapshot` (the
 * pointer, not a status enum — mirrors `website-metrics.service.ts`'s `unpublish()`, which just
 * clears `currentSnapshotId`). Sort fields map to the backend's `WEBSITE_METRIC_ORDERING_FIELDS`:
 * `display_order` (default), `created_at`.
 */
export function websiteMetricColumns(
  actions?: (row: WebsiteMetricSummary) => React.ReactNode,
): ColumnDef<WebsiteMetricSummary>[] {
  const cols: ColumnDef<WebsiteMetricSummary>[] = [
    {
      id: 'label_en',
      header: 'Metric',
      cell: (r) => (
        <div className="min-w-0">
          <Link
            href={`${ROUTES.dashboardWebsiteMetrics}/${r.id}/edit`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {r.label_en}
          </Link>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {r.report_key} · {r.measure_key}
          </p>
        </div>
      ),
    },
    {
      id: 'placement_key',
      header: 'Placement',
      cell: (r) => <Badge tone="muted">{r.placement_key === 'homepage' ? 'Homepage' : 'About Us'}</Badge>,
    },
    {
      id: 'current_value',
      header: 'Published value',
      cell: (r) =>
        r.current_snapshot ? (
          <span className="font-medium text-foreground">
            {r.current_snapshot.value != null ? formatNumber(r.current_snapshot.value) : '—'}
            {r.current_snapshot.unit ? (
              <span className="ml-1 text-xs text-muted-foreground">{r.current_snapshot.unit}</span>
            ) : null}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      id: 'published',
      header: 'Published',
      align: 'center',
      cell: (r) =>
        r.current_snapshot ? (
          <Eye className="mx-auto h-4 w-4 text-primary" aria-label="Published" />
        ) : (
          <EyeOff className="mx-auto h-4 w-4 text-muted-foreground" aria-label="Not published" />
        ),
    },
    {
      id: 'flagged',
      header: 'Flag',
      align: 'center',
      defaultHidden: true,
      cell: (r) =>
        r.current_snapshot?.flagged_for_review ? (
          <Flag className="mx-auto h-4 w-4 text-danger" aria-label="Flagged for review" />
        ) : (
          <span className="sr-only">Not flagged</span>
        ),
    },
    {
      id: 'is_archived',
      header: 'State',
      cell: (r) =>
        r.is_archived ? (
          <Badge tone="muted">Archived</Badge>
        ) : r.is_enabled === false ? (
          <Badge tone="muted">Disabled</Badge>
        ) : (
          <Badge tone="success">Active</Badge>
        ),
    },
    {
      id: 'display_order',
      header: 'Order',
      sortField: 'display_order',
      align: 'center',
      defaultHidden: true,
      cell: (r) => r.display_order,
    },
    {
      id: 'updated_at',
      header: 'Last updated',
      sortField: 'created_at',
      cell: (r) => (
        <span className="text-muted-foreground" title={r.updated_at}>
          {formatRelative(r.updated_at)}
        </span>
      ),
    },
  ];

  if (actions) {
    cols.push({
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      isActionColumn: true,
      align: 'right',
      cell: (r) => actions(r),
    });
  }
  return cols;
}
