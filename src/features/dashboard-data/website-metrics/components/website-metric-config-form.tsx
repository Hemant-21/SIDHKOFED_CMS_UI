'use client';

/**
 * Website Metric configuration form — report + measure picker (PUBLIC-ELIGIBLE measures only),
 * filter/period inputs scoped to the selected measure's `supportedFilters`/`supportedPeriodModes`,
 * bilingual labels, placement, and display order. A controlled component: the editor page owns the
 * value and decides when to save/create/preview against it.
 *
 * The report/measure picker and filter-field mapping mirror
 * `operational-reports/components/report-filter-form.tsx` (Stage 4) exactly — same master/relation/
 * enum filter-key maps — but this form differs in two ways that matter: (1) reports/measures with NO
 * public-eligible measure are dropped from the picker entirely (a Website Metric may only ever point
 * at one), and (2) it is not an Apply/Reset batch form — every change is reflected in `value`
 * immediately, since the editor's own Save/Preview buttons are the explicit action here.
 */

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMasterOptions } from '@/components/relationships';
import { RelationPicker } from '@/components/relationships/relation-picker';
import { EVENT_STATUS_OPTIONS } from '@/features/events/event-status';
import { BilingualTabs } from '@/components/form/bilingual-tabs';
import { Textarea } from '@/components/ui/textarea';
import { useFinancialYearLabelOptions } from '../../operational-reports/use-financial-year-label-options';
import { WEBSITE_METRIC_PLACEMENTS, type WebsiteMetricConfigFormValue, type PeriodMode } from '../types';
import type { OperationalReportDefinition, OperationalReportMeasure } from '../../operational-reports/types';

const PERIOD_MODE_LABEL: Record<PeriodMode, string> = {
  fixed_range: 'Fixed date range',
  financial_year: 'A financial year',
  current_financial_year: 'Current financial year',
};

/** Same allow-lists as `report-filter-form.tsx` — kept in sync manually since neither module
 * exports them (both mirror the backend's own filter-key allow-list, which is the real source of
 * truth; see that file's header). */
const ENUM_FILTER_OPTIONS: Record<string, SelectOption[]> = {
  eventStatus: EVENT_STATUS_OPTIONS,
};
const MASTER_FILTER_KEYS: Record<string, string> = {
  districtId: 'districts',
  blockId: 'blocks',
  eventTypeId: 'event-types',
  commodityId: 'commodities',
  procurementUpdateTypeId: 'procurement-update-types',
};
const RELATION_FILTER_KEYS: Record<string, string> = {
  programmeSchemeId: 'programmes',
  toolkitId: 'toolkits',
};
const FILTER_LABEL: Record<string, string> = {
  districtId: 'District',
  blockId: 'Block',
  eventTypeId: 'Event type',
  eventStatus: 'Event status',
  programmeSchemeId: 'Programme / scheme',
  toolkitId: 'Toolkit',
  commodityId: 'Commodity',
  procurementUpdateTypeId: 'Procurement update type',
};

const PLACEMENT_OPTIONS: SelectOption[] = WEBSITE_METRIC_PLACEMENTS.map((key) => ({
  value: key,
  label: key === 'homepage' ? 'Homepage' : 'About Us',
}));

export interface WebsiteMetricConfigFormProps {
  catalogue: OperationalReportDefinition[];
  value: WebsiteMetricConfigFormValue;
  onChange: (value: WebsiteMetricConfigFormValue) => void;
  /** Disable report/measure/filter/period edits (not label/placement/order) — used once a metric
   * has a published snapshot, to discourage silently redefining what a live public figure means
   * without going through unpublish first. Purely a UI nudge; the backend does not require this. */
  lockConfig?: boolean;
}

