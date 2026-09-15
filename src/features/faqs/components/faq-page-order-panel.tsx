'use client';

/**
 * Page-scoped FAQ ordering. Shown on the FAQ list page instead of the DataTable whenever the
 * "Page" filter is active — `rows` already arrive in that page's own assignment order (the backend
 * switches ordering when `page_key` is present; see faqs.repository.ts `list()`), so this just
 * needs move-up/down buttons that persist via `POST /admin/faqs/pages/:pageKey/reorder`. Same
 * move-up/down convention as `GalleryImageManager` — reordering here never touches any other page's
 * assignments or the central /faqs directory order.
 */

import { ArrowDown, ArrowUp, ListOrdered } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/auth';
import { EmptyState } from '@/components/feedback/empty-state';
import { FAQ_PERMS, useReorderFaqPage } from '../api';
import type { FaqSummary } from '../types';

export function FaqPageOrderPanel({
  pageKey,
  pageLabel,
  rows,
}: {
  pageKey: string;
  pageLabel: string;
  rows: FaqSummary[];
}) {
  const reorder = useReorderFaqPage();

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const a = rows[index];
    const b = rows[target];
    if (!a || !b) return;
    const orderOf = (row: FaqSummary) => row.page_assignments.find((x) => x.page_key === pageKey)?.display_order ?? 0;
    reorder.mutate({
      pageKey,
      body: {
        order: [
          { id: a.id, display_order: orderOf(b) },
          { id: b.id, display_order: orderOf(a) },
        ],
      },
    });
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ListOrdered}
        title={`No FAQs assigned to ${pageLabel}`}
        description="Assign FAQs to this page from each FAQ's edit form."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-center justify-between gap-4 px-4 py-3">
          <span className="min-w-0 truncate text-sm text-foreground">{row.question_en}</span>
          <Can permission={FAQ_PERMS.update}>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move up"
                disabled={index === 0 || reorder.isPending}
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Move down"
                disabled={index === rows.length - 1 || reorder.isPending}
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Can>
        </div>
      ))}
    </div>
  );
}
