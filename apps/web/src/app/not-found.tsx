import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export default function NotFound(): React.ReactElement {
  return (
    <PageContainer>
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        action={
          <Button asChild variant="primary" size="sm">
            <Link href="/">Go home</Link>
          </Button>
        }
      />
    </PageContainer>
  );
}
