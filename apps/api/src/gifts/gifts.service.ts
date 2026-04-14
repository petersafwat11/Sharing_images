import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

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
    results: Array<{
      id: string;
      url: string;
      width: number | null;
      height: number | null;
      blurHash: string | null;
      sortOrder: number;
    }>;
  };
}

@Injectable()
export class GiftsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async createGift(opts: {
    portraitShareSlug: string;
    userId: string | null;
    recipientName: string;
    message?: string;
  }): Promise<{ id: string }> {
    const portrait = await this.prisma.portrait.findUnique({
      where: { shareSlug: opts.portraitShareSlug },
      select: { id: true, userId: true, status: true },
    });

    if (!portrait) throw new NotFoundException('Portrait not found');
    if (portrait.status !== 'DONE') {
      throw new ForbiddenException('Portrait must be complete before gifting');
    }
    // Only the portrait owner (or anonymous flow) can create a gift
    if (portrait.userId && opts.userId && portrait.userId !== opts.userId) {
      throw new ForbiddenException('Not your portrait');
    }

    const gift = await this.prisma.gift.create({
      data: {
        portraitId: portrait.id,
        recipientName: opts.recipientName,
        message: opts.message ?? null,
      },
      select: { id: true },
    });

    return { id: gift.id };
  }

  async getGift(giftId: string): Promise<GiftResponse> {
    const gift = await this.prisma.gift.findUnique({
      where: { id: giftId },
      select: {
        id: true,
        recipientName: true,
        message: true,
        claimed: true,
        createdAt: true,
        portrait: {
          select: {
            shareSlug: true,
            themeSlug: true,
            status: true,
            results: {
              select: {
                id: true,
                s3Key: true,
                width: true,
                height: true,
                blurHash: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!gift) throw new NotFoundException('Gift not found');

    // Mark claimed on first view (fire-and-forget)
    if (!gift.claimed) {
      void this.prisma.gift.update({
        where: { id: giftId },
        data: { claimed: true, claimedAt: new Date() },
        select: { id: true },
      });
    }

    return {
      id: gift.id,
      recipientName: gift.recipientName,
      message: gift.message,
      claimed: gift.claimed,
      createdAt: gift.createdAt.toISOString(),
      portrait: {
        shareSlug: gift.portrait.shareSlug,
        themeSlug: gift.portrait.themeSlug,
        status: gift.portrait.status,
        results: gift.portrait.results.map((r) => ({
          id: r.id,
          url: this.storage.publicUrl(r.s3Key),
          width: r.width,
          height: r.height,
          blurHash: r.blurHash,
          sortOrder: r.sortOrder,
        })),
      },
    };
  }
}
