'use client';

import { useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorView } from '@/components/common/ErrorView';

/**
 * Per-segment error boundary for everything below the root layout.
 * Fires on uncaught errors during client navigation or rendering.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    // Surface for Sentry / equivalent later. For now, log to console
    // so dev environments still see the stack.
    // eslint-disable-next-line no-console
    console.error('Route error boundary captured:', error);
  }, [error]);

  return (
    <PageContainer>
      <ErrorView reset={reset} digest={error.digest} />
    </PageContainer>
  );
}
