import Link from 'next/link';

/**
 * Secondary nav links in the header — Themes and Gallery.
 * Hidden on mobile to keep the header clean.
 */
export function HeaderNavLinks(): React.ReactElement {
  return (
    <nav className="hidden items-center gap-4 sm:flex" aria-label="Site navigation">
      <Link
        href="/themes"
        className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        Themes
      </Link>
      <Link
        href="/gallery"
        className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
      >
        Gallery
      </Link>
    </nav>
  );
}
