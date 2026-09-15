/**
 * `/dashboard/website-metrics/new` — direct creation of a website metric (Stage 5). The realistic
 * path is "Use on website" from Generate Reports, which lands straight on `/[id]/edit`; this route
 * exists so the list page's "New" button also works without going through Generate Reports first.
 */
import { WebsiteMetricEditorPage } from '@/features/dashboard-data';

export default function NewWebsiteMetricRoute() {
  return <WebsiteMetricEditorPage />;
}
