import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';

export default function ImageViewLoading(): React.ReactElement {
  return (
    <PageContainer padded={false} className="py-8 md:py-12">
      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <Skeleton className="aspect-video w-full flex-1 rounded-xl md:aspect-auto md:min-h-[60vh]" />
        <aside className="flex w-full shrink-0 flex-col gap-4 md:w-80">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-2/3" />
            ))}
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
