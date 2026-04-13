'use client';

import { create } from 'zustand';
import type { QueuedUpload, UploadStatus } from '@picflow/shared';

/**
 * Upload queue state — lives ONLY in this store. Per CLAUDE.md §2,
 * zustand is NOT a general-purpose state dumping ground; it exists
 * solely to coordinate the in-memory upload queue shared across
 * UploadZone, UploadQueue, and UploadItem.
 */

interface UploadStoreState {
  items: QueuedUpload[];
  enqueue: (file: File) => string;
  remove: (id: string) => void;
  clearCompleted: () => void;
  setStatus: (id: string, status: UploadStatus) => void;
  setProgress: (id: string, loaded: number, total: number) => void;
  setError: (id: string, error: string) => void;
  setResult: (id: string, slug: string, shareUrl: string) => void;
}

function makeId(): string {
  // Upload IDs never leave the browser — a short random suffix is plenty.
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useUploadStore = create<UploadStoreState>((set) => ({
  items: [],

  enqueue: (file) => {
    const id = makeId();
    const item: QueuedUpload = {
      id,
      file,
      status: 'queued',
      progress: { loaded: 0, total: file.size, percent: 0 },
    };
    set((state) => ({ items: [...state.items, item] }));
    return id;
  },

  remove: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  clearCompleted: () =>
    set((state) => ({
      items: state.items.filter(
        (i) => i.status !== 'done' && i.status !== 'cancelled',
      ),
    })),

  setStatus: (id, status) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, status } : i)),
    })),

  setProgress: (id, loaded, total) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? {
              ...i,
              progress: {
                loaded,
                total,
                percent: total > 0 ? Math.round((loaded / total) * 100) : 0,
              },
            }
          : i,
      ),
    })),

  setError: (id, error) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id ? { ...i, status: 'error', error } : i,
      ),
    })),

  setResult: (id, slug, shareUrl) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'done',
              slug,
              shareUrl,
              progress: { loaded: i.file.size, total: i.file.size, percent: 100 },
            }
          : i,
      ),
    })),
}));

export function selectActiveUploads(state: UploadStoreState): QueuedUpload[] {
  return state.items.filter(
    (i) =>
      i.status === 'queued' ||
      i.status === 'uploading' ||
      i.status === 'processing',
  );
}
