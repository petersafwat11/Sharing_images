'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Zap, CheckCircle, XCircle } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getDashboardStats } from '@/lib/api/analytics';
import { getAuthToken } from '@/lib/api/client';
import { getTheme } from '@picflow/shared';

const DAY_OPTIONS = [7, 14, 30, 90] as const;
type Days = (typeof DAY_OPTIONS)[number];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
}): React.ReactElement {
  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-5">
      <div className="flex items-start justify-between">
        <p className="text-caption text-text-tertiary">{label}</p>
        <Icon className="h-4 w-4 text-text-tertiary" aria-hidden />
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{value}</p>
      {sub && <p className="mt-0.5 text-caption text-text-tertiary">{sub}</p>}
    </div>
  );
}

export function AdminDashboardView(): React.ReactElement {
  const [days, setDays] = useState<Days>(7);
  const hasToken = typeof window !== 'undefined' && !!getAuthToken();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => getDashboardStats(days),
    enabled: hasToken,
    retry: false,
  });

  if (!hasToken) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-text-secondary">You must be logged in to view the admin dashboard.</p>
          <Button asChild>
            <Link href="/auth/login?redirect=/dashboard/admin">Log in</Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer className="py-10 sm:py-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-body text-error">Access denied or server error.</p>
        </div>
      </PageContainer>
    );
  }

  const completionRate =
    data && data.totalGenerations > 0
      ? Math.round((data.totalCompletions / data.totalGenerations) * 100)
      : 0;

  return (
    <PageContainer className="py-10 sm:py-16">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-page-title font-semibold tracking-tight text-text-primary">
            Admin Dashboard
          </h1>
          <p className="text-body text-text-secondary">Generation analytics and usage stats.</p>
        </div>

        {/* Day range selector */}
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as Days)}>
          <TabsList>
            {DAY_OPTIONS.map((d) => (
              <TabsTrigger key={d} value={String(d)}>
                {d}d
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Overview stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Zap}
              label="Generations started"
              value={data.totalGenerations}
              sub={`Last ${days} days`}
            />
            <StatCard
              icon={CheckCircle}
              label="Completed"
              value={data.totalCompletions}
              sub={`${completionRate}% completion rate`}
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={data.totalFailures}
              sub={`${data.totalGenerations > 0 ? Math.round((data.totalFailures / data.totalGenerations) * 100) : 0}% failure rate`}
            />
            <StatCard
              icon={Users}
              label="Total users"
              value={data.totalUsers}
              sub={`${data.recentPortraits} portraits this period`}
            />
          </div>

          {/* Theme breakdown */}
          {data.byTheme.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 font-display text-section font-medium text-text-primary">
                Theme performance
              </h2>
              <div className="overflow-hidden rounded-xl border border-border-default">
                <div className="grid grid-cols-4 border-b border-border-default bg-bg-subtle px-4 py-3 text-caption font-medium uppercase tracking-wide text-text-tertiary">
                  <span>Theme</span>
                  <span className="text-right">Starts</span>
                  <span className="text-right">Done</span>
                  <span className="text-right">Failed</span>
                </div>
                {data.byTheme.slice(0, 20).map((row, i) => {
                  const theme = getTheme(row.themeSlug);
                  return (
                    <div
                      key={row.themeSlug}
                      className={`grid grid-cols-4 items-center px-4 py-3 ${i < data.byTheme.length - 1 ? 'border-b border-border-default' : ''}`}
                    >
                      <span className="text-sm text-text-secondary">
                        {theme?.name ?? row.themeSlug}
                      </span>
                      <span className="text-right font-mono text-sm text-text-primary">
                        {row.starts}
                      </span>
                      <span className="text-right font-mono text-sm text-success">
                        {row.completions}
                      </span>
                      <span className="text-right font-mono text-sm text-error">
                        {row.failures}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* Analytics note */}
      <p className="mt-8 text-caption text-text-tertiary">
        <BarChart3 className="mr-1.5 inline h-3.5 w-3.5" aria-hidden />
        Stats are flushed from Redis to Postgres periodically. May lag by up to 1 hour.
      </p>
    </PageContainer>
  );
}
