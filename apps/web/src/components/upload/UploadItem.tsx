'use client';

import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import type { QueuedUpload } from '@picflow/shared';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { UploadSuccessCard } from './UploadSuccessCard';

interface UploadItemProps {
  item: QueuedUpload;
  onRemove: (id: string) => void;
}

/**
 * One row in the upload queue. Compact while active, expands to a
 * UploadSuccessCard once the pipeline reports `done`.
 */
export function UploadItem({
  item,
  onRemove,
}: UploadItemProps): React.ReactElement {
  if (item.status === 'done' && item.slug && item.shareUrl) {
    return (
      <UploadSuccessCard
        slug={item.slug}
        shareUrl={item.shareUrl}
        filename={item.file.name}
        size={item.file.size}
        onDismiss={() => onRemove(item.id)}
      />
    );
  }

  const { percent, loaded, total } = item.progress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex flex-col gap-3 rounded-xl border bg-bg-surface p-4',
        item.status === 'error'
          ? 'border-error/30 bg-error/5'
          : 'border-border-default',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <StatusIcon status={item.status} />
          <div className="min-w-0">
            <p className="truncate text-body text-text-primary">
              {item.file.name}
            </p>
            <p className="mt-0.5 text-caption text-text-tertiary">
              {progressLabel(item)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          aria-label="Remove from queue"
          className="shrink-0 rounded-md p-1 text-text-tertiary transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {item.status !== 'error' && (
        <Progress value={percent} aria-label={`${percent}%`} />
      )}

      {item.status === 'error' && item.error && (
        <p className="text-caption text-error">{item.error}</p>
      )}

      {(item.status === 'uploading' || item.status === 'processing') && (
        <p className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
          <span>{formatBytes(loaded)} / {formatBytes(total)}</span>
          <span>{percent}%</span>
        </p>
      )}
    </motion.div>
  );
}

function StatusIcon({
  status,
}: {
  status: QueuedUpload['status'];
}): React.ReactElement {
  if (status === 'error') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-error/10 text-error">
        <AlertCircle className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-bg-subtle text-accent">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
    </span>
  );
}

function progressLabel(item: QueuedUpload): string {
  switch (item.status) {
    case 'queued':
      return 'Waiting…';
    case 'uploading':
      return 'Uploading to storage';
    case 'processing':
      return 'Processing on server';
    case 'cancelled':
      return 'Cancelled';
    case 'error':
      return 'Upload failed';
    case 'done':
      return 'Done';
    default:
      return '';
  }
}
