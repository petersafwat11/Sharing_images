import { apiClient, unwrap } from './client';

export interface DashboardStats {
  totalGenerations: number;
  totalCompletions: number;
  totalFailures: number;
  byTheme: Array<{ themeSlug: string; starts: number; completions: number; failures: number }>;
  recentPortraits: number;
  totalUsers: number;
}

export async function getDashboardStats(days = 7): Promise<DashboardStats> {
  const res = await apiClient.get<{ data: DashboardStats }>(
    `/admin/analytics?days=${days}`,
  );
  return unwrap(res.data);
}
