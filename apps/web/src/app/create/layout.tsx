'use client';

import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { cn } from '@/lib/utils/cn';

const STEPS = [
  { label: 'Upload photos', path: '/create' },
  { label: 'Pick theme', path: '/create/themes' },
  { label: 'Generate', path: null },
];

function stepIndexFor(pathname: string): number {
  if (pathname === '/create') return 0;
  if (pathname.startsWith('/create/themes')) return 1;
  return 2;
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const pathname = usePathname();
  const current = stepIndexFor(pathname);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Step progress bar */}
      <div className="border-b border-border-default">
        <PageContainer>
          <div className="flex items-center justify-center py-4">
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors duration-150',
                      i < current && 'bg-accent/20 text-accent',
                      i === current && 'bg-accent text-white',
                      i > current &&
                        'border border-border-default bg-bg-elevated text-text-tertiary',
                    )}
                    aria-current={i === current ? 'step' : undefined}
                  >
                    {i < current ? '✓' : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm transition-colors duration-150',
                      i === current
                        ? 'font-medium text-text-primary'
                        : 'text-text-tertiary',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-3 h-px w-12',
                      i < current ? 'bg-accent/40' : 'bg-border-default',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </PageContainer>
      </div>

      {children}
    </div>
  );
}
