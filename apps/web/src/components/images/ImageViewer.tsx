'use client';

import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Image, PublicUser } from '@picflow/shared';
import { BlurImage } from '@/components/common/BlurImage';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CopyLinkButton } from '@/components/images/CopyLinkButton';
import { ImageStats } from '@/components/images/ImageStats';
import { SocialShareButtons } from '@/components/images/SocialShareButtons';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/api/auth';
import { ApiError, getAuthToken } from '@/lib/api/client';
import { useDeleteImage } from '@/lib/hooks/useImageQuery';
import { shareUrl } from '@/lib/config';

interface ImageViewerProps {
  image: Image;
}

/**
 * Client-rendered viewer body. Server layout handles OG meta and the
 * initial data fetch; this component wires up interactivity (copy,
 * delete, ownership detection).
 */
export function ImageViewer({ image }: ImageViewerProps): React.ReactElement {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' && !!getAuthToken();

  const { data: user } = useQuery<PublicUser, ApiError>({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
  });

  const isOwner = !!user && image.userId === user.id;
  const displayUrl = image.webpUrl ?? image.originalUrl;
  const share = shareUrl(image.slug);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteImage();

  const handleDelete = async (): Promise<void> => {
    await deleteMutation.mutateAsync(image.id);
    queryClient.removeQueries({ queryKey: ['image', image.slug] });
    window.location.href = '/dashboard';
  };

  return (
    <article className="flex flex-col gap-6 md:flex-row md:gap-8">
      <div className="relative flex min-h-[40vh] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border-default bg-bg-surface">
        <BlurImage
          src={displayUrl}
          alt={image.filename}
          width={image.width ?? 1600}
          height={image.height ?? 1200}
          blurHash={image.blurHash}
          sizes="(min-width: 768px) 70vw, 100vw"
          priority
          className="max-h-[min(80vh,900px)] w-full object-contain"
        />
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-4 md:w-80">
        <header>
          <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
            /i/{image.slug}
          </p>
          <h1 className="mt-1 truncate font-display text-[18px] font-medium text-text-primary">
            {image.filename}
          </h1>
        </header>

        <Separator />

        <ImageStats image={image} variant="stacked" />

        <Separator />

        <div className="flex flex-col gap-2">
          <CopyLinkButton url={share} variant="primary" className="w-full" />
          <Button asChild variant="secondary" className="w-full">
            <a href={image.originalUrl} download={image.filename} rel="noopener">
              <Download className="h-4 w-4" aria-hidden />
              Download original
            </a>
          </Button>
          {isOwner && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmOpen(true)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete
            </Button>
          )}
        </div>

        <Separator />

        <SocialShareButtons url={share} title={image.filename} />
      </aside>

      {isOwner && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this image?"
          description="The original, thumbnail, and WebP variant will be permanently removed. This can't be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={handleDelete}
        />
      )}
    </article>
  );
}
