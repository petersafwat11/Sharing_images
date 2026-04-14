import type { Metadata } from 'next';
import { PricingView } from './PricingView';

export const metadata: Metadata = {
  title: 'Pricing — Picflow',
  description: 'Professional AI baby portraits. Pay only for what you generate.',
};

export default function PricingPage(): React.ReactElement {
  return <PricingView />;
}
