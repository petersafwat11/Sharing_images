'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHASES = [
  { maxSeconds: 25, copy: 'Analyzing your photos\u2026' },
  { maxSeconds: 50, copy: 'Painting the portrait\u2026' },
  { maxSeconds: 90, copy: 'Adding fine details\u2026' },
  { maxSeconds: 120, copy: 'Almost ready\u2026' },
  { maxSeconds: Infinity, copy: 'Just a few more seconds\u2026' },
];

function getPhase(elapsed: number): string {
  for (const p of PHASES) {
    if (elapsed < p.maxSeconds) return p.copy;
  }
  return PHASES[PHASES.length - 1].copy;
}

interface GeneratingScreenProps {
  startedAt: Date;
}

export function GeneratingScreen({ startedAt }: GeneratingScreenProps): React.ReactElement {
  const [elapsed, setElapsed] = useState(
    () => Math.floor((Date.now() - startedAt.getTime()) / 1000),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const copy = getPhase(elapsed);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      {/* Pulsing ring */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="h-20 w-20 rounded-full border-2 border-accent/30"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-14 w-14 rounded-full border-2 border-accent/60"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        />
        <div className="absolute h-5 w-5 rounded-full bg-accent" />
      </div>

      {/* Cycling copy */}
      <div className="h-7 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={copy}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-body font-medium text-text-primary"
          >
            {copy}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-caption text-text-tertiary">
        Usually takes 1–2 minutes. You can close this tab and come back — we&apos;ll email you when
        it&apos;s ready.
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  );
}
