import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = { title: 'Dashboard' };

// Auth gating is handled client-side (JWT lives in localStorage per
// CLAUDE.md §12 deviation). Server-side redirect will return in Phase 5
// if we move to httpOnly cookies.
export default function DashboardPage(): React.ReactElement {
  return <DashboardView />;
}
