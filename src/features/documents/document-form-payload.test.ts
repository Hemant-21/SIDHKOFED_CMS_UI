import { describe, expect, it } from 'vitest';
import { buildDocumentPayload, documentToForm, emptyDocumentForm, type DocumentFormValues } from './document-form-payload';
import type { DocumentDetail } from './types';

function values(overrides: Partial<DocumentFormValues> = {}): DocumentFormValues {
  return { ...emptyDocumentForm(), title_en: 'Doc', document_type_id: 'dt1', file_asset_id: 'fa1', ...overrides };
}

describe('buildDocumentPayload', () => {
  it('trims the title and nulls empty editorial fields', () => {
    const p = buildDocumentPayload(values({ title_en: '  Annual Report  ', description_en: '' }));
    expect(p.title_en).toBe('Annual Report');
    expect(p.description_en).toBeNull();
  });

  it('widens publication_date to an ISO timestamp', () => {
    expect(buildDocumentPayload(values({ publication_date: '2026-05-01' })).publication_date).toBe('2026-05-01');
    expect(buildDocumentPayload(values({ publication_date: '' })).publication_date).toBeNull();
  });

  it('never sends the deprecated knowledge_category_id/show_in_knowledge_centre write fields (document_type_id is the sole classification input)', () => {
    const p = buildDocumentPayload(values()) as Record<string, unknown>;
    expect(p.knowledge_category_id).toBeUndefined();
    expect(p.show_in_knowledge_centre).toBeUndefined();
  });

  it('drops the highlight window without a highlight', () => {
    const p = buildDocumentPayload(values({ highlight_type: '', highlight_start_at: '2026-01-01' }));
    expect(p.highlight_type).toBeNull();
    expect(p.highlight_start_at).toBeNull();
  });

  it('never sends programme_ids/institution_ids/tag_ids (backend does not accept them)', () => {
    const p = buildDocumentPayload(values()) as Record<string, unknown>;
    expect(p.programme_ids).toBeUndefined();
    expect(p.institution_ids).toBeUndefined();
    expect(p.tag_ids).toBeUndefined();
  });

  it('coerces display_order to a number or null', () => {
    expect(buildDocumentPayload(values({ display_order: '3' })).display_order).toBe(3);
    expect(buildDocumentPayload(values({ display_order: '' })).display_order).toBeNull();
  });
});

describe('documentToForm', () => {
  it('hydrates editable fields and relation id arrays', () => {
    const detail = {
      title_en: 'D',
      title_hi: null,
      description_en: 'x',
      description_hi: null,
      document_type: { id: 'dt1', slug: 'report', name_en: 'Report', name_hi: null },
      knowledge_category: { id: 'kc1', slug: 'reports', name_en: 'Reports', name_hi: null },
      financial_year: { id: 'fy1', label: 'FY 2025-26' },
      language: 'hi',
      publication_date: '2026-05-01T00:00:00.000Z',
      is_public: true,
      show_in_knowledge_centre: true,
      file: { id: 'fa1', file_name: 'r.pdf', file_url: 'u', mime_type: 'application/pdf', file_size: 10, title: null },
      commodities: [{ id: 'c1', slug: 'lac', name_en: 'Lac', name_hi: null }],
      districts: [{ id: 'd1', slug: 'gumla', name_en: 'Gumla', name_hi: null }],
      highlight_type: null,
      highlight_start_at: null,
      highlight_end_at: null,
      display_order: 2,
      publish_start_at: null,
      public_visibility: true,
      show_on_homepage: false,
    } as unknown as DocumentDetail;
    const f = documentToForm(detail);
    expect(f.file_asset_id).toBe('fa1');
    expect(f.language).toBe('hi');
    expect(f.publication_date).toBe('2026-05-01');
    expect(f.commodity_ids).toEqual(['c1']);
    expect(f.display_order).toBe('2');
  });
});
