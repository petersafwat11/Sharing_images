'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ArrowUpRight, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { CopyLinkButton } from '@/components/images/CopyLinkButton';
import { formatBytes } from '@/lib/utils/format';

interface UploadSuccessCardProps {
  slug: string;
  shareUrl: string;
  filename: string;
  size: number;
  onDismiss?: () => void;
}

/**
 * Shown inline when an upload completes. Slides up + fades in per §7.
 * Exposes the shareable URL as a monospace slug and a one-click copy
 * button.
 */
export function UploadSuccessCard({
  slug,
  shareUrl,
  filename,
  size,
  onDismiss,
}: UploadSuccessCardProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Card className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
              Uploaded
            </p>
            <h3 className="mt-1 truncate font-display text-[15px] font-medium text-text-primary">
              {filename}
            </h3>
            <p className="mt-0.5 text-caption text-text-tertiary">
              {formatBytes(size)}
            </p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </header>

        <div className="flex flex-wrap items-center gap-2 rounded-md bg-bg-subtle px-3 py-2">
          <code className="flex-1 truncate font-mono text-[13px] text-text-primary">
            {shareUrl}
          </code>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CopyLinkButton url={shareUrl} size="sm" />
          <Link
            href={`/i/${slug}` as Route}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border-default px-3 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
          >
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            Open
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
