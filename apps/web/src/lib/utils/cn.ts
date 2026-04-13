import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes deduplicating conflicts (`p-4 p-6` → `p-6`).
 * Use this helper instead of plain string concatenation for any
 * conditional Tailwind className.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
