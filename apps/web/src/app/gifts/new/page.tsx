import type { Metadata } from 'next';
import { GiftNewView } from './GiftNewView';

export const metadata: Metadata = {
  title: 'Send as gift — Picflow',
  description: 'Send your AI baby portrait as a beautiful gift to someone special.',
};

export default function GiftNewPage(): React.ReactElement {
  return <GiftNewView />;
}
