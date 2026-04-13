/**
 * Pure TypeScript types not derived from Zod.
 * Anything derived from a Zod schema lives in `../schemas/`.
 */

export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'done'
  | 'error'
  | 'cancelled';

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface QueuedUpload {
  id: string;
  file: File;
  status: UploadStatus;
  progress: UploadProgress;
  slug?: string;
  shareUrl?: string;
  error?: string;
}

export type SortKey = 'newest' | 'oldest' | 'most-viewed' | 'largest';
