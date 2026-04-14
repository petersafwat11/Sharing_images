import { apiClient, unwrap } from './client';
import type { PortraitResultItem } from './portraits';

export interface GiftResponse {
  id: string;
  recipientName: string;
  message: string | null;
  claimed: boolean;
  createdAt: string;
  portrait: {
    shareSlug: string;
    themeSlug: string;
    status: string;
    results: PortraitResultItem[];
  };
}

export async function createGift(opts: {
  portraitShareSlug: string;
  recipientName: string;
  message?: string;
}): Promise<{ id: string }> {
  const res = await apiClient.post<{ data: { id: string } }>('/gifts', opts);
  return unwrap(res.data);
}

export async function getGift(giftId: string): Promise<GiftResponse> {
  const res = await apiClient.get<{ data: GiftResponse }>(`/gifts/${giftId}`);
  return unwrap(res.data);
}
