import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GiftView } from './GiftView';

interface Props {
  params: Promise<{ giftId: string }>;
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

export default async function GiftPage({ params }: Props): Promise<React.ReactElement> {
  const { giftId } = await params;
  return (
    <Suspense fallback={null}>
      <GiftView giftId={giftId} />
    </Suspense>
  );
}
