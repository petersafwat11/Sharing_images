import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state. Used in dashboard when a user has no images,
 * and anywhere else a "nothing here yet" card is appropriate.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-default bg-bg-surface p-10 text-center',
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-subtle text-text-tertiary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="font-display text-[15px] font-medium text-text-primary">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-body text-text-secondary">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
