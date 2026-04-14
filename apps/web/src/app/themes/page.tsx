import type { Metadata } from 'next';
import { ThemesView } from './ThemesView';

export const metadata: Metadata = {
  title: 'Portrait Themes — Picflow',
  description:
    'Browse 30+ AI portrait styles. From classic studio to fantasy and artistic themes. Click any style to start creating.',
  openGraph: {
    title: 'AI Portrait Themes — Picflow',
    description: 'Choose from 30+ stunning portrait styles.',
    type: 'website',
  },
};

export default function ThemesPage(): React.ReactElement {
  return <ThemesView />;
}
