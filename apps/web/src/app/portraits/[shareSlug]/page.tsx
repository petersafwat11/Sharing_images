import type { Metadata } from 'next';
import { PortraitPageView } from './PortraitPageView';

interface Props {
  params: Promise<{ shareSlug: string }>;
}

export async function generateMetadata({ params: _params }: Props): Promise<Metadata> {
  return {
    title: 'Your portraits — Picflow',
    description: 'AI baby portraits created on Picflow. Download, share, or send as a gift.',
    openGraph: {
      title: 'AI Baby Portraits — Picflow',
      description: 'Turn simple baby photos into stunning AI portraits.',
      type: 'website',
    },
  };
}

export default async function PortraitPage({ params }: Props): Promise<React.ReactElement> {
  const { shareSlug } = await params;
  return <PortraitPageView shareSlug={shareSlug} />;
}
