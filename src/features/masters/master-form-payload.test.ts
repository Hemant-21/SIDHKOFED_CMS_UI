/**
 * Unit tests — master form payload builders and schemas.
 * Covers the default master form (name_en/name_hi/display_order) and the
 * specialised Financial Year form (label/start_date/end_date). DB-free.
 */
import { describe, it, expect } from 'vitest';
import {
  buildDefaultMasterPayload,
  buildFinancialYearPayload,
  buildCommodityMasterPayload,
  defaultMasterSchema,
  financialYearSchema,
  commodityMasterSchema,
  buildEventTypeMasterPayload,
  eventTypeMasterSchema,
  buildProcurementUpdateTypeMasterPayload,
  procurementUpdateTypeMasterSchema,
  buildDocumentTypeMasterPayload,
  documentTypeMasterSchema,
  emptyDefaultMasterForm,
  emptyFinancialYearForm,
  emptyCommodityMasterForm,
  emptyEventTypeMasterForm,
  emptyProcurementUpdateTypeMasterForm,
  emptyDocumentTypeMasterForm,
  type DefaultMasterValues,
} from './master-form-payload';
import { MASTER_TYPES, findMasterType } from './types';

// ── Default master payload ────────────────────────────────────────────────────

describe('buildDefaultMasterPayload', () => {
  it('passes name_en through', () => {
    expect(buildDefaultMasterPayload({ name_en: 'Training', name_hi: '', display_order: '' }).name_en)
      .toBe('Training');
  });

  it('coerces empty name_hi to null', () => {
    expect(buildDefaultMasterPayload({ name_en: 'X', name_hi: '', display_order: '' }).name_hi).toBeNull();
    expect(buildDefaultMasterPayload({ name_en: 'X', name_hi: '  ', display_order: '' }).name_hi).toBeNull();
  });

  it('passes a non-empty name_hi through', () => {
    expect(buildDefaultMasterPayload({ name_en: 'X', name_hi: 'प्रशिक्षण', display_order: '' }).name_hi)
      .toBe('प्रशिक्षण');
  });

  it('coerces empty display_order to null', () => {
    expect(buildDefaultMasterPayload({ name_en: 'X', name_hi: '', display_order: '' }).display_order).toBeNull();
  });

  it('converts a numeric display_order string to a number', () => {
    expect(buildDefaultMasterPayload({ name_en: 'X', name_hi: '', display_order: '5' }).display_order).toBe(5);
    expect(typeof buildDefaultMasterPayload({ name_en: 'X', name_hi: '', display_order: '5' }).display_order)
      .toBe('number');
  });
});

describe('defaultMasterSchema validation', () => {
  function parse(v: unknown) { return defaultMasterSchema.safeParse(v); }

  it('accepts a minimal valid input', () => {
    expect(parse({ name_en: 'Lac' }).success).toBe(true);
  });

  it('rejects an empty name_en', () => {
    const r = parse({ name_en: '' });
    expect(r.success).toBe(false);
  });

  it('rejects name_en longer than 150 chars', () => {
    expect(parse({ name_en: 'a'.repeat(151) }).success).toBe(false);
  });
});

describe('emptyDefaultMasterForm', () => {
  it('returns a form-ready empty object', () => {
    const empty = emptyDefaultMasterForm();
    expect(empty).toMatchObject<DefaultMasterValues>({ name_en: '', name_hi: '', display_order: '' });
  });
});

// ── Financial Year payload ────────────────────────────────────────────────────

