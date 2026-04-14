import { useQuery } from '@tanstack/react-query';
import { getPortraitStatus } from '@/lib/api/portraits';

/**
 * Polls portrait status every 3 seconds until DONE or FAILED.
 * Polling stops automatically once a terminal state is reached.
 */
export function usePortraitStatus(shareSlug: string) {
  return useQuery({
    queryKey: ['portrait', shareSlug, 'status'],
    queryFn: () => getPortraitStatus(shareSlug),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'DONE' || status === 'FAILED') return false;
      return 3_000;
    },
    staleTime: 0,
    enabled: !!shareSlug,
  });
}
