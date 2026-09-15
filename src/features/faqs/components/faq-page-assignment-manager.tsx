'use client';

/**
 * Which main pages this FAQ is assigned to. Picking pages is all this control does — the
 * meaningful per-page ORDER (this FAQ's position among every other FAQ on that page) can't be set
 * here without knowing every other FAQ's position too, so a newly-added page starts at the end
 * (`display_order: 0` is a safe placeholder the reorder view immediately supersedes) and existing
 * assignments keep the order they loaded with. Actual reordering happens on the FAQ list page: pick
 * a "Page" filter there to see `FaqPageOrderPanel`, which reorders across ALL FAQs on that one page
 * (see `faq-list-page.tsx`) — the same move-up/down convention as `GalleryImageManager`.
 */

import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import type { SelectOption } from '@/components/ui/select';
import { useFaqPageOptions } from '../api';
import type { FaqPageAssignment } from '../types';

export function FaqPageAssignmentManager({
  value,
  onChange,
}: {
  value: FaqPageAssignment[];
  onChange: (next: FaqPageAssignment[]) => void;
}) {
  const pages = useFaqPageOptions();
  const options: SelectOption[] = (pages.data ?? []).map((p) => ({ value: p.page_key, label: p.label_en }));

  const selectedKeys = value.map((a) => a.page_key);

  const onSelectionChange = (keys: string[]) => {
    const byKey = new Map(value.map((a) => [a.page_key, a]));
    onChange(keys.map((page_key) => byKey.get(page_key) ?? { page_key, display_order: 0 }));
  };

  return (
    <div className="space-y-1">
      <Label htmlFor="faq-pages">Main pages</Label>
      <MultiSelect
        value={selectedKeys}
        onChange={onSelectionChange}
        options={options}
        placeholder="Not assigned to any main page"
        disabled={pages.isLoading}
      />
      <p className="text-xs text-muted-foreground">
        Unassigned FAQs still appear in the central /faqs directory. To set this FAQ&apos;s position
        relative to other FAQs on a page, filter the FAQ list by that page after saving.
      </p>
    </div>
  );
}
