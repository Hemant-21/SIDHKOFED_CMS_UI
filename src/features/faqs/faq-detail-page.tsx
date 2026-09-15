'use client';

/**
 * FAQ detail / view page. Read-only presentation of one FAQ plus the lifecycle actions.
 * Bilingual question/answer in tabs. Answer rendered as escaped plain text.
 */

import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader } from '@/components/layout/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, HighlightBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/feedback/skeleton';
import { ErrorState } from '@/components/feedback/error-state';
import { useCrudDetail } from '@/hooks/crud';
import { ROUTES } from '@/constants/routes';
import { FAQS_RESOURCE } from './api';
import type { FaqDetail } from './types';
import { FaqLifecycleActions } from './components/faq-lifecycle-actions';

export function FaqDetailPage({ id }: { id: string }) {
  const detail = useCrudDetail<FaqDetail>(FAQS_RESOURCE, id);
  const faq = detail.data;

  if (detail.isLoading) return <DetailSkeleton />;
  if (detail.isError || !faq) {
    return (
      <div className="space-y-6">
        <PageHeader title="FAQ" breadcrumbs={[{ label: 'FAQs', href: ROUTES.faqs }, { label: 'Detail' }]} />
        <ErrorState error={detail.error} onRetry={() => void detail.refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={faq.question_en}
        description={faq.question_hi ?? undefined}
        breadcrumbs={[{ label: 'FAQs', href: ROUTES.faqs }, { label: faq.question_en }]}
        actions={<FaqLifecycleActions faq={faq} />}
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge state={faq.publication_state} />
        {faq.highlight_type ? <HighlightBadge highlight={faq.highlight_type} /> : null}
        {!faq.public_visibility ? <Badge tone="warning">Not public</Badge> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Main pages:</span>
        {faq.page_assignments.length === 0 ? (
          <span className="text-sm text-muted-foreground">Not assigned to any page</span>
        ) : (
          [...faq.page_assignments]
            .sort((a, b) => a.display_order - b.display_order)
            .map((a) => (
              <Badge key={a.page_key} tone="default">
                {a.page_key} (#{a.display_order})
              </Badge>
            ))
        )}
      </div>

      <Card>
        <CardHeader title="Answer" />
        <CardContent>
          <Tabs defaultValue="en">
            <TabsList>
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="hi">हिन्दी</TabsTrigger>
            </TabsList>
            <TabsContent value="en">
              <Block body={faq.answer_en} />
            </TabsContent>
            <TabsContent value="hi">
              <Block body={faq.answer_hi} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Block({ body }: { body: string | null }) {
  if (!body) return <p className="text-sm text-muted-foreground">—</p>;
  return <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">{body}</pre>;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-72" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
