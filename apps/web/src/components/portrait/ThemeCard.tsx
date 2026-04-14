'use client';

import { motion } from 'framer-motion';
import type { Theme } from '@picflow/shared';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils/cn';

interface ThemeCardProps {
  theme: Theme;
  selected: boolean;
  onSelect: () => void;
}

export function ThemeCard({ theme, selected, onSelect }: ThemeCardProps): React.ReactElement {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        selected
          ? 'border-accent shadow-[0_0_0_1px_rgba(139,92,246,0.4)]'
          : 'border-border-default hover:border-border-strong',
      )}
      aria-pressed={selected}
    >
      <AspectRatio ratio={3 / 4}>
        {/* Preview image */}
        {theme.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={theme.previewUrl}
            alt={theme.name}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-bg-elevated" />
        )}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          {/* Top badges */}
          <div className="flex items-start justify-between gap-1">
            <Badge variant="default" className="capitalize backdrop-blur-sm">
              {theme.category}
            </Badge>
            {theme.free && (
              <Badge variant="success" className="backdrop-blur-sm">Free</Badge>
            )}
          </div>

          {/* Bottom: name */}
          <p className="text-sm font-medium leading-tight text-white drop-shadow-md">
            {theme.name}
          </p>
        </div>

        {/* Selected check */}
        {selected && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 12 12"
              aria-hidden
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </AspectRatio>
    </motion.button>
  );
}
