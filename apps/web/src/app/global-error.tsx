'use client';

import { useEffect } from 'react';

/**
 * Last-resort boundary — fires when even the root layout throws.
 * Must render its own <html>/<body> per the App Router contract.
 * Kept dependency-free (no Tailwind imports) so it stays bulletproof.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Global error boundary captured:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          backgroundColor: '#0A0A0B',
          color: '#F2F2F3',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 420,
            textAlign: 'center',
          }}
        >
          <div
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: '#8B5CF6',
              alignSelf: 'center',
            }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
            Picflow hit an unexpected error
          </h1>
          <p style={{ color: '#9898A4', margin: 0, fontSize: 14 }}>
            Reload the page to try again. If the issue persists, the
            reference below will help us trace it.
          </p>
          {error.digest && (
            <code style={{ color: '#5C5C6B', fontSize: 12 }}>
              ref: {error.digest}
            </code>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              alignSelf: 'center',
              marginTop: 8,
              height: 36,
              padding: '0 16px',
              borderRadius: 6,
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
