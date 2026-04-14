import Link from 'next/link';
import { HeaderAuthSlot } from './HeaderAuthSlot';
import { HeaderNavLinks } from './HeaderNavLinks';

/**
 * Site-wide header. Logo on the left ("Picflow" in display font with
 * a small violet square mark per §7). Auth state lives in a client
 * component so the server layout itself stays static. Sticky w/
 * subtle blur — keeps the upload zone visually anchored.
 */
export function Header(): React.ReactElement {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border-default bg-bg-base/80 backdrop-blur supports-[backdrop-filter]:bg-bg-base/60">
      <div className="mx-auto flex h-14 w-full max-w-page items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          aria-label="Picflow home"
        >
          <span
            aria-hidden
            className="inline-block h-5 w-5 rounded-[4px] bg-accent transition-transform duration-150 group-hover:scale-105"
          />
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            Picflow
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <HeaderNavLinks />
          <HeaderAuthSlot />
        </div>
      </div>
    </header>
  );
}
