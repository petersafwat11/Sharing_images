'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCopyReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
}

/**
 * Shows "Copied!" feedback for `resetMs` (default 2s) after a successful
 * copy — matches §7 "Copy button shows 'Copied!' for 2 seconds then resets".
 */
export function useCopyToClipboard(resetMs: number = 2000): UseCopyReturn {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
          return false;
        }
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetMs],
  );

  return { copy, copied };
}
