'use client';

/**
 * KPI sections (Phase 15.2). `ContentKpiGrid` — per-module record totals. Each
 * total is the BACKEND's `pagination.total_items` for that resource (the server's
 * count, requested with page_size=1); the frontend never tallies records itself.
 *
 * The `HeadlineKpiGrid` this file used to also export (the resolved public
 * dashboard figures from `/public/dashboard/kpis`) was removed: the backend
 * retired the fixed "Dashboard Reports" concept entirely, including every
 * `/public/dashboard*` route. See the Dashboard Reports removal note in
 * `../../dashboard-data`.
 */

import {
  CalendarDays,
  FileText,
  BookOpen,
  Building2,
  Megaphone,
  Gavel,
  BadgeCheck,
  type LucideIcon,
} from 'lucide-react';
import { GridLayout } from '@/components/layout';
import { formatNumber } from '@/utils/format';
import { useContentCounts, type ContentCountSpec } from '../hooks';
import { StatCard } from './cards';

/** Fixed per-module KPI descriptors. Each maps to one admin resource total. */
interface ContentKpi extends ContentCountSpec {
  label: string;
  icon: LucideIcon;
}

const CONTENT_KPIS: ContentKpi[] = [
  { key: 'events', resource: 'events', label: 'Events', icon: CalendarDays },
  { key: 'documents', resource: 'documents', label: 'Documents', icon: FileText },
  { key: 'programmes', resource: 'programmes', label: 'Programmes', icon: BookOpen },
  { key: 'institutions', resource: 'institutions', label: 'Institutions', icon: Building2 },
  {
    key: 'communications',
    resource: 'official-communications',
    label: 'Communications',
    icon: Megaphone,
  },
  { key: 'tenders', resource: 'tenders', label: 'Tenders', icon: Gavel },
  { key: 'memberships', resource: 'memberships', label: 'Memberships', icon: BadgeCheck },
];

/** Per-module content totals. Every card resolves its own loading/error/retry. */
export function ContentKpiGrid() {
  const results = useContentCounts(CONTENT_KPIS);
  return (
    <GridLayout columns={4}>
      {CONTENT_KPIS.map((kpi, i) => {
        const q = results[i];
        return (
          <StatCard
            key={kpi.key}
            icon={kpi.icon}
            label={kpi.label}
            value={formatNumber(q?.data ?? 0)}
            isLoading={q?.isLoading}
            error={q?.error}
            onRetry={() => q?.refetch()}
          />
        );
      })}
    </GridLayout>
  );
}
