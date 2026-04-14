import type { PortraitStatus } from '@prisma/client';

export interface PortraitResultItem {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
  blurHash: string | null;
  sortOrder: number;
}

export interface PortraitStatusResponse {
  shareSlug: string;
  status: PortraitStatus;
  themeSlug: string;
  createdAt: Date;
  results: PortraitResultItem[];
}

export interface StartPortraitResponse {
  shareSlug: string;
  status: 'PENDING';
}
