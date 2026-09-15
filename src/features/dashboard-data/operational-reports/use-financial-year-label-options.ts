'use client';

/**
 * Financial-year options keyed by LABEL, not id. Every other picker in the CMS
 * (`useFinancialYearOptions` in `components/relationships/period-pickers.tsx`) selects a
 * financial year by its row id, because the resources it feeds (metrics, datasets) store
 * `financial_year_id`. The Operational Reports `PeriodInput.financialYearLabel` field is
 * different — the backend's own validator (`operational-reports.validators.ts`) takes the human
 * label directly (e.g. `"2025-2026"`), not an id, so this hook maps the same `financial-years`
 * master to `{ value: label, label }` instead of duplicating the whole master-options hook.
 */

import { useQuery } from '@tanstack/react-query';
import { MASTERS } from '@/constants/api-endpoints';
import { getList } from '@/lib/api/http';
import { PAGE_SIZE_MAX } from '@/constants/app';
import type { SelectOption } from '@/components/ui/select';

interface FinancialYearRecord {
  id: string;
  label: string;
  is_active?: boolean;
}

export function useFinancialYearLabelOptions(): { options: SelectOption[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['master', 'financial-years', 'label-options'],
    queryFn: () =>
      getList<FinancialYearRecord>(MASTERS.admin('financial-years'), {
        page_size: PAGE_SIZE_MAX,
        ordering: '-label',
      }),
    staleTime: 5 * 60_000,
  });

  const options: SelectOption[] = (query.data?.items ?? []).map((fy) => ({
    value: fy.label,
    label: fy.label,
    disabled: fy.is_active === false,
  }));

  return { options, isLoading: query.isLoading };
}
