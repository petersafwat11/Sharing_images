import { CalendarClock, Eye, HardDrive, Maximize2 } from 'lucide-react';
import type { Image } from '@picflow/shared';
import { Badge } from '@/components/ui/badge';
import {
  formatBytes,
  formatDimensions,
  formatRelativeTime,
  formatViews,
} from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface ImageStatsProps {
  image: Pick<
    Image,
    'size' | 'width' | 'height' | 'views' | 'createdAt'
  >;
  className?: string;
  variant?: 'row' | 'stacked';
}

/**
 * Compact row of stat badges — size / dimensions / views / uploaded-at.
 * `variant="stacked"` is used on the image view sidebar; `row` is for
 * dashboard cards and inline displays.
 */
export function ImageStats({
  image,
  className,
  variant = 'row',
}: ImageStatsProps): React.ReactElement {
  const dimensions = formatDimensions(image.width, image.height);

  const items = [
    { icon: HardDrive, label: formatBytes(image.size) },
    dimensions ? { icon: Maximize2, label: dimensions } : null,
    { icon: Eye, label: `${formatViews(image.views)} views` },
    { icon: CalendarClock, label: formatRelativeTime(image.createdAt) },
  ].filter((x): x is { icon: typeof HardDrive; label: string } => !!x);

  if (variant === 'stacked') {
    return (
      <dl className={cn('flex flex-col gap-2', className)}>
        {items.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-body text-text-secondary"
          >
            <Icon className="h-3.5 w-3.5 text-text-tertiary" aria-hidden />
            {label}
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {items.map(({ icon: Icon, label }) => (
        <Badge
          key={label}
          variant="default"
          className="gap-1 normal-case tracking-normal"
        >
          <Icon className="h-3 w-3" aria-hidden />
          <span className="font-sans text-[11px]">{label}</span>
        </Badge>
      ))}
    </div>
  );
}
