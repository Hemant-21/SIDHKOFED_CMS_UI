'use client';

/**
 * Website Metric lifecycle actions — publish/unpublish/archive/restore, mirroring
 * `dashboard-data/components/report-lifecycle-actions.tsx`'s structure. Publish differs from that
 * precedent in one important way: it is disabled unless a VALID, NON-STALE preview exists for the
 * exact config currently on screen (see `hasValidPreview`) — there is no "publish, then find out the
 * token was stale" round trip in this UI, even though the backend would also reject it (409/422).
 */

import { Ban, CheckCircle2, RotateCcw, Archive as ArchiveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/auth';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  usePublishWebsiteMetric,
  useWebsiteMetricLifecycleActions,
} from '../api';
import { WEBSITE_METRICS_PERMS } from '../permissions';
import type { WebsiteMetricDetail } from '../types';

export function WebsiteMetricLifecycleActions({
  metric,
  previewToken,
  hasValidPreview,
  onPublished,
}: {
  metric: WebsiteMetricDetail;
  /** The most recently previewed token, if any (from the preview panel's local state). */
  previewToken: string | null;
  /** False when there is no preview yet, or the form has changed since the last preview. */
  hasValidPreview: boolean;
  onPublished?: () => void;
}) {
  const confirm = useConfirmDialog();
  const toast = useToast();
  const { unpublish, archive, restore } = useWebsiteMetricLifecycleActions({ toastOnSuccess: false });
  const publish = usePublishWebsiteMetric({
    toastOnSuccess: true,
    successMessage: 'Website metric published.',
    onSuccess: () => onPublished?.(),
  });

  const isPublished = Boolean(metric.current_snapshot);
  const subject = 'this website metric';
  const busy = publish.isPending || unpublish.isPending || archive.isPending || restore.isPending;

  const handlePublish = async () => {
    if (!previewToken || !hasValidPreview) {
      toast.error('Run a preview against the current configuration before publishing.');
      return;
    }
    if (await confirm.confirmPublish(subject)) {
      publish.mutate({ id: metric.id, previewToken });
    }
  };

  if (metric.is_archived) {
    return (
      <Can permission={WEBSITE_METRICS_PERMS.restore}>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RotateCcw className="h-4 w-4" />}
          isLoading={restore.isPending}
          disabled={busy}
          onClick={async () => {
            if (await confirm.confirmRestore(subject)) restore.mutate(metric.id);
          }}
        >
          Restore
        </Button>
      </Can>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isPublished ? (
        <Can permission={WEBSITE_METRICS_PERMS.publish}>
          <Button
            size="sm"
            leftIcon={<CheckCircle2 className="h-4 w-4" />}
            isLoading={publish.isPending}
            disabled={busy || !hasValidPreview}
            onClick={handlePublish}
            title={hasValidPreview ? undefined : 'Preview the current configuration first'}
          >
            Publish
          </Button>
        </Can>
      ) : (
        <>
          <Can permission={WEBSITE_METRICS_PERMS.publish}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<CheckCircle2 className="h-4 w-4" />}
              isLoading={publish.isPending}
              disabled={busy || !hasValidPreview}
              onClick={handlePublish}
              title={hasValidPreview ? 'Re-publish with the latest preview' : 'Preview the current configuration first'}
            >
              Re-publish
            </Button>
          </Can>
          <Can permission={WEBSITE_METRICS_PERMS.unpublish}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Ban className="h-4 w-4" />}
              isLoading={unpublish.isPending}
              disabled={busy}
              onClick={async () => {
                if (await confirm.confirmUnpublish(subject)) unpublish.mutate(metric.id);
              }}
            >
              Unpublish
            </Button>
          </Can>
        </>
      )}

      <Can permission={WEBSITE_METRICS_PERMS.archive}>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArchiveIcon className="h-4 w-4" />}
          isLoading={archive.isPending}
          disabled={busy}
          onClick={async () => {
            if (await confirm.confirmArchive(subject)) archive.mutate(metric.id);
          }}
        >
          Archive
        </Button>
      </Can>
    </div>
  );
}
