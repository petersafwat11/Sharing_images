'use client';

import { Check, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils/cn';

interface CopyLinkButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  url: string;
  label?: string;
  copiedLabel?: string;
}

/**
 * Copies `url` on click and animates a check-mark with "Copied!" label
 * for 2 seconds (§7). Used on UploadSuccessCard, ImageViewer, and the
 * ImageCard hover overlay.
 */
export function CopyLinkButton({
  url,
  label = 'Copy link',
  copiedLabel = 'Copied!',
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: CopyLinkButtonProps): React.ReactElement {
  const { copy, copied } = useCopyToClipboard();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn('relative', className)}
      onClick={() => {
        void copy(url);
      }}
      aria-live="polite"
      {...rest}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Check className="h-4 w-4" aria-hidden />
            {copiedLabel}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
