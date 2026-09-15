'use client';

/**
 * Website Metric snapshot history — `GET /:id/history`, newest-first (backend's own ordering; the
 * repository query is not re-sorted client-side). Each row is a frozen `WebsiteMetricSnapshot`; the
 * CURRENT one (matching `metric.current_snapshot.id`) is highlighted. Flag/unflag-review only ever
 * acts on the metric's current snapshot (`website-metrics.service.ts`'s `flagForReview()` — older
 * history is read-only), so the action is shown once, not per-row.
 */

import { Flag, FlagOff, History as HistoryIcon } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/empty-state';
import { ErrorState } from '@/components/feedback/error-state';
import { SkeletonText } from '@/components/feedback/skeleton';
import { Can } from '@/components/auth';
import { formatDateTime } from '@/utils/date';
import { formatNumber } from '@/utils/format';
import { useFlagReview, useUnflagReview, useWebsiteMetricHistory } from '../api';
import { WEBSITE_METRICS_PERMS } from '../permissions';
import type { WebsiteMetricDetail } from '../types';

export function WebsiteMetricHistory({ metric }: { metric: WebsiteMetricDetail }) {
  const history = useWebsiteMetricHistory(metric.id);
  const flag = useFlagReview();
  const unflag = useUnflagReview();

  const currentSnapshotId = metric.current_snapshot?.id;

  return (
    <Card>
      <CardHeader
        title="Publish history"
        description="Every past snapshot — the frozen value, resolved filters/period, and completeness at the time it was published."
        actions={
          metric.current_snapshot ? (
            <Can permission={WEBSITE_METRICS_PERMS.manageData}>
              {metric.current_snapshot.flagged_for_review ? (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FlagOff className="h-4 w-4" />}
                  isLoading={unflag.isPending}
                  onClick={() => unflag.mutate(metric.id)}
                >
                  Clear review flag
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Flag className="h-4 w-4" />}
                  isLoading={flag.isPending}
                  onClick={() => flag.mutate(metric.id)}
                >
                  Flag for review
                </Button>
              )}
            </Can>
          ) : null
        }
      />
      <CardContent className="space-y-3">
        {history.isLoading ? <SkeletonText lines={4} /> : null}
        {history.isError ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} />
        ) : null}
        {!history.isLoading && !history.isError && (history.data ?? []).length === 0 ? (
          <EmptyState icon={HistoryIcon} title="No snapshots yet" description="Publish once to create the first one." />
        ) : null}
        {(history.data ?? []).map((snapshot) => (
          <div
            key={snapshot.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  {snapshot.value != null ? formatNumber(snapshot.value) : '—'}
                  {snapshot.unit ? <span className="ml-1 text-xs text-muted-foreground">{snapshot.unit}</span> : null}
                </span>
                {snapshot.id === currentSnapshotId ? <Badge tone="success">Current</Badge> : null}
                {snapshot.flagged_for_review ? <Badge tone="danger">Flagged</Badge> : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Config revision {snapshot.config_revision} · Calculated {formatDateTime(snapshot.calculated_at)}
              </p>
              {snapshot.published_at ? (
                <p className="text-xs text-muted-foreground">Published {formatDateTime(snapshot.published_at)}</p>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
