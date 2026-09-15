'use client';

/**
 * Website Metric editor — `/dashboard/website-metrics/[id]/edit`. Handles two cases:
 *
 *   - `id` is `undefined` (route: `/dashboard/website-metrics/new`) — a minimal creation form
 *     (report/measure/labels/placement/order, no filters/period picker complexity up front, no
 *     preview/publish yet since there is no id). On create, the page swaps straight into edit mode
 *     for the new id (no client-side navigation needed — `useState` + the returned id).
 *   - `id` is set — the realistic path (usually arrived at via "Use on website" from Generate
 *     Reports, which already POSTed the draft and pushed here — see
 *     `operational-reports/components/report-summary-cards.tsx`). Full editor: config form, Save,
 *     Preview panel (holds the previewToken + staleness check), lifecycle actions, and a snapshot
 *     history tab.
 *
 * "Config changed since preview" safety: `previewedConfig` (a `stableConfigStringify` of the exact
 * config that was last previewed) is compared against the LIVE form value on every render — so the
 * moment the user edits report/measure/filters/period after previewing, `hasValidPreview` flips to
 * false and Publish disables itself, before the backend would even see the stale token.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/feedback/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { ForbiddenState } from '@/components/feedback/forbidden-state';
import { Can } from '@/components/auth';
import { ROUTES } from '@/constants/routes';
import { useOperationalReportsCatalogue } from '../operational-reports/api';
import {
  useCreateWebsiteMetric,
  useUpdateWebsiteMetricConfig,
  useWebsiteMetricDetail,
  usePreviewWebsiteMetric,
} from './api';
import { WEBSITE_METRICS_PERMS } from './permissions';
import {
  detailToFormValue,
  formValueToUpdatePayload,
  stableConfigStringify,
  WEBSITE_METRIC_PLACEMENTS,
  type WebsiteMetricConfigFormValue,
} from './types';
import { WebsiteMetricConfigForm } from './components/website-metric-config-form';
import { WebsiteMetricPreviewPanel, type PreviewState } from './components/website-metric-preview-panel';
import { WebsiteMetricLifecycleActions } from './components/website-metric-lifecycle-actions';
import { WebsiteMetricHistory } from './components/website-metric-history';

const EMPTY_VALUE: WebsiteMetricConfigFormValue = {
  reportKey: '',
  measureKey: '',
  filterConfig: {},
  periodConfig: { mode: 'current_financial_year' },
  labelEn: '',
  labelHi: null,
  placementKey: WEBSITE_METRIC_PLACEMENTS[0],
  displayOrder: 0,
};

const crumbs = (extra: { label: string }) => [
  { label: 'Dashboard', href: ROUTES.dashboard },
  { label: 'Website Metrics', href: ROUTES.dashboardWebsiteMetrics },
  { label: extra.label },
];

export function WebsiteMetricEditorPage({ id }: { id?: string }) {
  return (
    <Can
      permission={WEBSITE_METRICS_PERMS.view}
      fallback={
        <div className="space-y-6">
          <PageHeader title={id ? 'Edit website metric' : 'New website metric'} />
          <ForbiddenState />
        </div>
      }
    >
      {id ? <EditExisting id={id} /> : <CreateNew />}
    </Can>
  );
}

// ── Create (no id yet) ────────────────────────────────────────────────────────────

function CreateNew() {
  const catalogue = useOperationalReportsCatalogue();
  const [value, setValue] = useState<WebsiteMetricConfigFormValue>(EMPTY_VALUE);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const create = useCreateWebsiteMetric({
    toastOnSuccess: true,
    successMessage: 'Draft website metric created.',
    onSuccess: (detail) => setCreatedId(detail.id),
  });

  // Once created, switch straight into the full editor for the new id — no page navigation
  // needed, and the URL stays a little behind (still `/new`) until the caller refreshes; that is
  // an acceptable tradeoff since "Use on website" (the primary creation path) already lands
  // directly on `/[id]/edit` and never goes through this component at all.
  if (createdId) return <EditExisting id={createdId} />;

  const canSubmit = Boolean(value.reportKey) && Boolean(value.measureKey) && Boolean(value.labelEn.trim());

  return (
    <div className="space-y-6">
      <PageHeader
        title="New website metric"
        description="Point at a public-eligible Operational Report measure, then Save to create a draft. Preview and publish become available once the draft exists."
        breadcrumbs={crumbs({ label: 'New' })}
      />
      <Card>
        <CardContent className="space-y-6">
          {catalogue.isLoading ? (
            <FormSkeleton />
          ) : catalogue.isError ? (
            <ErrorState error={catalogue.error} onRetry={() => void catalogue.refetch()} />
          ) : (
            <>
              <WebsiteMetricConfigForm catalogue={catalogue.data ?? []} value={value} onChange={setValue} />
              <div className="flex justify-end">
                <Can permission={WEBSITE_METRICS_PERMS.manageData}>
                  <Button
                    isLoading={create.isPending}
                    disabled={!canSubmit}
                    onClick={() =>
                      create.mutate({
                        reportKey: value.reportKey,
                        measureKey: value.measureKey,
                        filterConfig: value.filterConfig,
                        periodConfig: value.periodConfig,
                        labelEn: value.labelEn,
                        labelHi: value.labelHi,
                        placementKey: value.placementKey,
                        displayOrder: value.displayOrder,
                      })
                    }
                  >
                    Create draft
                  </Button>
                </Can>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Edit existing ──────────────────────────────────────────────────────────────────

function EditExisting({ id }: { id: string }) {
  const detail = useWebsiteMetricDetail(id);
  const catalogue = useOperationalReportsCatalogue();

  const [value, setValue] = useState<WebsiteMetricConfigFormValue | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  // Seed local form state once the detail loads (and re-seed if the id changes).
  useEffect(() => {
    if (detail.data) setValue(detailToFormValue(detail.data));
  }, [detail.data]);

  const update = useUpdateWebsiteMetricConfig({ toastOnSuccess: true, successMessage: 'Changes saved.' });
  const previewMutation = usePreviewWebsiteMetric({
    onSuccess: (result) => {
      if (!value) return;
      setPreview({ result, previewedConfig: stableConfigStringify(value) });
    },
  });

  const hasValidPreview = useMemo(() => {
    if (!preview || !value) return false;
    return preview.previewedConfig === stableConfigStringify(value);
  }, [preview, value]);

  if (detail.isLoading || !value) return <FormSkeleton title="Edit website metric" />;
  if (detail.isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit website metric" breadcrumbs={crumbs({ label: 'Edit' })} />
        <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
      </div>
    );
  }

  const metric = detail.data!;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${metric.label_en}`}
        description={`${metric.report_key} · ${metric.measure_key} — config revision ${metric.config_revision}`}
        breadcrumbs={crumbs({ label: 'Edit' })}
        actions={
          <WebsiteMetricLifecycleActions
            metric={metric}
            previewToken={preview?.result.previewToken ?? null}
            hasValidPreview={hasValidPreview}
            onPublished={() => setPreview(null)}
          />
        }
      />

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <div className="space-y-6">
            <Card>
              <CardHeader title="Configuration" description="Edits bump the config revision, which invalidates any outstanding preview." />
              <CardContent className="space-y-6">
                {catalogue.isLoading ? (
                  <FormSkeleton />
                ) : catalogue.isError ? (
                  <ErrorState error={catalogue.error} onRetry={() => void catalogue.refetch()} />
                ) : (
                  <>
                    <WebsiteMetricConfigForm
                      catalogue={catalogue.data ?? []}
                      value={value}
                      onChange={setValue}
                    />
                    <div className="flex justify-end">
                      <Can permission={WEBSITE_METRICS_PERMS.manageData}>
                        <Button
                          isLoading={update.isPending}
                          onClick={() =>
                            update.mutate({ id: metric.id, body: formValueToUpdatePayload(value) })
                          }
                        >
                          Save changes
                        </Button>
                      </Can>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Can permission={WEBSITE_METRICS_PERMS.manageData}>
              <WebsiteMetricPreviewPanel
                currentValue={value}
                preview={preview}
                isPending={previewMutation.isPending}
                isError={previewMutation.isError}
                error={previewMutation.error}
                onPreview={() => previewMutation.mutate(metric.id)}
              />
            </Can>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <WebsiteMetricHistory metric={metric} />
        </TabsContent>
      </Tabs>

      <p className="text-sm text-muted-foreground">
        <Link href={ROUTES.dashboardWebsiteMetrics} className="text-primary hover:underline">
          ← Back to Website Metrics
        </Link>
      </p>
    </div>
  );
}

function FormSkeleton({ title }: { title?: string }) {
  return (
    <div className="space-y-6">
      {title ? <PageHeader title={title} /> : null}
      <Card>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
