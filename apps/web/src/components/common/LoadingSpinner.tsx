import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

/**
 * Unified spinner used in button loading states and query fallbacks.
 * `label` is rendered visually-hidden for screen-readers.
 */
export function LoadingSpinner({
  className,
  label = 'Loading',
  size = 'md',
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <>
      <Loader2
        aria-hidden
        className={cn('animate-spin text-text-tertiary', SIZE_CLASS[size], className)}
      />
      <span className="sr-only">{label}</span>
    </>
  );
}
