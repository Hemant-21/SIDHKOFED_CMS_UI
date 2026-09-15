'use client';

/**
 * FAQs data layer. Standard list/detail/create/update/lifecycle use the shared CRUD hooks against
 * the `faqs` resource (the standard admin "P" pattern). Page assignment is carried in the FAQ
 * write payload itself (`page_assignments`); the two module-specific extras are the registered
 * page options (for the multiselect/filter) and the page-scoped reorder action, wired here over
 * the shared typed HTTP helpers the same way gallery image reordering is (`galleries/api.ts`).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminResource } from '@/constants/api-endpoints';
import { post, get } from '@/lib/api/http';
import { invalidateResource } from '@/lib/query';
import { errorMessage } from '@/lib/api/server-errors';
import { useToast } from '@/hooks/use-toast';
import type { FaqPageOption, FaqPageReorderInput } from './types';

export const FAQS_RESOURCE = 'faqs';

export { FAQ_PERMS } from './permissions';

const base = adminResource(FAQS_RESOURCE);
const pagesPath = `${base.list}/pages`;
const pageReorderPath = (pageKey: string) => `${pagesPath}/${encodeURIComponent(pageKey)}/reorder`;

/** The registered main pages an FAQ can be assigned to (small, slowly-changing — loaded eagerly). */
export function useFaqPageOptions() {
  return useQuery({
    queryKey: ['faqs', 'pages'],
    queryFn: () => get<FaqPageOption[]>(pagesPath),
    staleTime: 5 * 60 * 1000,
  });
}

/** Persist a new FAQ order for one page (move up/down), scoped to that page only. */
export function useReorderFaqPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ pageKey, body }: { pageKey: string; body: FaqPageReorderInput }) =>
      post<{ page_key: string; reordered: number }, FaqPageReorderInput>(pageReorderPath(pageKey), body),
    onSuccess: () => {
      void invalidateResource(queryClient, FAQS_RESOURCE);
      toast.success('FAQs reordered.');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
