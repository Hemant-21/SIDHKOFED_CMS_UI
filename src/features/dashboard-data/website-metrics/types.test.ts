import { describe, it, expect } from 'vitest';
import {
  detailToFormValue,
  formValueToUpdatePayload,
  stableConfigStringify,
  type WebsiteMetricDetail,
} from './types';

const baseDetail = (): WebsiteMetricDetail => ({
  id: 'm1',
  metric_key: 'homepage-trainings',
  report_key: 'training_attendance',
  measure_key: 'sessions_conducted',
  calculation_version: 1,
  filter_config: { districtId: ['d1'] },
  period_config: { mode: 'current_financial_year' },
  label_en: 'Training sessions',
  label_hi: null,
  placement_key: 'homepage',
  display_order: 0,
  is_enabled: true,
  is_archived: false,
  config_revision: 1,
  current_snapshot: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
});

describe('detailToFormValue / formValueToUpdatePayload round trip', () => {
  it('maps the snake_case detail into the camelCase form value the editor edits', () => {
    const value = detailToFormValue(baseDetail());
    expect(value).toEqual({
      reportKey: 'training_attendance',
      measureKey: 'sessions_conducted',
      filterConfig: { districtId: ['d1'] },
      periodConfig: { mode: 'current_financial_year' },
      labelEn: 'Training sessions',
      labelHi: null,
      placementKey: 'homepage',
      displayOrder: 0,
    });
  });

  it('maps the form value back into a camelCase PATCH body', () => {
    const value = detailToFormValue(baseDetail());
    const payload = formValueToUpdatePayload(value);
    expect(payload).toEqual({
      reportKey: 'training_attendance',
      measureKey: 'sessions_conducted',
      filterConfig: { districtId: ['d1'] },
      periodConfig: { mode: 'current_financial_year' },
      labelEn: 'Training sessions',
      labelHi: null,
      placementKey: 'homepage',
      displayOrder: 0,
    });
  });
});

describe('stableConfigStringify', () => {
  const config = {
    reportKey: 'training_attendance',
    measureKey: 'sessions_conducted',
    filterConfig: { districtId: ['d1'], blockId: ['b1'] },
    periodConfig: { mode: 'current_financial_year' as const },
  };

  it('is stable regardless of key order — same config compares equal', () => {
    const reordered = {
      periodConfig: config.periodConfig,
      filterConfig: { blockId: ['b1'], districtId: ['d1'] },
      measureKey: config.measureKey,
      reportKey: config.reportKey,
    };
    expect(stableConfigStringify(config)).toBe(stableConfigStringify(reordered));
  });

  it('changes when the config actually changes — drives the "re-preview" staleness check', () => {
    const changed = { ...config, filterConfig: { districtId: ['d2'] } };
    expect(stableConfigStringify(config)).not.toBe(stableConfigStringify(changed));
  });

  it('ignores non-config fields like label/placement/displayOrder (label-only edits never bump configRevision server-side)', () => {
    // stableConfigStringify only ever receives the 4 config fields — verifying the function
    // itself does not accidentally read anything else off a superset object.
    const withExtras = { ...config, labelEn: 'Something else', displayOrder: 99 } as typeof config & {
      labelEn: string;
      displayOrder: number;
    };
    expect(stableConfigStringify(withExtras)).toBe(stableConfigStringify(config));
  });
});
