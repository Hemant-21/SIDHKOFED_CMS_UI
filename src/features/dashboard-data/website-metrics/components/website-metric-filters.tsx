'use client';

/**
 * Website Metrics list filter bar. Exposes exactly the backend's allow-listed list filters
 * (`website-metrics.controller.ts`'s `parseFilters`): `placement`, `enabled`, `archived`. Server-side
 * only, via the shared `useFilters` controller — mirrors `dashboard-data/components/report-filters.tsx`.
 */

import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { FilterController } from '@/types/crud';
import { WEBSITE_METRIC_PLACEMENTS } from '../types';

export const WEBSITE_METRIC_FILTER_KEYS = ['placement', 'enabled', 'archived'];

const PLACEMENT_OPTIONS = WEBSITE_METRIC_PLACEMENTS.map((key) => ({
  value: key,
  label: key === 'homepage' ? 'Homepage' : 'About Us',
}));

const BOOL_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export function WebsiteMetricFilters({ filters }: { filters: FilterController }) {
  const f = filters;
  const sel = (key: string) => f.filters[key] ?? '';

  return (
    <div className="space-y-3">
      {f.isActive ? (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={f.reset}>
            Clear filters
          </Button>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <FilterSelect
          label="Placement"
          id="wm-filter-placement"
          value={sel('placement')}
          onChange={(v) => f.setFilter('placement', v)}
          options={PLACEMENT_OPTIONS}
        />
        <FilterSelect
          label="Enabled"
          id="wm-filter-enabled"
          value={sel('enabled')}
          onChange={(v) => f.setFilter('enabled', v)}
          options={BOOL_OPTIONS}
        />
        <FilterSelect
          label="Archived"
          id="wm-filter-archived"
          value={sel('archived')}
          onChange={(v) => f.setFilter('archived', v)}
          options={BOOL_OPTIONS}
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
