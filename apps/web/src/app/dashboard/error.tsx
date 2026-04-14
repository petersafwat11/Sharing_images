'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorView } from '@/components/common/ErrorView';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <PageContainer>
      <ErrorView
        title="Couldn't load your dashboard"
        description="We hit a snag fetching your uploads. Try again — the data is still there."
        reset={reset}
        digest={error.digest}
      />
    </PageContainer>
  );
}
