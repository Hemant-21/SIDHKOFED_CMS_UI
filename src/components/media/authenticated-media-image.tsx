'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { getBlob } from '@/lib/api/http';

export type MediaVariantName = 'thumb' | 'card' | 'hero';

interface AuthenticatedMediaRef {
  id: string;
  file_name?: string | null;
  title?: string | null;
  alt_text?: string | null;
  caption?: string | null;
}

export interface AuthenticatedMediaImageProps {
  media: AuthenticatedMediaRef;
  variant?: MediaVariantName;
  alt?: string;
  className?: string;
  loading?: 'eager' | 'lazy';
}

export function adminMediaFilePath(id: string, variant?: MediaVariantName): string {
  const suffix = variant ? `?variant=${variant}` : '';
  return `/admin/media/${encodeURIComponent(id)}/file${suffix}`;
}

export function useAuthenticatedMediaObjectUrl(mediaId: string, variant?: MediaVariantName) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;

    setSrc(null);
    setFailed(false);

    getBlob(adminMediaFilePath(mediaId, variant))
      .then((blob) => {
        if (!alive) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, variant]);

  return { src, failed };
}

export function AuthenticatedMediaImage({
  media,
  variant = 'card',
  alt,
  className,
  loading = 'lazy',
}: AuthenticatedMediaImageProps) {
  const { src, failed } = useAuthenticatedMediaObjectUrl(media.id, variant);

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-xs text-muted-foreground', className)}>
        Preview unavailable
      </div>
    );
  }

  if (!src) {
    return <div className={cn('animate-pulse bg-muted', className)} aria-label="Loading media preview" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? media.alt_text ?? media.title ?? media.caption ?? media.file_name ?? ''}
      className={className}
      loading={loading}
    />
  );
}
