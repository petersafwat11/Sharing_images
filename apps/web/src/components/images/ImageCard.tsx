'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useState } from 'react';
import { ExternalLink, Eye, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Image } from '@picflow/shared';
import { BlurImage } from '@/components/common/BlurImage';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CopyLinkButton } from './CopyLinkButton';
import { useDeleteImage } from '@/lib/hooks/useImageQuery';
import { formatViews } from '@/lib/utils/format';
import { shareUrl } from '@/lib/config';

interface ImageCardProps {
  image: Image;
}

/**
 * Dashboard gallery card. Hover overlay exposes copy / open / delete —
 * per §7 UX spec. Subtle 1→1.02 hover scale matches the design motion.
 */
export function ImageCard({ image }: ImageCardProps): React.ReactElement {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteMutation = useDeleteImage();

  const thumb = image.thumbUrl ?? image.webpUrl ?? image.originalUrl;
  const share = shareUrl(image.slug);

  return (
    <>
      <motion.article
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface transition-colors duration-150 hover:border-border-strong"
      >
        <Link
          href={`/i/${image.slug}` as Route}
          aria-label={`Open ${image.filename}`}
          className="block aspect-square"
        >
          <BlurImage
            src={thumb}
            alt={image.filename}
            width={image.width ?? 400}
            height={image.height ?? 400}
            blurHash={image.blurHash}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <span className="pointer-events-auto inline-flex items-center gap-1 rounded-sm bg-bg-elevated/90 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-text-primary">
            <Eye className="h-3 w-3" aria-hidden />
            {formatViews(image.views)}
          </span>
          <div className="pointer-events-auto flex items-center gap-1">
            <CopyLinkButton
              url={share}
              size="icon"
              variant="secondary"
              className="bg-bg-elevated/90"
              aria-label="Copy link"
              label=""
              copiedLabel=""
            />
            <Link
              href={`/i/${image.slug}` as Route}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border-default bg-bg-elevated/90 text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
              aria-label="Open image page"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
              aria-label="Delete image"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-error/30 bg-error/10 text-error transition-colors hover:bg-error/20"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.article>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this image?"
        description={image.filename}
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteMutation.mutateAsync(image.id)}
      />
    </>
  );
}
