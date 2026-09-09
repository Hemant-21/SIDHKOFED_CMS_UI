'use client';

/**
 * Route guards. `ProtectedRoute` blocks unauthenticated access (redirect to
 * /login with a `next` param); `GuestRoute` keeps authenticated users out of
 * /login. These are the building blocks the (admin) layout and future module
 * pages compose — no page re-implements auth gating.
 */

import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants/routes';
import { env } from '@/config/env';
import { FullPageLoader } from '@/components/feedback/full-page-loader';

function stripDeployBasePath(path: string): string {
  if (!env.basePath) return path;
  if (path === env.basePath) return '/';
  if (path.startsWith(`${env.basePath}/`)) return path.slice(env.basePath.length);
  return path;
}

/** Wrap any authenticated area. While restoring the session, shows a loader. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next =
        typeof window !== 'undefined'
          ? encodeURIComponent(stripDeployBasePath(window.location.pathname) + window.location.search)
          : '';
      router.replace(next ? `${ROUTES.login}?next=${next}` : ROUTES.login);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <FullPageLoader label="Restoring your session…" />;
  if (!isAuthenticated) return <FullPageLoader label="Redirecting to sign in…" />;
  return <>{children}</>;
}

/** Wrap guest-only pages (login). Authenticated users are sent to their target. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const next = params.get('next');
      router.replace(next ? stripDeployBasePath(decodeURIComponent(next)) : ROUTES.dashboard);
    }
  }, [isAuthenticated, isLoading, params, router]);

  if (isLoading) return <FullPageLoader label="Loading…" />;
  if (isAuthenticated) return <FullPageLoader label="Redirecting…" />;
  return <>{children}</>;
}
