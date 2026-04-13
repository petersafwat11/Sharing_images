'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * One QueryClient per browser session. Defaults aligned to the app:
 *  - `staleTime: 30s` — avoid refetching on every mount
 *  - `refetchOnWindowFocus: false` — this is a utility, not a dashboard
 *  - `retry: 1` — let ApiError surface after a single retry
 */
export function QueryProvider({
  children,
}: {
  children: ReactNode;
}): React.ReactElement {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
