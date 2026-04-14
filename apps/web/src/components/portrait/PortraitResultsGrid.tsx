'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PortraitResultCard } from './PortraitResultCard';
import { PrintOrderSheet } from './PrintOrderSheet';
import type { PortraitResultItem } from '@/lib/api/portraits';

interface PortraitResultsGridProps {
  results: PortraitResultItem[];
}

export function PortraitResultsGrid({ results }: PortraitResultsGridProps): React.ReactElement {
  const [printResultId, setPrintResultId] = useState<string | null>(null);
  const printResult = results.find((r) => r.id === printResultId) ?? null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="grid grid-cols-2 gap-3 sm:gap-4"
      >
        {results.map((result, i) => (
          <PortraitResultCard
            key={result.id}
            result={result}
            index={i}
            onPrint={() => setPrintResultId(result.id)}
          />
        ))}
      </motion.div>

      <PrintOrderSheet
        open={!!printResult}
        onClose={() => setPrintResultId(null)}
        result={printResult}
      />
    </>
  );
}
