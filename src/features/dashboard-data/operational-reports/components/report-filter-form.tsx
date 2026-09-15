'use client';

/**
 * Report / period / filter selection form — the one deliberate deviation from the rest of the
 * CMS's list-filter convention (`useFilters`, which applies immediately on every change). The
 * spec for Generate Reports wants a batch "Apply" step: pick a report, a period, and filters, then
 * click Apply once to run the report. This component owns that draft state locally and only calls
 * `onApply` (which the page uses to both trigger the generate query and mirror the selection into
 * the URL for shareability) when the user actually clicks Apply. "Reset" clears local state back
 * to defaults and calls `onReset` so the page can clear the URL/results too.
 */

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, type SelectOption } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMasterOptions } from '@/components/relationships';
import { RelationPicker } from '@/components/relationships/relation-picker';
import { EVENT_STATUS_OPTIONS } from '@/features/events/event-status';
import { useFinancialYearLabelOptions } from '../use-financial-year-label-options';
import type {
  GenerateReportBody,
  OperationalReportDefinition,
  PeriodMode,
} from '../types';

const PERIOD_MODE_LABEL: Record<PeriodMode, string> = {
  fixed_range: 'Fixed date range',
  financial_year: 'A financial year',
  current_financial_year: 'Current financial year',
};

const ALL_PERIOD_MODES: PeriodMode[] = ['fixed_range', 'financial_year', 'current_financial_year'];

/** Non-UUID filter keys are enums, not master-data ids (mirrors the backend's own allow-list). */
const ENUM_FILTER_OPTIONS: Record<string, SelectOption[]> = {
  eventStatus: EVENT_STATUS_OPTIONS,
};

/** Master-data-backed filter keys → the kebab-case master key that resolves them. */
const MASTER_FILTER_KEYS: Record<string, string> = {
  districtId: 'districts',
  blockId: 'blocks',
  eventTypeId: 'event-types',
  commodityId: 'commodities',
  procurementUpdateTypeId: 'procurement-update-types',
};

/** Content-relation filter keys → the admin resource the shared RelationPicker searches. */
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

export interface ReportFilterFormValue {
  reportKey: string;
  body: GenerateReportBody;
}

interface ReportFilterFormProps {
  catalogue: OperationalReportDefinition[];
  /** Called with the applied selection when the user clicks Apply. */
  onApply: (value: ReportFilterFormValue) => void;
  /** Called when the user clicks Reset. */
  onReset: () => void;
  /** Restore a previous selection (e.g. from the URL) on first render. */
  initial?: Partial<{
    reportKey: string;
    periodMode: PeriodMode;
    startDate: string;
    endDate: string;
    financialYearLabel: string;
    filters: Record<string, string[]>;
  }>;
}

