'use client';

/**
 * FY snapshot publication panel — Generate preview -> Review -> Approve & publish, for the three
 * reports together. Shown once per FY selection (not per tab) since a publication always covers
 * all three reports at once. Publication always covers the FULL FY dataset — this panel never
 * reads or sends the CMS's temporary tab filters.
 */
import { useState } from 'react';
import { CheckCircle2, Clock, History, Rocket, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Can } from '@/components/auth';
import { SkeletonText } from '@/components/feedback/skeleton';
import {
  usePublicationStatus,
  usePublicationHistory,
  useGeneratePublicationPreview,
  useApprovePublication,
  type PublicationPreview,
} from '../publications-api';
import { REPORT_PUBLICATIONS_PERMS } from '../permissions';

function formatIst(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) + ' IST';
}

export function PublicationPanel({
  financialYearId,
  financialYearLabel,
  isAllYearsAggregate,
}: {
  financialYearId: string;
  financialYearLabel: string;
  isAllYearsAggregate?: boolean;
}) {
  const status = usePublicationStatus(financialYearId);
  const history = usePublicationHistory(financialYearId);
  const generatePreview = useGeneratePublicationPreview(financialYearId);
  const approve = useApprovePublication(financialYearId);
  const [preview, setPreview] = useState<PublicationPreview | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const handleGeneratePreview = () => {
    generatePreview.mutate(undefined, {
      onSuccess: (data) => {
        setPreview(data);
        setReviewOpen(true);
      },
    });
  };

  const handleApprove = () => {
    if (!preview) return;
    approve.mutate(preview.previewToken, {
      onSuccess: () => {
        setReviewOpen(false);
        setPreview(null);
      },
    });
  };

  return (
    <Can permission={REPORT_PUBLICATIONS_PERMS.view} fallback={null}>
      <Card>
        <CardHeader
          title="Publication"
          description={
            isAllYearsAggregate
              ? `${financialYearLabel} — publishes all three reports, aggregated across every financial year, together for the public website.`
              : `FY ${financialYearLabel} — publishes all three reports together for the public website.`
          }
          actions={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" leftIcon={<History className="h-4 w-4" />} onClick={() => setHistoryOpen(true)}>
                History
              </Button>
              <Can permission={REPORT_PUBLICATIONS_PERMS.publish}>
                <Button size="sm" leftIcon={<Rocket className="h-4 w-4" />} isLoading={generatePreview.isPending} onClick={handleGeneratePreview}>
                  Generate publication preview
                </Button>
              </Can>
            </div>
          }
        />
        <CardContent>
          {status.isLoading ? (
            <SkeletonText lines={2} />
          ) : status.data?.published ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
              <span className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="h-4 w-4" /> Published
              </span>
              <span className="text-muted-foreground">Last published: {formatIst(status.data.lastPublished!.publishedAt)}</span>
              <span className="text-muted-foreground">Published by: {status.data.lastPublished!.publishedByName}</span>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Not published yet
            </span>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review publication preview"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Can permission={REPORT_PUBLICATIONS_PERMS.publish}>
              <Button leftIcon={<Rocket className="h-4 w-4" />} isLoading={approve.isPending} onClick={handleApprove}>
                Approve &amp; publish
              </Button>
            </Can>
          </>
        }
      >
        {preview ? (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {isAllYearsAggregate
                ? `All financial years combined, no filters applied`
                : `Full FY ${financialYearLabel} (${preview.fyStartDate} to ${preview.fyEndDate}), no filters applied`}
              {' '}— this is exactly what will be published. Generated {formatIst(preview.generatedAt)}.
            </p>
            <ul className="space-y-1">
              <li>Programme report: <strong>{preview.programmeReport.rows.length}</strong> programme(s)</li>
              <li>District Activity Coverage: <strong>{preview.districtReport.rows.length}</strong> district(s)</li>
              <li>Commodity-wise report: <strong>{preview.commodityReport.rows.length}</strong> commodit(y/ies)</li>
            </ul>
            <div className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3 text-warning-foreground">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Approving publishes exactly this reviewed data. If source records change before you approve, generate a new
                preview — approval never silently recalculates.
              </p>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} title={`Publication history — FY ${financialYearLabel}`} size="md">
        {history.isLoading ? (
          <SkeletonText lines={3} />
        ) : !history.data || history.data.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">No publications yet for this financial year.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {history.data.map((h, i) => (
              <li key={h.id} className="flex items-center justify-between border-b border-border/60 py-1.5 last:border-0">
                <span>{formatIst(h.publishedAt)} — {h.publishedByName}</span>
                {i === 0 ? <Badge tone="success">Current</Badge> : null}
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </Can>
  );
}
