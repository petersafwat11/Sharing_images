'use client';

import { useState } from 'react';
import { THEMES } from '@picflow/shared';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ThemeCard } from './ThemeCard';

type Category = 'all' | 'classic' | 'nature' | 'fantasy' | 'seasonal' | 'artistic' | 'adventure' | 'cultural';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'classic', label: 'Classic' },
  { value: 'nature', label: 'Nature' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
];

interface ThemeGridProps {
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function ThemeGrid({ selectedSlug, onSelect }: ThemeGridProps): React.ReactElement {
  const [category, setCategory] = useState<Category>('all');

  const visible = category === 'all'
    ? THEMES
    : THEMES.filter((t) => t.category === category);

  return (
    <div>
      <Tabs value={category} onValueChange={(v) => setCategory(v as Category)}>
        {/* Scrollable tab bar on mobile */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={category} className="mt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visible.map((theme) => (
              <ThemeCard
                key={theme.slug}
                theme={theme}
                selected={selectedSlug === theme.slug}
                onSelect={() => onSelect(theme.slug)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
