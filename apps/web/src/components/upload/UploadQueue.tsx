'use client';

import { AnimatePresence } from 'framer-motion';
import { useUploadStore } from '@/lib/store/upload.store';
import { UploadItem } from './UploadItem';

/**
 * Visual list of in-flight + completed uploads. Purely presentational —
 * all state lives in the zustand store and is written to by `useUpload`.
 */
export function UploadQueue(): React.ReactElement | null {
  const items = useUploadStore((s) => s.items);
  const remove = useUploadStore((s) => s.remove);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);

  if (items.length === 0) return null;

  const completedCount = items.filter(
    (i) => i.status === 'done' || i.status === 'cancelled',
  ).length;

  return (
    <section className="flex flex-col gap-3" aria-label="Upload queue">
      <header className="flex items-center justify-between">
        <h2 className="font-display text-section text-text-primary">
          Uploads
        </h2>
        {completedCount > 0 && (
          <button
            type="button"
            onClick={clearCompleted}
            className="text-caption text-text-tertiary transition-colors hover:text-text-secondary"
          >
            Clear completed
          </button>
        )}
      </header>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <UploadItem key={item.id} item={item} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
