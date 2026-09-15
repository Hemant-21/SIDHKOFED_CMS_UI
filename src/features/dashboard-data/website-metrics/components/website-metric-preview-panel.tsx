'use client';

/**
 * Website Metric preview panel — the "backend-resolved value only, never client-computed" precedent
 * from `dashboard-data/components/report-preview.tsx`, adapted for the richer preview→publish
 * safety mechanism this module has: `POST /:id/preview` returns a single-use `previewToken` tied to
 * the exact `config_revision` that was calculated (`website-metrics.service.ts`'s `preview()`).
 *
 * This panel holds the last previewed result (value/unit/completeness/token/config snapshot) in
 * local state and compares the CURRENTLY EDITED form config against the config that was actually
 * previewed (`stableConfigStringify`). If they differ — the user changed report/measure/filters/
 * period after previewing — publish is blocked with an explicit "re-preview" warning, mirroring the
 * backend's own rejection (`payload.configRevision !== metric.configRevision`) client-side so the
 * user sees it before clicking Publish, not after a 409.
 */

import { Eye, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorState } from '@/components/feedback/error-state';
import { SkeletonText } from '@/components/feedback/skeleton';
import { formatNumber } from '@/utils/format';
import { formatRelative } from '@/utils/date';
import { stableConfigStringify, type WebsiteMetricConfigFormValue, type WebsiteMetricPreviewResult } from '../types';

export interface PreviewState {
  result: WebsiteMetricPreviewResult;
  /** The exact config that produced `result`, captured at preview time. */
  previewedConfig: string;
}

export function WebsiteMetricPreviewPanel({
  currentValue,
  preview,
  isPending,
  isError,
  error,
  onPreview,
}: {
  currentValue: WebsiteMetricConfigFormValue;
  preview: PreviewState | null;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onPreview: () => void;
}) {
  const currentConfigKey = stableConfigStringify(currentValue);
  const isStale = preview !== null && preview.previewedConfig !== currentConfigKey;

  return (
    <Card>
      <CardHeader
        title="Preview"
        description="Server-calculated value for the current configuration — this is the only value that can be published."
        actions={
          <Button
            size="sm"
            variant={preview ? 'outline' : 'primary'}
            leftIcon={<Eye className="h-4 w-4" />}
            isLoading={isPending}
            onClick={onPreview}
          >
            {preview ? 'Re-preview' : 'Preview'}
          </Button>
        }
      />
      <CardContent className="space-y-4">
        {isPending ? <SkeletonText lines={3} /> : null}
        {!isPending && isError ? (
          <ErrorState error={error} title="Preview failed" onRetry={onPreview} />
        ) : null}

        {!isPending && !isError && preview ? (
          <>
            {isStale ? (
              <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-sm text-warning-foreground">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  The configuration has changed since this preview was calculated. Re-preview before
                  publishing — the backend will reject a publish against a stale preview.
                </span>
              </div>
            ) : null}

            <div className="rounded-lg border border-border p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {preview.result.labelEn}
              </p>
              <p className="mt-1 text-3xl font-semibold text-foreground">
                {preview.result.value != null ? formatNumber(preview.result.value) : '—'}
                {preview.result.unit ? (
                  <span className="ml-1 text-sm text-muted-foreground">{preview.result.unit}</span>
                ) : null}
              </p>
              {preview.result.value === null ? (
                <p className="mt-1 text-sm text-danger">
                  No eligible records for this filter/period — this cannot be published as a public
                  figure.
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Calculated {formatRelative(preview.result.calculatedAt)}
              </p>
            </div>

            {preview.result.completeness ? (
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Completeness
                </p>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(preview.result.completeness, null, 2)}
                </pre>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge tone="muted">Config revision {preview.result.configRevision}</Badge>
              {isStale ? (
                <span className="inline-flex items-center gap-1 text-warning">
                  <RefreshCcw className="h-3 w-3" /> Stale — re-preview needed
                </span>
              ) : (
                <span className="text-success">Current — safe to publish</span>
              )}
            </div>
          </>
        ) : null}

        {!isPending && !isError && !preview ? (
          <p className="text-sm text-muted-foreground">
            Run a preview to see the resolved value before publishing.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
