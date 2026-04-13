import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export default function ImageNotFound(): React.ReactElement {
  return (
    <PageContainer>
      <EmptyState
        icon={ImageOff}
        title="This image is gone"
        description="The link may have been deleted, expired, or was never valid."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/">Back to home</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
