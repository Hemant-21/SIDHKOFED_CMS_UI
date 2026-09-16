'use client';

/**
 * Filters panel for one report tab — each report's own multiselect filters, dependent block
 * options (only blocks within selected districts), and explicit Apply/Reset. The financial year
 * itself is a page-level shared selector (see `reports-page.tsx`), not owned by this component;
 * `financialYearId` is threaded through only so Apply can attach it to the outgoing filter set.
 */
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FilterOptions, ReportFilterInput, ReportKey } from '../types';

export interface ReportFiltersPanelProps {
  reportKey: ReportKey;
  options: FilterOptions;
  financialYearId: string;
  onApply: (filters: ReportFilterInput) => void;
  onReset: () => void;
  isPending?: boolean;
}

interface DraftState {
  programmeIds: string[];
  districtIds: string[];
  blockIds: string[];
  eventTypeIds: string[];
  commodityIds: string[];
  includeUnassignedProgramme: boolean;
}

const EMPTY_DRAFT: DraftState = {
  programmeIds: [],
  districtIds: [],
  blockIds: [],
  eventTypeIds: [],
  commodityIds: [],
  includeUnassignedProgramme: false,
};

export function ReportFiltersPanel({
  reportKey,
  options,
  financialYearId,
  onApply,
  onReset,
  isPending,
}: ReportFiltersPanelProps) {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);

  const districtOptions = useMemo(
    () => options.districts.map((d) => ({ label: d.nameEn, value: d.id })),
    [options.districts],
  );
  const blockOptions = useMemo(() => {
    const scoped =
      draft.districtIds.length > 0
        ? options.blocks.filter((b) => draft.districtIds.includes(b.districtId))
        : options.blocks;
    return scoped.map((b) => ({ label: b.nameEn, value: b.id }));
  }, [options.blocks, draft.districtIds]);
  const eventTypeOptions = useMemo(
    () => options.eventTypes.map((t) => ({ label: t.nameEn, value: t.id })),
    [options.eventTypes],
  );
  const programmeOptions = useMemo(
    () => options.programmes.map((p) => ({ label: p.nameEn, value: p.id })),
    [options.programmes],
  );
  const commodityOptions = useMemo(
    () => options.commodities.map((c) => ({ label: c.nameEn, value: c.id })),
    [options.commodities],
  );

  const setDistricts = (districtIds: string[]) =>
    setDraft((d) => ({
      ...d,
      districtIds,
      blockIds: d.blockIds.filter((id) => options.blocks.some((b) => b.id === id && districtIds.includes(b.districtId))),
    }));

  const handleApply = () => {
    onApply({
      financialYearId,
      programmeIds: draft.programmeIds,
      districtIds: draft.districtIds,
      blockIds: draft.blockIds,
      eventTypeIds: draft.eventTypeIds,
      commodityIds: draft.commodityIds,
      includeUnassignedProgramme: draft.includeUnassignedProgramme,
    });
  };

  const handleReset = () => {
    setDraft(EMPTY_DRAFT);
    onReset();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportKey === 'programme_report' ? (
          <div className="space-y-1.5">
            <Label>Programme</Label>
            <MultiSelect options={programmeOptions} value={draft.programmeIds} onChange={(v) => setDraft((d) => ({ ...d, programmeIds: v }))} placeholder="All programmes" />
          </div>
        ) : null}

        {reportKey === 'commodity_report' ? (
          <div className="space-y-1.5">
            <Label>Commodity</Label>
            <MultiSelect options={commodityOptions} value={draft.commodityIds} onChange={(v) => setDraft((d) => ({ ...d, commodityIds: v }))} placeholder="All commodities" />
          </div>
        ) : null}

        {reportKey === 'district_activity_coverage' ? (
          <div className="space-y-1.5">
            <Label>Programme</Label>
            <MultiSelect options={programmeOptions} value={draft.programmeIds} onChange={(v) => setDraft((d) => ({ ...d, programmeIds: v }))} placeholder="All programmes" />
            <label className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={draft.includeUnassignedProgramme}
                onChange={(e) => setDraft((d) => ({ ...d, includeUnassignedProgramme: e.target.checked }))}
              />
              Include &quot;Programme not assigned&quot;
            </label>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label>District</Label>
          <MultiSelect options={districtOptions} value={draft.districtIds} onChange={setDistricts} placeholder="All districts" />
        </div>

        <div className="space-y-1.5">
          <Label>Block</Label>
          <MultiSelect options={blockOptions} value={draft.blockIds} onChange={(v) => setDraft((d) => ({ ...d, blockIds: v }))} placeholder="All blocks" />
        </div>

        <div className="space-y-1.5">
          <Label>Event type</Label>
          <MultiSelect options={eventTypeOptions} value={draft.eventTypeIds} onChange={(v) => setDraft((d) => ({ ...d, eventTypeIds: v }))} placeholder="All event types" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleApply} isLoading={isPending}>
          Apply
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
