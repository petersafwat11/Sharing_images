'use client';

import { useCallback } from 'react';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  type AllowedMimeType,
} from '@picflow/shared';
import {
  confirmUpload,
  presignUpload,
  putToR2,
} from '@/lib/api/upload';
import { ApiError } from '@/lib/api/client';
import { useUploadStore } from '@/lib/store/upload.store';

export interface UseUploadReturn {
  enqueueFiles: (files: ReadonlyArray<File>) => string[];
  remove: (id: string) => void;
  clearCompleted: () => void;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return `Unsupported type: ${file.type || 'unknown'}`;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File exceeds 20 MB limit`;
  }
  if (file.size === 0) {
    return 'File is empty';
  }
  return null;
}

/**
 * Orchestrates the full upload pipeline for one file:
 *   1. POST /upload/presign
 *   2. PUT file → R2 (with progress events)
 *   3. POST /upload/confirm
 * Errors at any step transition the queue item to `error` status.
 */
async function runUploadPipeline(
  id: string,
  file: File,
  store: ReturnType<typeof useUploadStore.getState>,
): Promise<void> {
  try {
    store.setStatus(id, 'uploading');

    const presign = await presignUpload({
      filename: file.name,
      mimeType: file.type as AllowedMimeType,
      size: file.size,
    });

    await putToR2({
      uploadUrl: presign.uploadUrl,
      file,
      onProgress: (loaded, total) => {
        useUploadStore.getState().setProgress(id, loaded, total);
      },
    });

    store.setStatus(id, 'processing');

    const confirm = await confirmUpload({
      key: presign.key,
      slug: presign.slug,
    });

    useUploadStore
      .getState()
      .setResult(id, confirm.slug, confirm.shareUrl);
  } catch (err) {
    const message =
      err instanceof ApiError
        ? err.messages.join(', ')
        : err instanceof Error
          ? err.message
          : 'Upload failed';
    useUploadStore.getState().setError(id, message);
  }
}

/**
 * Primary upload hook used by UploadZone and paste handlers.
 * Returns the enqueued IDs so callers can correlate UI state.
 * Validation errors are surfaced through the queue item itself (status
 * `error`), matching §7 "validation errors shown inline (not toast)".
 */
export function useUpload(): UseUploadReturn {
  const enqueue = useUploadStore((s) => s.enqueue);
  const setError = useUploadStore((s) => s.setError);
  const remove = useUploadStore((s) => s.remove);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);

  const enqueueFiles = useCallback(
    (files: ReadonlyArray<File>): string[] => {
      const ids: string[] = [];
      for (const file of files) {
        const id = enqueue(file);
        ids.push(id);
        const validationError = validateFile(file);
        if (validationError) {
          setError(id, validationError);
          continue;
        }
        void runUploadPipeline(id, file, useUploadStore.getState());
      }
      return ids;
    },
    [enqueue, setError],
  );

  return { enqueueFiles, remove, clearCompleted };
}
