import type { Metadata } from 'next';
import { GiftView } from './GiftView';

interface Props {
  params: { giftId: string };
}

export async function generateMetadata({ params: _params }: Props): Promise<Metadata> {
  return {
    title: 'You received a gift — Picflow',
    description: 'Someone sent you a beautiful AI baby portrait.',
    openGraph: {
      title: 'You received a gift!',
      description: 'View your AI baby portrait gift on Picflow.',
      type: 'website',
    },
  };
}

export default function GiftPage({ params }: Props): React.ReactElement {
  return <GiftView giftId={params.giftId} />;
}