export function ReportFilterForm({ catalogue, onApply, onReset, initial }: ReportFilterFormProps) {
  const [reportKey, setReportKey] = useState(initial?.reportKey ?? catalogue[0]?.key ?? '');
  const [periodMode, setPeriodMode] = useState<PeriodMode>(initial?.periodMode ?? 'current_financial_year');
  const [startDate, setStartDate] = useState(initial?.startDate ?? '');
  const [endDate, setEndDate] = useState(initial?.endDate ?? '');
  const [financialYearLabel, setFinancialYearLabel] = useState(initial?.financialYearLabel ?? '');
  const [filters, setFilters] = useState<Record<string, string[]>>(initial?.filters ?? {});

  const financialYears = useFinancialYearLabelOptions();

  const reportDef = useMemo(
    () => catalogue.find((r) => r.key === reportKey),
    [catalogue, reportKey],
  );

  const reportOptions: SelectOption[] = useMemo(
    () => catalogue.map((r) => ({ value: r.key, label: r.titleEn })),
    [catalogue],
  );

  const supportedPeriodModes = useMemo(() => {
    if (!reportDef || reportDef.measures.length === 0) return ALL_PERIOD_MODES;
    const sets = reportDef.measures.map((m) => new Set(m.supportedPeriodModes));
    const intersection = ALL_PERIOD_MODES.filter((mode) => sets.every((s) => s.has(mode)));
    return intersection.length > 0 ? intersection : ALL_PERIOD_MODES;
  }, [reportDef]);

  // Changing the report resets its filters/period-mode validity — a filter/mode from the previous
  // report may not exist on the new one.
  useEffect(() => {
    if (!supportedPeriodModes.includes(periodMode)) {
      setPeriodMode(supportedPeriodModes[0] ?? 'current_financial_year');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey]);

  const filterKeys = reportDef?.supportedFilters ?? [];

  const setFilterValue = (key: string, values: string[]) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (values.length === 0) delete next[key];
      else next[key] = values;
      return next;
    });
  };

  const canApply =
    Boolean(reportKey) &&
    (periodMode !== 'fixed_range' || (Boolean(startDate) && Boolean(endDate))) &&
    (periodMode !== 'financial_year' || Boolean(financialYearLabel));

  const handleApply = () => {
    if (!canApply) return;
    const periodInput =
      periodMode === 'fixed_range'
        ? { mode: periodMode, startDate, endDate }
        : periodMode === 'financial_year'
          ? { mode: periodMode, financialYearLabel }
          : { mode: periodMode };
    // Only send filters the current report actually supports.
    const scopedFilters = Object.fromEntries(
      Object.entries(filters).filter(([key, values]) => filterKeys.includes(key) && values.length > 0),
    );
    onApply({
      reportKey,
      body: { periodInput, filters: scopedFilters, page: 1, pageSize: 50 },
    });
  };

  const handleReset = () => {
    setPeriodMode('current_financial_year');
    setStartDate('');
    setEndDate('');
    setFinancialYearLabel('');
    setFilters({});
    onReset();
  };

  return (
    <Card>
      <CardHeader
        title="Report, period & filters"
        description="Pick a report and period, adjust filters, then Apply to run it."
      />
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="report-key">Report</Label>
            <Select
              id="report-key"
              value={reportKey}
              onChange={(e) => setReportKey(e.target.value)}
              options={reportOptions}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="period-mode">Period</Label>
            <Select
              id="period-mode"
              value={periodMode}
              onChange={(e) => setPeriodMode(e.target.value as PeriodMode)}
              options={supportedPeriodModes.map((mode) => ({ value: mode, label: PERIOD_MODE_LABEL[mode] }))}
            />
          </div>

          {periodMode === 'fixed_range' ? (
            <>
              <div className="space-y-1">
                <Label htmlFor="period-start">Start date</Label>
                <Input
                  id="period-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="period-end">End date</Label>
                <Input
                  id="period-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          ) : null}

          {periodMode === 'financial_year' ? (
            <div className="space-y-1">
              <Label htmlFor="period-fy">Financial year</Label>
              <Select
                id="period-fy"
                value={financialYearLabel}
                onChange={(e) => setFinancialYearLabel(e.target.value)}
                placeholder="Select a financial year"
                options={financialYears.options}
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
                value={filters[key] ?? []}
                onChange={(values) => setFilterValue(key, values)}
              />
            ))}
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleApply} disabled={!canApply}>
            Apply
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterField({
  filterKey,
  value,
  onChange,
}: {
  filterKey: string;
  value: string[];
  onChange: (value: string[]) => void;
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
        />
      ) : masterKey ? (
        <MultiSelect
          options={masterOptions.options}
          value={value}
          onChange={onChange}
          placeholder={`Any ${label.toLowerCase()}`}
        />
      ) : relationResource ? (
        <RelationPicker
          resource={relationResource}
          value={value}
          onChange={onChange}
          multiple
          placeholder={`Any ${label.toLowerCase()}`}
          publicationState="all"
        />
      ) : null}
    </div>
  );
}