describe('buildFinancialYearPayload', () => {
  it('passes all three fields through unchanged', () => {
    const out = buildFinancialYearPayload({ label: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31' });
    expect(out).toEqual({ label: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31' });
  });
});

describe('financialYearSchema validation', () => {
  function parse(v: unknown) { return financialYearSchema.safeParse(v); }

  it('accepts a valid financial year', () => {
    expect(parse({ label: '2025-2026', start_date: '2025-04-01', end_date: '2026-03-31' }).success).toBe(true);
  });

  it('rejects a label that is not YYYY-YYYY format', () => {
    expect(parse({ label: '2025-26', start_date: '2025-04-01', end_date: '2026-03-31' }).success).toBe(false);
    expect(parse({ label: 'FY2025', start_date: '2025-04-01', end_date: '2026-03-31' }).success).toBe(false);
  });

  it('rejects a missing start_date', () => {
    expect(parse({ label: '2025-2026', start_date: '', end_date: '2026-03-31' }).success).toBe(false);
  });

  it('rejects end_date before start_date', () => {
    const r = parse({ label: '2025-2026', start_date: '2026-04-01', end_date: '2025-03-31' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.flatten().fieldErrors).toHaveProperty('end_date');
    }
  });

  it('accepts equal start and end dates (single-day range)', () => {
    expect(parse({ label: '2025-2026', start_date: '2025-04-01', end_date: '2025-04-01' }).success).toBe(true);
  });
});

describe('emptyFinancialYearForm', () => {
  it('returns empty strings for all fields', () => {
    expect(emptyFinancialYearForm()).toEqual({ label: '', start_date: '', end_date: '' });
  });
});

// ── Commodity payload ──────────────────────────────────────────────────────────

describe('buildCommodityMasterPayload', () => {
  it('passes name_en and category through', () => {
    const out = buildCommodityMasterPayload({
      name_en: 'Lac', name_hi: '', display_order: '',
      description_en: '', description_hi: '', category: 'Minor Forest Produce', icon_media_id: null,
    });
    expect(out.name_en).toBe('Lac');
    expect(out.category).toBe('Minor Forest Produce');
  });

  it('coerces an empty category to null', () => {
    const out = buildCommodityMasterPayload({
      name_en: 'Lac', name_hi: '', display_order: '',
      description_en: '', description_hi: '', category: '', icon_media_id: null,
    });
    expect(out.category).toBeNull();
  });

  it('coerces empty descriptions to null and passes non-empty ones through', () => {
    const empty = buildCommodityMasterPayload({
      name_en: 'Lac', name_hi: '', display_order: '',
      description_en: '', description_hi: '', category: '', icon_media_id: null,
    });
    expect(empty.description_en).toBeNull();
    expect(empty.description_hi).toBeNull();

    const filled = buildCommodityMasterPayload({
      name_en: 'Lac', name_hi: '', display_order: '',
      description_en: 'A resin.', description_hi: 'लाख।', category: '', icon_media_id: null,
    });
    expect(filled.description_en).toBe('A resin.');
    expect(filled.description_hi).toBe('लाख।');
  });

  it('passes icon_media_id through unchanged', () => {
    const out = buildCommodityMasterPayload({
      name_en: 'Lac', name_hi: '', display_order: '',
      description_en: '', description_hi: '', category: '', icon_media_id: 'media-uuid',
    });
    expect(out.icon_media_id).toBe('media-uuid');
  });
});

describe('commodityMasterSchema validation', () => {
  function parse(v: unknown) { return commodityMasterSchema.safeParse(v); }

  it('accepts a minimal valid input', () => {
    expect(parse({ name_en: 'Lac', icon_media_id: null }).success).toBe(true);
  });

  it('rejects an empty name_en', () => {
    expect(parse({ name_en: '', icon_media_id: null }).success).toBe(false);
  });

  it('accepts either allowed category value or an empty string', () => {
    expect(parse({ name_en: 'Lac', category: 'Minor Forest Produce', icon_media_id: null }).success).toBe(true);
    expect(parse({ name_en: 'Ragi', category: 'Agriculture', icon_media_id: null }).success).toBe(true);
    expect(parse({ name_en: 'Lac', category: '', icon_media_id: null }).success).toBe(true);
  });
});

describe('emptyCommodityMasterForm', () => {
  it('returns a form-ready empty object', () => {
    expect(emptyCommodityMasterForm()).toEqual({
      name_en: '', name_hi: '', display_order: '',
      description_en: '', description_hi: '', category: '', icon_media_id: null,
    });
  });
});

describe('eventTypeMasterSchema / buildEventTypeMasterPayload', () => {
  it('requires an event_category_id', () => {
    const result = eventTypeMasterSchema.safeParse({ ...emptyEventTypeMasterForm(), name_en: 'Seminar' });
    expect(result.success).toBe(false);
  });

  it('builds a payload including the category id', () => {
    const out = buildEventTypeMasterPayload({
      name_en: 'Seminar', name_hi: '', display_order: '3', event_category_id: 'cat-1',
    });
    expect(out).toEqual({ name_en: 'Seminar', name_hi: null, display_order: 3, event_category_id: 'cat-1' });
  });
});

describe('procurementUpdateTypeMasterSchema / buildProcurementUpdateTypeMasterPayload', () => {
  it('requires a procurement_update_category_id', () => {
    const result = procurementUpdateTypeMasterSchema.safeParse({
      ...emptyProcurementUpdateTypeMasterForm(), name_en: 'Bonus Rate',
    });
    expect(result.success).toBe(false);
  });

  it('builds a payload including the category id', () => {
    const out = buildProcurementUpdateTypeMasterPayload({
      name_en: 'Bonus Rate', name_hi: '', display_order: '3', procurement_update_category_id: 'cat-1',
    });
    expect(out).toEqual({ name_en: 'Bonus Rate', name_hi: null, display_order: 3, procurement_update_category_id: 'cat-1' });
  });
});

describe('documentTypeMasterSchema / buildDocumentTypeMasterPayload', () => {
  it('requires a parent_id', () => {
    const result = documentTypeMasterSchema.safeParse({ ...emptyDocumentTypeMasterForm(), name_en: 'Notice' });
    expect(result.success).toBe(false);
  });

  it('accepts a valid knowledge_category family selection', () => {
    const result = documentTypeMasterSchema.safeParse({
      name_en: 'Notice', name_hi: '', display_order: '',
      document_family: 'knowledge_category', parent_id: 'kc-1',
    });
    expect(result.success).toBe(true);
  });

  it('builds a payload that sends knowledge_category_id and nulls communication_type_id for the knowledge_category family', () => {
    const out = buildDocumentTypeMasterPayload({
      name_en: 'Notice', name_hi: '', display_order: '3',
      document_family: 'knowledge_category', parent_id: 'kc-1',
    });
    expect(out).toEqual({
      name_en: 'Notice', name_hi: null, display_order: 3,
      knowledge_category_id: 'kc-1', communication_type_id: null,
    });
  });

  it('builds a payload that sends communication_type_id and nulls knowledge_category_id for the communication_type family', () => {
    const out = buildDocumentTypeMasterPayload({
      name_en: 'Circular', name_hi: '', display_order: '',
      document_family: 'communication_type', parent_id: 'ct-1',
    });
    expect(out).toEqual({
      name_en: 'Circular', name_hi: null, display_order: null,
      knowledge_category_id: null, communication_type_id: 'ct-1',
    });
  });
});

describe('emptyDocumentTypeMasterForm', () => {
  it('defaults to the knowledge_category family with an empty parent', () => {
    expect(emptyDocumentTypeMasterForm()).toEqual({
      name_en: '', name_hi: '', display_order: '', document_family: 'knowledge_category', parent_id: '',
    });
  });
});

// ── MASTER_TYPES config contract ──────────────────────────────────────────────

describe('MASTER_TYPES configuration', () => {
  it('has exactly 16 master types', () => {
    expect(MASTER_TYPES).toHaveLength(16);
  });

  it('event-types uses the event-type form variant and filters by category', () => {
    const eventTypes = findMasterType('event-types')!;
    expect(eventTypes.formVariant).toBe('event-type');
    expect(eventTypes.filterKeys).toEqual(['event_category_id']);
  });

  it('procurement-update-types uses the procurement-update-type form variant and filters by category', () => {
    const procurementUpdateTypes = findMasterType('procurement-update-types')!;
    expect(procurementUpdateTypes.formVariant).toBe('procurement-update-type');
    expect(procurementUpdateTypes.filterKeys).toEqual(['procurement_update_category_id']);
  });

  it('document-types uses the document-type form variant and filters by section/parent', () => {
    const documentTypes = findMasterType('document-types')!;
    expect(documentTypes.formVariant).toBe('document-type');
    expect(documentTypes.filterKeys).toEqual(
      expect.arrayContaining(['document_section', 'knowledge_category_id', 'communication_type_id']),
    );
  });

  it('financial-years uses the financial-year form variant and has no display_order', () => {
    const fy = findMasterType('financial-years')!;
    expect(fy.formVariant).toBe('financial-year');
    expect(fy.hasDisplayOrder).toBe(false);
    expect(fy.defaultSort).toBe('label');
  });

  it('commodities uses the commodity form variant', () => {
    const commodities = findMasterType('commodities')!;
    expect(commodities.formVariant).toBe('commodity');
  });

  it('reporting-periods has no display_order and sorts by start_date', () => {
    const rp = findMasterType('reporting-periods')!;
    expect(rp.hasDisplayOrder).toBe(false);
    expect(rp.defaultSort).toBe('start_date');
  });

  it('blocks exposes district_id as a filter key', () => {
    const blocks = findMasterType('blocks')!;
    expect(blocks.filterKeys).toContain('district_id');
  });

  it('districts and blocks are seeded (read-only)', () => {
    expect(findMasterType('districts')?.editMode).toBe('seeded');
    expect(findMasterType('blocks')?.editMode).toBe('seeded');
  });

  it('all other masters are full-edit', () => {
    const seededKeys = new Set(['districts', 'blocks']);
    for (const m of MASTER_TYPES) {
      if (!seededKeys.has(m.key)) {
        expect(m.editMode, `${m.key} should be full`).toBe('full');
      }
    }
  });
});