export function WebsiteMetricConfigForm({ catalogue, value, onChange, lockConfig }: WebsiteMetricConfigFormProps) {
  const financialYears = useFinancialYearLabelOptions();

  // Only reports/measures that have at least one public-eligible measure are offered — a metric
  // may never point at a non-public-eligible measure (`assertMeasureConfig` rejects it server-side).
  const eligibleCatalogue = useMemo(
    () =>
      catalogue
        .map((r) => ({ ...r, measures: r.measures.filter((m) => m.publicEligible) }))
        .filter((r) => r.measures.length > 0),
    [catalogue],
  );

  const reportDef = useMemo(
    () => eligibleCatalogue.find((r) => r.key === value.reportKey),
    [eligibleCatalogue, value.reportKey],
  );
  const measureDef: OperationalReportMeasure | undefined = useMemo(
    () => reportDef?.measures.find((m) => m.key === value.measureKey),
    [reportDef, value.measureKey],
  );

  const reportOptions: SelectOption[] = eligibleCatalogue.map((r) => ({ value: r.key, label: r.titleEn }));
  const measureOptions: SelectOption[] = (reportDef?.measures ?? []).map((m) => ({
    value: m.key,
    label: m.labelEn,
  }));
  const periodModeOptions: SelectOption[] = (measureDef?.supportedPeriodModes ?? []).map((mode) => ({
    value: mode,
    label: PERIOD_MODE_LABEL[mode],
  }));
  const filterKeys = measureDef?.supportedFilters ?? [];

  const handleReportChange = (reportKey: string) => {
    const nextReport = eligibleCatalogue.find((r) => r.key === reportKey);
    const nextMeasure = nextReport?.measures[0];
    onChange({
      ...value,
      reportKey,
      measureKey: nextMeasure?.key ?? '',
      filterConfig: {},
      periodConfig: nextMeasure?.supportedPeriodModes.includes('current_financial_year')
        ? { mode: 'current_financial_year' }
        : { mode: nextMeasure?.supportedPeriodModes[0] ?? 'current_financial_year' },
    });
  };

  const handleMeasureChange = (measureKey: string) => {
    const nextMeasure = reportDef?.measures.find((m) => m.key === measureKey);
    onChange({
      ...value,
      measureKey,
      filterConfig: {},
      periodConfig: nextMeasure?.supportedPeriodModes.includes(value.periodConfig.mode)
        ? value.periodConfig
        : { mode: nextMeasure?.supportedPeriodModes[0] ?? 'current_financial_year' },
    });
  };

  const setFilterValue = (key: string, values: string[]) => {
    const next = { ...value.filterConfig };
    if (values.length === 0) delete next[key];
    else next[key] = values;
    onChange({ ...value, filterConfig: next });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="wm-report">Report</Label>
          <Select
            id="wm-report"
            value={value.reportKey}
            onChange={(e) => handleReportChange(e.target.value)}
            options={reportOptions}
            placeholder="Select a report"
            disabled={lockConfig}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="wm-measure">Measure</Label>
          <Select
            id="wm-measure"
            value={value.measureKey}
            onChange={(e) => handleMeasureChange(e.target.value)}
            options={measureOptions}
            placeholder="Select a measure"
            disabled={lockConfig || !value.reportKey}
          />
        </div>
      </div>

      {measureDef ? <p className="text-sm text-muted-foreground">{measureDef.noteEn}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="wm-period-mode">Period</Label>
          <Select
            id="wm-period-mode"
            value={value.periodConfig.mode}
            onChange={(e) =>
              onChange({ ...value, periodConfig: { mode: e.target.value as PeriodMode } })
            }
            options={periodModeOptions}
            disabled={lockConfig || !measureDef}
          />
        </div>
        {value.periodConfig.mode === 'fixed_range' ? (
          <>
            <div className="space-y-1">
              <Label htmlFor="wm-period-start">Start date</Label>
              <Input
                id="wm-period-start"
                type="date"
                value={value.periodConfig.startDate ?? ''}
                onChange={(e) =>
                  onChange({
                    ...value,
                    periodConfig: { ...value.periodConfig, startDate: e.target.value },
                  })
                }
                disabled={lockConfig}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wm-period-end">End date</Label>
              <Input
                id="wm-period-end"
                type="date"
                value={value.periodConfig.endDate ?? ''}
                onChange={(e) =>
                  onChange({ ...value, periodConfig: { ...value.periodConfig, endDate: e.target.value } })
                }
                disabled={lockConfig}
              />
            </div>
          </>
        ) : null}
        {value.periodConfig.mode === 'financial_year' ? (
          <div className="space-y-1">
            <Label htmlFor="wm-period-fy">Financial year</Label>
            <Select
              id="wm-period-fy"
              value={value.periodConfig.financialYearLabel ?? ''}
              onChange={(e) =>
                onChange({
                  ...value,
                  periodConfig: { ...value.periodConfig, financialYearLabel: e.target.value },
                })
              }
              options={financialYears.options}
              placeholder="Select a financial year"
              disabled={lockConfig}
            />
          </div>
        ) : null}
      </div>

      {filterKeys.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filterKeys.map((key) => (
            <FilterField
              key={key}
              filterKey={key}
              value={value.filterConfig[key] ?? []}
              onChange={(values) => setFilterValue(key, values)}
              disabled={lockConfig}
            />
          ))}
        </div>
      ) : null}

      <BilingualTabs
        english={
          <div className="space-y-1">
            <Label htmlFor="wm-label-en">Label (English)</Label>
            <Textarea
              id="wm-label-en"
              rows={2}
              value={value.labelEn}
              onChange={(e) => onChange({ ...value, labelEn: e.target.value })}
              placeholder="e.g. Training sessions conducted this year"
            />
          </div>
        }
        hindi={
          <div className="space-y-1">
            <Label htmlFor="wm-label-hi">Label (Hindi)</Label>
            <Textarea
              id="wm-label-hi"
              rows={2}
              value={value.labelHi ?? ''}
              onChange={(e) => onChange({ ...value, labelHi: e.target.value || null })}
            />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="wm-placement">Placement</Label>
          <Select
            id="wm-placement"
            value={value.placementKey}
            onChange={(e) => onChange({ ...value, placementKey: e.target.value as typeof value.placementKey })}
            options={PLACEMENT_OPTIONS}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="wm-display-order">Display order</Label>
          <Input
            id="wm-display-order"
            type="number"
            min={0}
            value={value.displayOrder}
            onChange={(e) => onChange({ ...value, displayOrder: Number(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}

function FilterField({
  filterKey,
  value,
  onChange,
  disabled,
}: {
  filterKey: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const label = FILTER_LABEL[filterKey] ?? filterKey;
  const enumOptions = ENUM_FILTER_OPTIONS[filterKey];
  const masterKey = MASTER_FILTER_KEYS[filterKey];
  const relationResource = RELATION_FILTER_KEYS[filterKey];
  const masterOptions = useMasterOptions(masterKey ?? '__none__', { enabled: Boolean(masterKey) });

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {enumOptions ? (
        <MultiSelect
          options={enumOptions}
          value={value}
          onChange={onChange}
          placeholder={`Any ${label.toLowerCase()}`}
          disabled={disabled}
        />
      ) : masterKey ? (
        <MultiSelect
          options={masterOptions.options}
          value={value}
          onChange={onChange}
          placeholder={`Any ${label.toLowerCase()}`}
          disabled={disabled}
        />
      ) : relationResource ? (
        <RelationPicker
          resource={relationResource}
          value={value}
          onChange={onChange}
          multiple
          placeholder={`Any ${label.toLowerCase()}`}
          publicationState="all"
          disabled={disabled}
        />
      ) : null}
    </div>
  );
}
