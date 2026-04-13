import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Inter } from 'next/font/google';

// Body / UI — §3.2
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Display / headings + monospace slugs — §3.2
export const geistSans = GeistSans;
export const geistMono = GeistMono;

/**
 * Convenience string so the root layout can pass all three variables
 * to `<html>` without re-importing every time.
 */
export const fontVariables = [
  inter.variable,
  geistSans.variable,
  geistMono.variable,
].join(' ');
