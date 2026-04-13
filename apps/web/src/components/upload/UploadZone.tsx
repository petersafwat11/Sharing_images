'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@picflow/shared';
import { useUpload } from '@/lib/hooks/useUpload';
import { useClipboardPaste } from '@/lib/hooks/useClipboardPaste';
import { formatBytes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

const DROPZONE_ACCEPT = Object.fromEntries(
  ALLOWED_MIME_TYPES.map((m) => [m, []]),
);

/**
 * Primary drop/click/paste surface. All file intake routes through
 * `useUpload` which handles validation + the three-step pipeline.
 * Paste is document-level per §7 so it works anywhere on the page.
 */
export function UploadZone(): React.ReactElement {
  const { enqueueFiles } = useUpload();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) enqueueFiles(accepted);
    },
    [enqueueFiles],
  );

  useClipboardPaste(
    useCallback(
      (files: File[]) => {
        if (files.length > 0) enqueueFiles(files);
      },
      [enqueueFiles],
    ),
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    open,
  } = useDropzone({
    onDrop,
    accept: DROPZONE_ACCEPT,
    maxSize: MAX_FILE_SIZE_BYTES,
    noClick: true,
    noKeyboard: false,
    multiple: true,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          'group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-default bg-bg-surface px-6 py-10 text-center transition-all duration-150 ease-out',
          'hover:border-border-strong',
          isDragActive &&
            'border-accent-border bg-accent-subtle',
          isDragReject && 'border-error/40 bg-error/5',
        ),
      })}
      role="button"
      tabIndex={0}
      aria-label="Upload images — drag, paste, or click to browse"
      onClick={open}
    >
      <input {...getInputProps()} />

      <motion.span
        className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary"
        animate={{ scale: isDragActive ? 1.1 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Upload className="h-5 w-5" aria-hidden />
      </motion.span>

      <div className="flex flex-col gap-1">
        <p className="font-display text-[17px] font-medium text-text-primary">
          {isDragActive ? 'Drop to upload' : 'Drop an image or paste from clipboard'}
        </p>
        <p className="text-body text-text-secondary">
          JPG, PNG, GIF, WebP · up to {formatBytes(MAX_FILE_SIZE_BYTES)}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          open();
        }}
        className="mt-1 inline-flex h-8 items-center rounded-md border border-border-default px-3 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
      >
        Browse files
      </button>

      <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-text-tertiary">
        ⌘V · Ctrl+V works anywhere
      </p>
    </div>
  );
}
