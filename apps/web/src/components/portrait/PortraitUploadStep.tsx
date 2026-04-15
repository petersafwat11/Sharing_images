'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES, MAX_PORTRAIT_INPUTS } from '@picflow/shared';
import { presignUpload } from '@/lib/api/upload';
import { formatBytes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  key: string | null;
  uploading: boolean;
  error: string | null;
}

interface PortraitUploadStepProps {
  /** Called whenever the set of successfully uploaded S3 keys changes */
  onKeysChange: (keys: string[]) => void;
}

const ACCEPT = Object.fromEntries(
  ALLOWED_MIME_TYPES.map((m) => [m as string, []]),
);

const TIPS = [
  { icon: '✓', text: 'Clear, well-lit photo of just the baby', ok: true },
  { icon: '✓', text: 'Face clearly visible, looking at the camera', ok: true },
  { icon: '✓', text: 'Add 2–3 photos for best identity matching', ok: true },
  { icon: '✗', text: 'Avoid sunglasses, hats, heavy shadows', ok: false },
  { icon: '✗', text: 'Avoid group photos — crop to baby only', ok: false },
];

export function PortraitUploadStep({ onKeysChange }: PortraitUploadStepProps): React.ReactElement {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  // Derive ready keys as a side-effect of photos changing — never call
  // onKeysChange inside a setPhotos updater (triggers cross-component setState
  // during render which React forbids).
  useEffect(() => {
    const ready = photos.filter((p) => p.key !== null && !p.error).map((p) => p.key as string);
    onKeysChange(ready);
  }, [photos, onKeysChange]);

  const uploadPhoto = async (item: PhotoItem): Promise<void> => {
    try {
      const { uploadUrl, key } = await presignUpload({
        filename: item.file.name,
        mimeType: item.file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        size: item.file.size,
      });

      await axios.put(uploadUrl, item.file, {
        headers: { 'Content-Type': item.file.type },
        transformRequest: [(data: unknown): unknown => data],
      });

      setPhotos((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, key, uploading: false } : p)),
      );
    } catch {
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, uploading: false, error: 'Upload failed — try again' } : p,
        ),
      );
    }
  };

  const addFiles = useCallback(
    (accepted: File[]) => {
      setPhotos((prev) => {
        const slots = MAX_PORTRAIT_INPUTS - prev.length;
        const toAdd = accepted.slice(0, slots);
        const newItems: PhotoItem[] = toAdd.map((file) => ({
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          key: null,
          uploading: true,
          error: null,
        }));
        const updated = [...prev, ...newItems];
        newItems.forEach((item) => void uploadPhoto(item));
        return updated;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const removePhoto = (id: string): void => {
    setPhotos((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  const retryPhoto = (item: PhotoItem): void => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, uploading: true, error: null } : p)),
    );
    void uploadPhoto({ ...item, uploading: true, error: null });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: ACCEPT,
    maxSize: MAX_FILE_SIZE_BYTES,
    noClick: true,
    multiple: true,
    disabled: photos.length >= MAX_PORTRAIT_INPUTS,
  });

  const canAddMore = photos.length < MAX_PORTRAIT_INPUTS;

  return (
    <div className="space-y-6">
      {/* Photo grid / drop zone */}
      <div {...getRootProps()}>
        <input {...getInputProps()} id="portrait-file-input" />

        <div
          className={cn(
            'grid gap-3 transition-all duration-150',
            photos.length === 0
              ? 'grid-cols-1'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
          )}
        >
          <AnimatePresence mode="popLayout">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="relative"
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-border-default bg-bg-elevated">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt="Source photo"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Upload state overlay */}
                {photo.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                )}
                {photo.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/60 p-2 text-center">
                    <AlertCircle className="h-5 w-5 text-error" />
                    <button
                      type="button"
                      onClick={() => retryPhoto(photo)}
                      className="text-[11px] text-error underline underline-offset-2"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!photo.uploading && !photo.error && photo.key && (
                  <div className="absolute bottom-1.5 right-1.5 rounded-full bg-success p-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-bg-elevated border border-border-default text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}

            {/* Empty state / add more slot */}
            {photos.length === 0 ? (
              <motion.div
                key="empty"
                layout
                className={cn(
                  'flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-default bg-bg-surface px-6 py-10 text-center transition-all duration-150',
                  'hover:border-border-strong',
                  isDragActive && 'border-accent-border bg-accent-subtle',
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-subtle text-text-secondary">
                  <ImagePlus className="h-5 w-5" aria-hidden />
                </span>
                <div className="space-y-1">
                  <p className="font-display text-[15px] font-medium text-text-primary">
                    {isDragActive ? 'Drop photos here' : 'Add baby photos'}
                  </p>
                  <p className="text-caption text-text-tertiary">
                    Up to {MAX_PORTRAIT_INPUTS} photos · JPG, PNG, WebP · {formatBytes(MAX_FILE_SIZE_BYTES)} max
                  </p>
                </div>
                <label
                  htmlFor="portrait-file-input"
                  className="mt-1 inline-flex h-8 cursor-pointer items-center rounded-md border border-border-default px-3 text-xs font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
                >
                  Browse files
                </label>
              </motion.div>
            ) : canAddMore ? (
              <motion.label
                key="add-more"
                layout
                htmlFor="portrait-file-input"
                className="aspect-square flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-default bg-bg-surface text-text-tertiary transition-all duration-150 hover:border-border-strong hover:text-text-secondary"
              >
                <ImagePlus className="h-5 w-5" aria-hidden />
                <span className="text-[11px]">Add more</span>
              </motion.label>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Photo guidance tips */}
      <div className="rounded-xl border border-border-default bg-bg-surface p-4">
        <p className="mb-3 text-caption font-medium uppercase tracking-wide text-text-tertiary">
          Tips for best results
        </p>
        <div className="space-y-2">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className={cn(
                  'mt-px text-xs font-bold',
                  tip.ok ? 'text-success' : 'text-text-tertiary',
                )}
              >
                {tip.icon}
              </span>
              <span className="text-caption text-text-secondary">{tip.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
