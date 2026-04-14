import type { Metadata } from 'next';
import { AdminDashboardView } from './AdminDashboardView';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Picflow',
};

export default function AdminDashboardPage(): React.ReactElement {
  return <AdminDashboardView />;
}
