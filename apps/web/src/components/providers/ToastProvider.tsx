'use client';

import { Toaster } from 'react-hot-toast';

/**
 * react-hot-toast instance. Styled to match the dark palette (§3).
 * Lives alongside shadcn Toast — use hot-toast for fire-and-forget
 * notifications, Toast primitives for interactive dismissible toasts.
 */
export function ToastProvider(): React.ReactElement {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          fontSize: '13px',
          padding: '10px 14px',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent-default)',
            secondary: 'white',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
