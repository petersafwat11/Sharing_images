import type { CreditPackId } from '@picflow/shared';
import { apiClient, unwrap } from './client';

export async function purchaseCredits(pack: CreditPackId): Promise<{ url: string }> {
  const res = await apiClient.post<{ data: { url: string } }>('/payments/checkout', { pack });
  return unwrap(res.data);
}
