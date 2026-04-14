import type { Metadata } from 'next';
import { GalleryView } from './GalleryView';

export const metadata: Metadata = {
  title: 'Portrait Gallery — Picflow',
  description:
    'Browse AI baby portraits created by the Picflow community. Filter by style and find inspiration.',
  openGraph: {
    title: 'AI Baby Portrait Gallery — Picflow',
    description: 'Community gallery of AI baby portraits. Browse styles and get inspired.',
    type: 'website',
  },
};

export default function GalleryPage(): React.ReactElement {
  return <GalleryView />;
}
