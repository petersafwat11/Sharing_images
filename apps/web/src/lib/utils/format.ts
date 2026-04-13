import { formatDistanceToNow, format as formatDate } from 'date-fns';

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** "1.2 MB" — base-1024, one decimal for anything above KB. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const decimals = exponent === 0 ? 0 : 1;
  return `${value.toFixed(decimals)} ${UNITS[exponent]}`;
}

/** Large view counts rendered compactly: 1,200 → "1.2k"; 3,400,000 → "3.4M". */
export function formatViews(count: number): string {
  if (count < 1_000) return String(count);
  if (count < 1_000_000) return `${(count / 1_000).toFixed(1)}k`;
  if (count < 1_000_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  return `${(count / 1_000_000_000).toFixed(1)}B`;
}

/** "2 days ago" / "3 minutes ago" — wraps date-fns with a safe parser. */
export function formatRelativeTime(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatDistanceToNow(parsed, { addSuffix: true });
}

/** "Apr 13, 2026" — absolute date for hover tooltips / sidebars. */
export function formatAbsoluteDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatDate(parsed, 'MMM d, yyyy');
}

/** Dimensions tag: "1920 × 1080". Returns null if width/height missing. */
export function formatDimensions(
  width: number | null,
  height: number | null,
): string | null {
  if (!width || !height) return null;
  return `${width} × ${height}`;
}
