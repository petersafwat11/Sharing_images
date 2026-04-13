import axios from 'axios';
import type {
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  PresignRequest,
  PresignResponse,
} from '@picflow/shared';
import { apiClient, unwrap } from './client';

/**
 * Step 1 — ask the API for a presigned PUT URL.
 */
export async function presignUpload(
  payload: PresignRequest,
): Promise<PresignResponse> {
  const res = await apiClient.post<{ data: PresignResponse }>(
    '/upload/presign',
    payload,
  );
  return unwrap(res.data);
}

/**
 * Step 2 — upload the file bytes directly to R2 via the presigned URL.
 * Progress reported via the `onProgress` callback (bytes, not %).
 * Cancellation wired through an AbortSignal so the upload queue can
 * cancel in-flight requests.
 */
export async function putToR2(args: {
  uploadUrl: string;
  file: File;
  onProgress: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { uploadUrl, file, onProgress, signal } = args;

  // Uses a bare axios call (NOT apiClient) because R2 must not receive
  // our Authorization header. Presigned URLs sign the request themselves.
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    signal,
    onUploadProgress: (event) => {
      const total = event.total ?? file.size;
      onProgress(event.loaded, total);
    },
    // Axios defaults `transformRequest` to JSON.stringify for objects.
    // We need the raw File — disable by passing a no-op transform.
    transformRequest: [(data: unknown): unknown => data],
  });
}

/**
 * Step 3 — tell the API the direct upload succeeded.
 */
export async function confirmUpload(
  payload: ConfirmUploadRequest,
): Promise<ConfirmUploadResponse> {
  const res = await apiClient.post<{ data: ConfirmUploadResponse }>(
    '/upload/confirm',
    payload,
  );
  return unwrap(res.data);
}
