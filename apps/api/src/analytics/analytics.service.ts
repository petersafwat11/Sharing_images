import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

// Redis key pattern: analytics:{themeSlug}:{YYYY-MM-DD}:{field}
// field = starts | completions | failures

function todayKey(themeSlug: string, field: string): string {
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `analytics:${themeSlug}:${date}:${field}`;
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async trackStart(themeSlug: string): Promise<void> {
    await this.redis.incr(todayKey(themeSlug, 'starts'));
  }

  async trackCompletion(themeSlug: string): Promise<void> {
    await this.redis.incr(todayKey(themeSlug, 'completions'));
  }

  async trackFailure(themeSlug: string): Promise<void> {
    await this.redis.incr(todayKey(themeSlug, 'failures'));
  }

  /**
   * Returns the last N days of aggregated stats across all themes.
   * For admin dashboard use — not cached.
   */
  async getDashboardStats(days = 7): Promise<{
    totalGenerations: number;
    totalCompletions: number;
    totalFailures: number;
    byTheme: Array<{ themeSlug: string; starts: number; completions: number; failures: number }>;
    recentPortraits: number;
    totalUsers: number;
  }> {
    const since = new Date(Date.now() - days * 86_400_000);

    const [rows, recentPortraits, totalUsers] = await Promise.all([
      this.prisma.themeAnalytics.findMany({
        where: { date: { gte: since } },
        select: { themeSlug: true, starts: true, completions: true, failures: true },
      }),
      this.prisma.portrait.count({ where: { createdAt: { gte: since } } }),
      this.prisma.user.count(),
    ]);

    const byTheme = new Map<string, { starts: number; completions: number; failures: number }>();
    for (const row of rows) {
      const prev = byTheme.get(row.themeSlug) ?? { starts: 0, completions: 0, failures: 0 };
      byTheme.set(row.themeSlug, {
        starts: prev.starts + row.starts,
        completions: prev.completions + row.completions,
        failures: prev.failures + row.failures,
      });
    }

    const totals = [...byTheme.values()].reduce(
      (acc, v) => ({
        starts: acc.starts + v.starts,
        completions: acc.completions + v.completions,
        failures: acc.failures + v.failures,
      }),
      { starts: 0, completions: 0, failures: 0 },
    );

    return {
      totalGenerations: totals.starts,
      totalCompletions: totals.completions,
      totalFailures: totals.failures,
      byTheme: [...byTheme.entries()]
        .map(([themeSlug, v]) => ({ themeSlug, ...v }))
        .sort((a, b) => b.starts - a.starts),
      recentPortraits,
      totalUsers,
    };
  }

  /**
   * Flush today's Redis counters into ThemeAnalytics rows.
   * Called by a BullMQ repeatable job every hour.
   */
  async flushTodayCounters(themeSlugs: string[]): Promise<void> {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    const dateStr = date.toISOString().slice(0, 10);

    await Promise.all(
      themeSlugs.map(async (slug) => {
        const [startsStr, completionsStr, failuresStr] = await Promise.all([
          this.redis.get(`analytics:${slug}:${dateStr}:starts`),
          this.redis.get(`analytics:${slug}:${dateStr}:completions`),
          this.redis.get(`analytics:${slug}:${dateStr}:failures`),
        ]);

        const starts = parseInt(startsStr ?? '0', 10);
        const completions = parseInt(completionsStr ?? '0', 10);
        const failures = parseInt(failuresStr ?? '0', 10);

        if (starts === 0 && completions === 0 && failures === 0) return;

        await this.prisma.themeAnalytics.upsert({
          where: { themeSlug_date: { themeSlug: slug, date } },
          update: { starts, completions, failures },
          create: { themeSlug: slug, date, starts, completions, failures },
        });
      }),
    );
  }
}
