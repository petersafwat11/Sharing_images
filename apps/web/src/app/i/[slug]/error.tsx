'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { ErrorView } from '@/components/common/ErrorView';

export default function ImageViewError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <PageContainer>
      <ErrorView
        title="Couldn't load this image"
        description="The link is valid but we couldn't reach it right now. Try again."
        reset={reset}
        digest={error.digest}
      />
    </PageContainer>
  );
}
