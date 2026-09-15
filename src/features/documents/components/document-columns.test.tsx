import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { documentColumns } from './document-columns';
import type { DocumentSummary } from '../types';

const row: DocumentSummary = {
  id: 'd1',
  slug: 'annual-report',
  title_en: 'Annual Report',
  title_hi: null,
  document_type: { id: 'dt', slug: 'report', name_en: 'Report', name_hi: null },
  knowledge_category: { id: 'kc', slug: 'reports', name_en: 'Research and Reports', name_hi: null },
  communication_type: null,
  document_section: 'publications',
  financial_year: { id: 'fy', label: 'FY 2025-26' },
  language: 'en',
  publication_date: '2026-05-01',
  is_public: true,
  show_in_knowledge_centre: true,
  file: { id: 'fa', file_url: 'u', file_name: 'report.pdf', mime_type: 'application/pdf', file_size: 1024, title: null },
  publication_state: 'published',
  public_visibility: true,
  show_on_homepage: false,
  highlight_type: null,
  display_order: null,
  published_at: '2026-05-02T00:00:00.000Z',
  archived_at: null,
  created_at: '2026-05-01T00:00:00.000Z',
  updated_at: '2026-05-02T00:00:00.000Z',
};

describe('documentColumns', () => {
  it('defines the contract columns with sortable title/publication_date', () => {
    const cols = documentColumns();
    const ids = cols.map((c) => c.id);
    expect(ids).toEqual(
      expect.arrayContaining(['title', 'document_type', 'language', 'publication_date', 'publication_state', 'highlight', 'show_on_homepage', 'updated_at']),
    );
    expect(cols.find((c) => c.id === 'title')?.sortField).toBe('title_en');
    expect(cols.find((c) => c.id === 'publication_date')?.sortField).toBe('publication_date');
  });

  it('appends an action column only when an actions renderer is supplied', () => {
    expect(documentColumns().some((c) => c.isActionColumn)).toBe(false);
    expect(documentColumns(() => null).some((c) => c.isActionColumn)).toBe(true);
  });

  it('merges type + resolved parent + section badge into the document_type column', () => {
    const col = documentColumns().find((c) => c.id === 'document_type')!;
    render(<>{col.cell(row)}</>);
    expect(screen.getByText('Report')).toBeInTheDocument();
    expect(screen.getByText('Publications')).toBeInTheDocument();
    expect(screen.getByText('Research and Reports')).toBeInTheDocument();
  });

  it('shows the communication type and Notifications badge for a notifications-section document', () => {
    const notifRow: DocumentSummary = {
      ...row,
      knowledge_category: null,
      communication_type: { id: 'ct', slug: 'circular', name_en: 'Circular', name_hi: null },
      document_section: 'notifications',
    };
    const col = documentColumns().find((c) => c.id === 'document_type')!;
    render(<>{col.cell(notifRow)}</>);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Circular')).toBeInTheDocument();
  });

  it('renders the publication state badge', () => {
    const col = documentColumns().find((c) => c.id === 'publication_state')!;
    render(<>{col.cell(row)}</>);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });
});
