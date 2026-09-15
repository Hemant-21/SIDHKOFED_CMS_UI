'use client';

/**
 * Document list filter bar. Exposes EXACTLY the backend's allow-listed document filters
 * (documents.query.ts): publication_state, document_type, document_section, knowledge_category,
 * communication_type, commodity, district, financial_year, language, year, date_from, date_to.
 * Filtering is server-side via the shared `useFilters` controller — each control writes an
 * allow-listed query param and re-runs the backend query. No client-side filtering.
 *
 * `document_section` replaces the legacy `knowledge_centre=true` boolean (still accepted by the
 * backend for compatibility, but the CMS now sends the new param exclusively); absent
 * category/type filters broaden to "all docs in section", never the other way — these AND
 * together with `document_section`.
 */

import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { FilterController } from '@/types/crud';
import { useMasterOptions } from '@/components/relationships';
import { useFinancialYearOptions } from '../api';

const PUBLICATION_STATES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'unpublished', label: 'Unpublished' },
  { value: 'archived', label: 'Archived' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

/** The exact backend allow-list for document list filtering (documents.query.ts). */
export const DOCUMENT_FILTER_KEYS = [
  'publication_state',
  'document_type',
  'document_section',
  'knowledge_category',
  'communication_type',
  'commodity',
  'district',
  'financial_year',
  'language',
  'year',
  'date_from',
  'date_to',
];

const DOCUMENT_SECTIONS = [
  { value: 'publications', label: 'Publications' },
  { value: 'notifications', label: 'Notifications' },
];

export function DocumentFilters({ filters }: { filters: FilterController }) {
  const f = filters;
  const documentTypes = useMasterOptions('document-types');
  const knowledgeCategories = useMasterOptions('knowledge-categories');
  const communicationTypes = useMasterOptions('communication-types');
  const commodities = useMasterOptions('commodities');
  const districts = useMasterOptions('districts');
  const financialYears = useFinancialYearOptions();

  const sel = (key: string) => f.filters[key] ?? '';
  const section = sel('document_section');

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput value={f.search} onValueChange={f.setSearch} placeholder="Search documents…" className="sm:max-w-xs" />
        {f.isActive ? (
          <Button variant="ghost" size="sm" onClick={f.reset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <FilterSelect label="State" value={sel('publication_state')} onChange={(v) => f.setFilter('publication_state', v)} options={PUBLICATION_STATES} />
        <FilterSelect label="Type" value={sel('document_type')} onChange={(v) => f.setFilter('document_type', v)} options={documentTypes.options} />
        <FilterSelect
          label="Section"
          value={section}
          onChange={(v) => {
            f.setFilter('document_section', v);
            f.setFilter('knowledge_category', undefined);
            f.setFilter('communication_type', undefined);
          }}
          options={DOCUMENT_SECTIONS}
        />
        {section !== 'notifications' && (
          <FilterSelect label="Knowledge category" value={sel('knowledge_category')} onChange={(v) => f.setFilter('knowledge_category', v)} options={knowledgeCategories.options} />
        )}
        {section === 'notifications' && (
          <FilterSelect label="Communication type" value={sel('communication_type')} onChange={(v) => f.setFilter('communication_type', v)} options={communicationTypes.options} />
        )}
        <FilterSelect label="Commodity" value={sel('commodity')} onChange={(v) => f.setFilter('commodity', v)} options={commodities.options} />
        <FilterSelect label="District" value={sel('district')} onChange={(v) => f.setFilter('district', v)} options={districts.options} />
        <FilterSelect label="Financial year" value={sel('financial_year')} onChange={(v) => f.setFilter('financial_year', v)} options={financialYears.options} />
        <FilterSelect label="Language" value={sel('language')} onChange={(v) => f.setFilter('language', v)} options={LANGUAGES} />
        <div className="space-y-1">
          <Label htmlFor="doc-year-filter">Year</Label>
          <Input
            id="doc-year-filter"
            type="number"
            inputMode="numeric"
            min={1900}
            max={3000}
            placeholder="Any"
            value={sel('year')}
            onChange={(e) => f.setFilter('year', e.target.value || undefined)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="doc-date-from">Published from</Label>
          <Input id="doc-date-from" type="date" value={sel('date_from')} onChange={(e) => f.setFilter('date_from', e.target.value || undefined)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="doc-date-to">Published to</Label>
          <Input id="doc-date-to" type="date" value={sel('date_to')} onChange={(e) => f.setFilter('date_to', e.target.value || undefined)} />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value || undefined)} options={[{ value: '', label: 'All' }, ...options]} />
    </div>
  );
}
