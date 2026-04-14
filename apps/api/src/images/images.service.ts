import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  IMAGE_CACHE_TTL_SECONDS,
  USER_IMAGES_CACHE_TTL_SECONDS,
  VIEW_TRACKED_SET_KEY,
  type Image,
  type ImageListResponse,
  type SortKey,
} from '@picflow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';

const IMAGE_SELECT = {
  id: true,
  slug: true,
  filename: true,
  mimeType: true,
  size: true,
  width: true,
  height: true,
  originalKey: true,
  thumbKey: true,
  webpKey: true,
  blurHash: true,
  views: true,
  isPublic: true,
  userId: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

type ImageRow = Prisma.ImageGetPayload<{ select: typeof IMAGE_SELECT }>;

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
    private readonly users: UsersService,
  ) {}

  async getBySlug(slug: string): Promise<Image> {
    const cacheKey = `img:${slug}`;
    const cached = await this.redis.getJSON<Image>(cacheKey);
    if (cached) {
      await this.bumpViewCounter(slug);
      return cached;
    }

    const row = await this.prisma.image.findUnique({
      where: { slug },
      select: IMAGE_SELECT,
    });
    if (!row) throw new NotFoundException('Image not found');

    const dto = this.toDto(row);
    await this.redis.setJSON(cacheKey, dto, IMAGE_CACHE_TTL_SECONDS);
    await this.bumpViewCounter(slug);
    return dto;
  }

  async listForUser(
    userId: string,
    page: number,
    pageSize: number,
    sort: SortKey,
  ): Promise<ImageListResponse> {
    const cacheKey = `user-imgs:${userId}:page:${page}:size:${pageSize}:sort:${sort}`;
    const cached = await this.redis.getJSON<ImageListResponse>(cacheKey);
    if (cached) return cached;

    const orderBy = this.resolveSort(sort);

    const [rows, total] = await Promise.all([
      this.prisma.image.findMany({
        where: { userId },
        select: IMAGE_SELECT,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.image.count({ where: { userId } }),
    ]);

    const response: ImageListResponse = {
      items: rows.map((r) => this.toDto(r)),
      page,
      pageSize,
      total,
    };

    await this.redis.setJSON(
      cacheKey,
      response,
      USER_IMAGES_CACHE_TTL_SECONDS,
    );
    return response;
  }

  async deleteById(id: string, requestingUserId: string): Promise<void> {
    const image = await this.prisma.image.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        size: true,
        userId: true,
        originalKey: true,
        thumbKey: true,
        webpKey: true,
      },
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.userId !== requestingUserId) {
      throw new ForbiddenException('Not your image');
    }

    await this.storage.deleteObjects([
      image.originalKey,
      image.thumbKey,
      image.webpKey,
    ]);
    await this.prisma.image.delete({
      where: { id },
      select: { id: true },
    });
    await this.users.decrementStorageUsed(requestingUserId, image.size);

    await this.invalidateCacheFor(image.slug, requestingUserId);
  }

  /**
   * Called by the worker once Sharp has finished processing.
   */
  async applyProcessingResult(
    imageId: string,
    result: {
      width: number;
      height: number;
      thumbKey: string;
      webpKey: string;
      blurHash: string;
    },
  ): Promise<void> {
    const updated = await this.prisma.image.update({
      where: { id: imageId },
      data: result,
      select: { slug: true, userId: true },
    });
    await this.invalidateCacheFor(updated.slug, updated.userId);
  }

  /**
   * Flushed by the view-flusher loop; safe to call externally for testing.
   */
  async flushViewCounter(slug: string): Promise<void> {
    const key = `img:views:${slug}`;
    const raw = await this.redis.get(key);
    if (!raw) return;
    const delta = Number.parseInt(raw, 10);
    if (!Number.isFinite(delta) || delta <= 0) return;

    await this.redis.del(key);
    await this.prisma.image.update({
      where: { slug },
      data: { views: { increment: delta } },
      select: { id: true },
    });
  }

  private async bumpViewCounter(slug: string): Promise<void> {
    try {
      const client = this.redis.raw;
      // Pipeline so the tracked-set write doesn't double the round-trip.
      await client
        .multi()
        .incr(`img:views:${slug}`)
        .sadd(VIEW_TRACKED_SET_KEY, slug)
        .exec();
    } catch (err) {
      this.logger.warn(`View increment failed for ${slug}: ${String(err)}`);
    }
  }

  /**
   * Iterates every slug currently tracked in Redis and flushes its
   * counter to Postgres. Called by the view-flush BullMQ repeatable
   * job — see workers/view-flush.processor.ts.
   */
  async flushAllTrackedViews(): Promise<{ flushed: number }> {
    const client = this.redis.raw;
    // SPOP atomically removes + returns up to N members; safe under
    // concurrent flushers.
    const slugs = await client.spop(VIEW_TRACKED_SET_KEY, 500);
    if (!slugs || slugs.length === 0) return { flushed: 0 };

    let flushed = 0;
    for (const slug of slugs) {
      try {
        await this.flushViewCounter(slug);
        flushed += 1;
      } catch (err) {
        this.logger.warn(`Flush failed for ${slug}: ${String(err)}`);
        // Re-add so the next pass retries it. Better than dropping the count.
        await client.sadd(VIEW_TRACKED_SET_KEY, slug);
      }
    }
    return { flushed };
  }

  private resolveSort(
    sort: SortKey,
  ): Prisma.ImageOrderByWithRelationInput {
    switch (sort) {
      case 'oldest':
        return { createdAt: 'asc' };
      case 'most-viewed':
        return { views: 'desc' };
      case 'largest':
        return { size: 'desc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }

  private async invalidateCacheFor(
    slug: string,
    userId: string | null,
  ): Promise<void> {
    const keys: string[] = [`img:${slug}`];
    if (userId) {
      // User list cache uses composite keys; clear them with a scan.
      const pattern = `user-imgs:${userId}:*`;
      const client = this.redis.raw;
      const found = await client.keys(pattern);
      keys.push(...found);
    }
    await this.redis.del(...keys);
  }

  private toDto(row: ImageRow): Image {
    return {
      id: row.id,
      slug: row.slug,
      filename: row.filename,
      mimeType: row.mimeType,
      size: row.size,
      width: row.width,
      height: row.height,
      originalUrl: this.storage.publicUrl(row.originalKey),
      thumbUrl: row.thumbKey ? this.storage.publicUrl(row.thumbKey) : null,
      webpUrl: row.webpKey ? this.storage.publicUrl(row.webpKey) : null,
      blurHash: row.blurHash,
      views: row.views,
      isPublic: row.isPublic,
      userId: row.userId,
      expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
