'use client';

/**
 * Summary card grid — one card per measure of the generated report (reuses the bordered-card-grid
 * pattern from `dashboard-data/components/report-preview.tsx`). A `publicEligible` measure gets a
 * "Use on website" action that creates a DRAFT Website Metric config from the current
 * report/measure/filters/period and hands off to Stage 5's (not-yet-built) editor. Ineligible
 * measures never show this action — the backend itself would reject the config anyway
 * (`assertMeasureConfig` in the backend's `website-metrics.validators.ts`), so this is a courtesy,
 * not the enforcement boundary.
 */

import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/auth';
import { useToast } from '@/hooks/use-toast';
import { formatNumber } from '@/utils/format';
import { useCreateWebsiteMetricDraft } from '../api';
import { WEBSITE_METRICS_PERMS } from '../permissions';
import type { GenerateReportBody, MeasureResult, OperationalReportKey, OperationalReportMeasure } from '../types';

interface ReportSummaryCardsProps {
  reportKey: OperationalReportKey;
  body: GenerateReportBody;
  summary: MeasureResult[];
  /**
   * The catalogue's measure DEFINITIONS for this report (not the generate result) — the only
   * place `publicEligible` lives. `MeasureResult` (the generate response) never carries it.
   */
  measureDefinitions: OperationalReportMeasure[];
}

export function ReportSummaryCards({ reportKey, body, summary, measureDefinitions }: ReportSummaryCardsProps) {
  if (summary.length === 0) return null;

  const eligibilityByKey = new Map(measureDefinitions.map((m) => [m.key, m.publicEligible]));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {summary.map((measure) => (
        <MeasureCard
          key={measure.key}
          reportKey={reportKey}
          body={body}
          measure={measure}
          isPublicEligible={eligibilityByKey.get(measure.key) ?? false}
        />
      ))}
    </div>
  );
}

function MeasureCard({
  reportKey,
  body,
  measure,
  isPublicEligible,
}: {
  reportKey: OperationalReportKey;
  body: GenerateReportBody;
  measure: MeasureResult;
  isPublicEligible: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const createDraft = useCreateWebsiteMetricDraft();

  const completeness = measure.completeness;

  const handleUseOnWebsite = () => {
    createDraft.mutate(
      {
        reportKey,
        measureKey: measure.key,
        filterConfig: body.filters ?? {},
        periodConfig: body.periodInput,
        labelEn: measure.labelEn,
        placementKey: 'homepage',
      },
      {
        onSuccess: (record) => {
          toast.success('Draft website metric created.');
          router.push(`/dashboard/website-metrics/${record.id}/edit`);
        },
      },
    );
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{measure.labelEn}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">
        {measure.value != null ? formatNumber(measure.value) : '—'}
        {measure.unit ? <span className="ml-1 text-sm text-muted-foreground">{measure.unit}</span> : null}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{measure.noteEn}</p>
      {completeness ? (
        <div className="mt-2 flex flex-wrap gap-1">
          <Badge tone="muted">{formatNumber(completeness.known)} known</Badge>
          {completeness.missing > 0 ? <Badge tone="warning">{formatNumber(completeness.missing)} missing</Badge> : null}
          {completeness.undated > 0 ? <Badge tone="muted">{formatNumber(completeness.undated)} undated</Badge> : null}
        </div>
      ) : null}
      {isPublicEligible ? (
        <Can permission={WEBSITE_METRICS_PERMS.manageData}>
          <div className="mt-3">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Globe className="h-3.5 w-3.5" />}
              isLoading={createDraft.isPending}
              onClick={handleUseOnWebsite}
            >
              Use on website
            </Button>
          </div>
        </Can>
      ) : null}
    </div>
  );
}
