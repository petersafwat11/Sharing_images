import * as React from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Input primitive — §3.4. Kept tiny; forms use react-hook-form.
 * Not part of the "approved shadcn list" but required to render forms
 * consistently with the design system. Recorded in CLAUDE.md §12.
 */
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type = 'text', ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      'flex h-9 w-full rounded-md border border-border-default bg-bg-subtle px-3 py-1 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-caption font-medium text-text-secondary',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
