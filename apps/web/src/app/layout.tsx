import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { fontVariables } from '@/lib/fonts';
import { config } from '@/lib/config';
import { cn } from '@/lib/utils/cn';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(config.appUrl),
  title: {
    default: 'Picflow — Drop it. Share it.',
    template: '%s · Picflow',
  },
  description:
    'A clean, fast image hosting and sharing platform. Drop an image, get a shareable link instantly.',
  openGraph: {
    title: 'Picflow — Drop it. Share it.',
    description:
      'A clean, fast image hosting and sharing platform. Drop an image, get a shareable link instantly.',
    type: 'website',
    url: config.appUrl,
    siteName: 'Picflow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Picflow',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en" className={cn('dark', fontVariables)}>
      <body className="flex min-h-screen flex-col bg-bg-base text-text-primary antialiased">
        <QueryProvider>
          <TooltipProvider delayDuration={200}>
            <Header />
            <main className="flex-1 animate-fade-in">{children}</main>
            <Footer />
            <ToastProvider />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
