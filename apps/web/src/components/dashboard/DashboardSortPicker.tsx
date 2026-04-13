'use client';

import { ChevronDown } from 'lucide-react';
import type { SortKey } from '@picflow/shared';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  oldest: 'Oldest',
  'most-viewed': 'Most viewed',
  largest: 'Largest',
};

const ORDER: SortKey[] = ['newest', 'oldest', 'most-viewed', 'largest'];

interface DashboardSortPickerProps {
  sort: SortKey;
  onChange: (next: SortKey) => void;
}

export function DashboardSortPicker({
  sort,
  onChange,
}: DashboardSortPickerProps): React.ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          {LABELS[sort]}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ORDER.map((key) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => onChange(key)}
            className={sort === key ? 'text-accent' : undefined}
          >
            {LABELS[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
