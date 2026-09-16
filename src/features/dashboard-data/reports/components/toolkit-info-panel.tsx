'use client';

/**
 * Toolkit information button + panel — shared across all three reports' main rows and the
 * Programme/District drill-downs. Shows exactly the spec's fixed column set: Item, distribution
 * pattern, default group size, default quantity per individual/group with unit, status. Explicitly
 * labels quantities as catalogue defaults, never a historical actual.
 */
import { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import type { StatusTone } from '@/constants/status';
import type { ToolkitInfo, ToolkitItemStatus } from '../types';
import { TOOLKIT_ITEM_STATUS_LABELS } from '../types';

const STATUS_TONE: Record<ToolkitItemStatus, StatusTone> = {
  distributed: 'success',
  partially_distributed: 'warning',
  not_distributed: 'danger',
  not_recorded: 'default',
};

export function ToolkitInfoButton({ title, toolkit }: { title: string; toolkit: ToolkitInfo }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" leftIcon={<Info className="h-4 w-4" />} onClick={() => setOpen(true)}>
        Toolkit
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Toolkit — ${title}`} size="lg">
        <ToolkitInfoContent toolkit={toolkit} />
      </Dialog>
    </>
  );
}

export function ToolkitInfoContent({ toolkit }: { toolkit: ToolkitInfo }) {
  if (!toolkit.applicable) {
    return <p className="py-4 text-sm text-muted-foreground">N/A — no toolkit is attached to this scope.</p>;
  }
  if (toolkit.items.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Not recorded — no distribution evidence found.</p>;
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Default group size and quantity are catalogue defaults from the toolkit item definition, not historical
        actuals.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pr-3">Item</th>
              <th className="py-1.5 pr-3">Pattern</th>
              <th className="py-1.5 pr-3">Default group size</th>
              <th className="py-1.5 pr-3">Default quantity</th>
              <th className="py-1.5 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {toolkit.items.map((item) => (
              <tr key={item.toolkitItemId} className="border-b border-border/60 last:border-0">
                <td className="py-1.5 pr-3 font-medium text-foreground">{item.itemNameEn}</td>
                <td className="py-1.5 pr-3 capitalize text-muted-foreground">{item.distributionPattern}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">
                  {item.distributionPattern === 'group' ? (item.defaultGroupSize ?? '—') : '—'}
                </td>
                <td className="py-1.5 pr-3 text-muted-foreground">
                  {item.defaultQuantityPerUnit === null ? '—' : `${item.defaultQuantityPerUnit} ${item.unit ?? ''}`.trim()}
                </td>
                <td className="py-1.5 pr-3">
                  <Badge tone={STATUS_TONE[item.status]}>{TOOLKIT_ITEM_STATUS_LABELS[item.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
