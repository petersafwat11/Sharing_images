'use client';

import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { BlurImage } from '@/components/common/BlurImage';
import type { PortraitResultItem } from '@/lib/api/portraits';

interface PortraitResultCardProps {
  result: PortraitResultItem;
  index: number;
  onPrint?: () => void;
}

export function PortraitResultCard({
  result,
  index,
  onPrint,
}: PortraitResultCardProps): React.ReactElement {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const res = await fetch(result.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portrait-${index + 1}.webp`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border-default bg-bg-surface transition-colors duration-150 hover:border-border-strong">
      <AspectRatio ratio={3 / 4}>
        <BlurImage
          src={result.url}
          alt={`Portrait variant ${index + 1}`}
          blurHash={result.blurHash}
          width={result.width ?? 600}
          height={result.height ?? 800}
          className="h-full w-full object-cover"
        />
      </AspectRatio>

      {/* Overlay on hover */}
      <div className="absolute inset-0 flex flex-col items-center justify-end gap-2 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <div className="flex w-full gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="h-8 flex-1 gap-1.5 border-white/20 bg-black/60 text-white hover:bg-black/80"
            onClick={() => void handleDownload()}
            disabled={isDownloading}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            {isDownloading ? 'Saving…' : 'Download'}
          </Button>
          {onPrint && (
            <Button
              size="sm"
              variant="secondary"
              className="h-8 gap-1.5 border-white/20 bg-black/60 text-white hover:bg-black/80"
              onClick={onPrint}
              aria-label="Order print"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden />
            </Button>
          )}
        </div>
      </div>

      {/* Variant label */}
      <div className="absolute left-2 top-2">
        <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white/80">
          #{index + 1}
        </span>
      </div>
    </div>
  );
}
