'use client';

import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ErrorViewProps {
  title?: string;
  description?: string;
  reset?: () => void;
  digest?: string;
  className?: string;
}

/**
 * Shared rendering surface for App Router `error.tsx` boundaries.
 * Keeps copy + styling consistent across the app.
 */
export function ErrorView({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Try again, or head back home.',
  reset,
  digest,
  className,
}: ErrorViewProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-error/20 bg-error/5 p-10 text-center',
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10 text-error">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-section text-text-primary">{title}</h2>
        <p className="max-w-sm text-body text-text-secondary">{description}</p>
        {digest && (
          <code className="mt-1 font-mono text-[11px] text-text-tertiary">
            ref: {digest}
          </code>
        )}
      </div>
      {reset && (
        <Button variant="secondary" size="sm" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
