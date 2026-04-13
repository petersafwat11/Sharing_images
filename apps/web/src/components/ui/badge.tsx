import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

/**
 * Badge — §3.4. Monospace, tiny, uppercase, tracked wide.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-sm font-mono text-[11px] uppercase tracking-wide px-1.5 py-0.5 border',
  {
    variants: {
      variant: {
        default:
          'border-border-default bg-bg-subtle text-text-secondary',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        error: 'border-error/30 bg-error/10 text-error',
        info: 'border-info/30 bg-info/10 text-info',
        accent: 'border-accent-border bg-accent-subtle text-accent',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  variant,
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { badgeVariants };
