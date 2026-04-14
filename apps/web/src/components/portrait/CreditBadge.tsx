import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface CreditBadgeProps {
  credits: number;
  className?: string;
}

/**
 * Compact violet credit indicator shown in the header for logged-in users.
 * Turns amber when the user is down to 1 credit, red at 0.
 * Clicking opens /pricing.
 */
export function CreditBadge({ credits, className }: CreditBadgeProps): React.ReactElement {
  const isLow = credits === 1;
  const isEmpty = credits <= 0;

  return (
    <Link
      href="/pricing"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors duration-150',
        isEmpty
          ? 'border-error/20 bg-error/10 text-error hover:bg-error/15'
          : isLow
            ? 'border-warning/20 bg-warning/10 text-warning hover:bg-warning/15'
            : 'border-accent-border bg-accent-subtle text-accent hover:bg-accent/20',
        className,
      )}
    >
      <span aria-hidden className="text-[10px] leading-none">◆</span>
      <span>
        {credits} credit{credits !== 1 ? 's' : ''}
      </span>
    </Link>
  );
}
