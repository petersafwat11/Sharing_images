'use client';

import { useState } from 'react';
import Link from 'next/link';
import { THEMES, type Theme } from '@picflow/shared';
import { ThemeCard } from '@/components/portrait/ThemeCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'classic', label: 'Classic' },
  { value: 'nature', label: 'Nature' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'seasonal', label: 'Seasonal' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'cultural', label: 'Cultural' },
] as const;

type CategoryValue = (typeof CATEGORIES)[number]['value'];

export function ThemesView(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState<CategoryValue>('all');

  const filtered: Theme[] =
    activeCategory === 'all'
      ? THEMES
      : THEMES.filter((t) => t.category === activeCategory);

  return (
    <PageContainer className="py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
          Portrait Themes
        </h1>
        <p className="text-body text-text-secondary">
          {THEMES.length} styles to choose from.{' '}
          <Link href="/create" className="text-accent underline-offset-2 hover:underline">
            Start creating
          </Link>{' '}
          and pick a theme in step 2.
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-6 overflow-x-auto">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as CategoryValue)}>
          <TabsList className="inline-flex w-max">
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Themes grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filtered.map((theme) => (
          <Link key={theme.slug} href={`/create?theme=${theme.slug}`}>
            <ThemeCard
              theme={theme}
              selected={false}
              onSelect={() => { /* handled by Link href */ }}
            />
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-body text-text-secondary">
          No themes in this category yet.
        </p>
      )}
    </PageContainer>
  );
}
