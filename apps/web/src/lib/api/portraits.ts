import { apiClient, unwrap } from './client';

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
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
  themeSlug: string;
  createdAt: string;
  results: PortraitResultItem[];
}

export interface StartPortraitResponse {
  shareSlug: string;
  status: 'PENDING';
}

export async function startPortrait(opts: {
  themeSlug: string;
  inputKeys: string[];
  email?: string;
}): Promise<StartPortraitResponse> {
  const res = await apiClient.post<{ data: StartPortraitResponse }>(
    '/portraits/start',
    opts,
  );
  return unwrap(res.data);
}

export async function getPortraitStatus(
  shareSlug: string,
): Promise<PortraitStatusResponse> {
  const res = await apiClient.get<{ data: PortraitStatusResponse }>(
    `/portraits/${shareSlug}/status`,
  );
  return unwrap(res.data);
}
