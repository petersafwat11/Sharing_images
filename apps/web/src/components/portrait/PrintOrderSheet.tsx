'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer } from 'lucide-react';
import type { PortraitResultItem } from '@/lib/api/portraits';

const PRINT_PRODUCTS = [
  { id: '5x7', label: '5\u00d77\u2033 Glossy', price: '$12.99', popular: false },
  { id: '8x10', label: '8\u00d710\u2033 Glossy', price: '$18.99', popular: true },
  { id: '11x14', label: '11\u00d714\u2033 Glossy', price: '$29.99', popular: false },
  { id: '12x12', label: '12\u00d712\u2033 Canvas', price: '$49.99', popular: false },
  { id: 'phone', label: 'Phone Case', price: '$24.99', popular: false },
] as const;

interface PrintOrderSheetProps {
  open: boolean;
  onClose: () => void;
  result: PortraitResultItem | null;
}

export function PrintOrderSheet({
  open,
  onClose,
  result: _result,
}: PrintOrderSheetProps): React.ReactElement {
  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-safe">
        <SheetHeader className="mb-2">
          <SheetTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-accent" aria-hidden />
            Order a print
          </SheetTitle>
          <SheetDescription>
            High-quality prints shipped worldwide by Gelato. Coming soon — join the waitlist.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          {PRINT_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-bg-subtle p-3 opacity-50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-primary">{product.label}</span>
                {product.popular && (
                  <Badge variant="default" className="text-[10px]">
                    Popular
                  </Badge>
                )}
              </div>
              <span className="font-mono text-sm text-text-secondary">{product.price}</span>
            </div>
          ))}
        </div>

        <Button className="mt-4 w-full" disabled>
          Notify me when prints are available
        </Button>
        <p className="text-center text-caption text-text-tertiary">
          Print ordering is in development. We&apos;ll email you when it launches.
        </p>
      </SheetContent>
    </Sheet>
  );
}
