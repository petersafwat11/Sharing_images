import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

export interface GalleryPortrait {
  shareSlug: string;
  themeSlug: string;
  createdAt: string;
  thumbnailUrl: string;
  blurHash: string | null;
  width: number | null;
  height: number | null;
}

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async getPublicPortraits(opts: {
    themeSlug?: string;
    cursor?: string;
    take?: number;
  }): Promise<{ portraits: GalleryPortrait[]; nextCursor: string | null }> {
    const take = Math.min(opts.take ?? 24, 48);

    const portraits = await this.prisma.portrait.findMany({
      where: {
        isPublic: true,
        status: 'DONE',
        ...(opts.themeSlug ? { themeSlug: opts.themeSlug } : {}),
        ...(opts.cursor ? { createdAt: { lt: new Date(opts.cursor) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      select: {
        shareSlug: true,
        themeSlug: true,
        createdAt: true,
        results: {
          where: { sortOrder: 0 },
          take: 1,
          select: { s3Key: true, blurHash: true, width: true, height: true },
        },
      },
    });

    const hasMore = portraits.length > take;
    const page = hasMore ? portraits.slice(0, take) : portraits;
    const lastPage = page[page.length - 1];
    const nextCursor = hasMore && lastPage ? lastPage.createdAt.toISOString() : null;

    const mapped: GalleryPortrait[] = [];
    for (const p of page) {
      const result = p.results[0];
      if (!result) continue;
      mapped.push({
        shareSlug: p.shareSlug,
        themeSlug: p.themeSlug,
        createdAt: p.createdAt.toISOString(),
        thumbnailUrl: this.storage.publicUrl(result.s3Key),
        blurHash: result.blurHash,
        width: result.width,
        height: result.height,
      });
    }

    return { portraits: mapped, nextCursor };
  }

  async setPublic(shareSlug: string, userId: string | null, isPublic: boolean): Promise<void> {
    const portrait = await this.prisma.portrait.findUnique({
      where: { shareSlug },
      select: { id: true, userId: true },
    });
    if (!portrait) return;
    // Only the owner (or anonymous portrait's current session) can toggle
    if (portrait.userId && userId && portrait.userId !== userId) return;

    await this.prisma.portrait.update({
      where: { shareSlug },
      data: { isPublic },
      select: { id: true },
    });
  }
}
