/**
 * `/dashboard/reports/generate` — Generate Reports (Stage 4). A sibling of the fixed-catalogue
 * `/dashboard/reports` list, not a replacement of it — see the routing note in
 * `features/dashboard-data/operational-reports/generate-reports-page.tsx`.
 */
import { GenerateReportsPage } from '@/features/dashboard-data';

export default function DashboardGenerateReportsRoute() {
  return <GenerateReportsPage />;
}
