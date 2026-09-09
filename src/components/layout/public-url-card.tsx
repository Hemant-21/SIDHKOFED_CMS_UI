import { ExternalLink } from 'lucide-react';
import { env } from '@/config/env';
import { Card, CardContent } from './card';

/**
 * Resolve a site-relative public path (e.g. `/events/slug`, as returned by the backend's
 * `public_url` fields) against the public website's own origin. The admin console runs on a
 * different origin, so a bare relative href would otherwise navigate within the admin app itself.
 */
export function toPublicSiteUrl(path: string): string {
  return /^https?:\/\//i.test(path) ? path : `${env.websiteUrl}${path}`;
}

interface PublicUrlLinkProps {
  path: string;
  label?: string;
}

/** The "Public URL" label + external link, without a Card wrapper — for embedding inside an existing card. */
export function PublicUrlLink({ path, label = 'Public URL' }: PublicUrlLinkProps) {
  const href = toPublicSiteUrl(path);
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 break-all text-primary hover:underline"
      >
        {href} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

/** Standalone "Public URL" card, shown on every publishable record's detail page. */
export function PublicUrlCard({ path, label }: PublicUrlLinkProps) {
  return (
    <Card>
      <CardContent className="text-sm">
        <PublicUrlLink path={path} label={label} />
      </CardContent>
    </Card>
  );
}
