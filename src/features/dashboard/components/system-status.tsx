'use client';

/**
 * System Status (Phase 15.2) — reports ONLY backend-supported status, never an
 * invented health check (task constraint). It shows:
 *   • Global search: enabled + the number of searchable content surfaces (the FTS
 *     contract — the exact surfaces the backend indexes).
 * Scheduler / background-job internals have no public status endpoint, so we say so
 * plainly rather than fabricate a green/red light.
 *
 * The fixed "Dashboard Reports" catalog this card used to summarize was retired
 * backend-side (its admin/public routes, services, and rows are gone) — see the
 * Dashboard Reports removal note in `../../dashboard-data`. Only Operational
 * Reports and Website Metrics remain under the dashboard umbrella; neither has a
 * public status endpoint suited to this card, so the "reports" status row was
 * removed rather than repointed.
 */

import { ServerCog } from 'lucide-react';
import { CONTENT_TYPES } from '@/types/search';
import { DashboardCard, InfoCard, StatusRow } from './cards';

export function SystemStatus() {
  return (
    <DashboardCard title="System Status" description="Backend-reported status only" icon={ServerCog}>
      <ul className="divide-y divide-border">
        <StatusRow
          label="Global search"
          description={`${CONTENT_TYPES.length} searchable content surfaces`}
          value="Enabled"
          tone="success"
        />
      </ul>
      <div className="mt-4">
        <InfoCard>
          Scheduler and background jobs (scheduled publishing, status recalculation, highlight
          expiry) run server-side and expose no public status endpoint.
        </InfoCard>
      </div>
    </DashboardCard>
  );
}
