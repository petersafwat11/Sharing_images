'use client';

import { useEffect } from 'react';

/**
 * Document-level paste listener that extracts image Files from the
 * clipboard. Required for the §7 behavior "Cmd/Ctrl+V paste anywhere
 * on the page". Ignores paste events inside form inputs so we don't
 * swallow text-paste in login/register fields.
 */
export function useClipboardPaste(
  onFiles: (files: File[]) => void,
  enabled: boolean = true,
): void {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handler = (event: ClipboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const editable = target.isContentEditable;
        if (editable || tag === 'INPUT' || tag === 'TEXTAREA') return;
      }

      const dataTransfer = event.clipboardData;
      if (!dataTransfer) return;

      const files: File[] = [];
      for (const item of Array.from(dataTransfer.items)) {
        if (item.kind !== 'file') continue;
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          files.push(file);
        }
      }

      if (files.length > 0) {
        event.preventDefault();
        onFiles(files);
      }
    };

    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [onFiles, enabled]);
}
