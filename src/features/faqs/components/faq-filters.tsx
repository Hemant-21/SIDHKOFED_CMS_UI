'use client';

/**
 * FAQ list filter bar. Exposes exactly the backend's allow-listed admin filters (faqs.query.ts):
 * page_key, publication_state, plus search. All filtering is server-side. Selecting a page also
 * switches the list's ordering to that page's own assignment order (server-side, faqs.repository
 * `list()`), which is what lets `FaqPageOrderPanel` reorder it.
 */

import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { FilterController } from '@/types/crud';
import { useFaqPageOptions } from '../api';

const PUBLICATION_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'archived', label: 'Archived' },
];

export const FAQ_FILTER_KEYS = ['page_key', 'publication_state'];

export function FaqFilters({ filters }: { filters: FilterController }) {
  const f = filters;
  const pages = useFaqPageOptions();
  const pageOptions = (pages.data ?? []).map((p) => ({ value: p.page_key, label: p.label_en }));
  const sel = (key: string) => f.filters[key] ?? '';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput
          value={f.search}
          onValueChange={f.setSearch}
          placeholder="Search questions & answers…"
          className="sm:max-w-xs"
        />
        {f.isActive ? (
          <Button variant="ghost" size="sm" onClick={f.reset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Page"
          id="faq-filter-page"
          value={sel('page_key')}
          onChange={(v) => f.setFilter('page_key', v)}
          options={pageOptions}
        />
        <FilterSelect
          label="State"
          id="faq-filter-state"
          value={sel('publication_state')}
          onChange={(v) => f.setFilter('publication_state', v)}
          options={PUBLICATION_STATES}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  id,
  value,
  onChange,
  options,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string | undefined) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value || undefined)}
        options={[{ value: '', label: 'All' }, ...options]}
      />
    </div>
  );
}
