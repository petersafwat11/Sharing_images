import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /**
   * Section vertical padding — maps to §3.3 guidance:
   * `py-16` desktop / `py-10` mobile. Set `padded=false` for pages
   * that manage their own vertical rhythm (e.g. the image viewer).
   */
  padded?: boolean;
}

export function PageContainer({
  children,
  className,
  padded = true,
}: PageContainerProps): React.ReactElement {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-page px-4 sm:px-6',
        padded && 'py-10 md:py-16',
        className,
      )}
    >
      {children}
    </div>
  );
}
