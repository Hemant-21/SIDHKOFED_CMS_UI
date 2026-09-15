/**
 * `/dashboard/website-metrics/[id]/edit` — the Website Metric editor (Stage 5). This is the exact
 * route `operational-reports/components/report-summary-cards.tsx`'s "Use on website" action
 * navigates to after creating a draft config (`router.push(\`/dashboard/website-metrics/${id}/edit\`)`).
 */
import { WebsiteMetricEditorPage } from '@/features/dashboard-data';

export default function EditWebsiteMetricRoute({ params }: { params: { id: string } }) {
  return <WebsiteMetricEditorPage id={params.id} />;
}
