import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  MIME_TO_EXT,
  QUEUE_NAMES,
  SLUG_LENGTH,
  type AllowedMimeType,
  type ConfirmUploadResponse,
  type PresignResponse,
} from '@picflow/shared';
import { Queue } from 'bullmq';
import { customAlphabet } from 'nanoid';
import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UsersService } from '../users/users.service';

/**
 * Job payload consumed by image-processor.processor.ts.
 */
export interface ImageProcessingJob {
  imageId: string;
  key: string;
}

const SLUG_ALPHABET =
  'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const makeSlug = customAlphabet(SLUG_ALPHABET, SLUG_LENGTH);

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly storage: StorageService,
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly config: AppConfigService,
    @InjectQueue(QUEUE_NAMES.IMAGE_PROCESSING)
    private readonly imageQueue: Queue<ImageProcessingJob>,
  ) {}

  async createPresignedUpload(
    filename: string,
    mimeType: AllowedMimeType,
    _size: number,
    userId: string | null,
  ): Promise<PresignResponse> {
    // Generate slug + key. Retry up to 3 times on the (astronomically rare)
    // slug collision.
    let slug = makeSlug();
    for (let i = 0; i < 3; i += 1) {
      const existing = await this.prisma.image.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing) break;
      slug = makeSlug();
    }

    const ext = MIME_TO_EXT[mimeType];
    const key = this.buildObjectKey(userId, slug, ext);

    const { uploadUrl, expiresAt } = await this.storage.presignPut(
      key,
      mimeType,
    );

    this.logger.debug(
      `Presigned upload: slug=${slug} userId=${userId ?? 'anon'} size=${_size}`,
    );

    return {
      uploadUrl,
      slug,
      key,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async confirmUpload(
    key: string,
    slug: string,
    userId: string | null,
    filename: string | undefined,
    mimeType: AllowedMimeType | undefined,
  ): Promise<ConfirmUploadResponse> {
    const existing = await this.prisma.image.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException('Slug already confirmed');
    }

    const head = await this.storage.headObject(key);
    if (!head) {
      throw new NotFoundException(
        'Upload not found in storage — did the PUT succeed?',
      );
    }

    const resolvedFilename = filename ?? this.filenameFromKey(key);
    const resolvedMime = mimeType ?? head.mimeType ?? 'application/octet-stream';
    const size = head.size;

    const image = await this.prisma.image.create({
      data: {
        slug,
        filename: resolvedFilename,
        mimeType: resolvedMime,
        size,
        originalKey: key,
        userId,
      },
      select: { id: true },
    });

    if (userId) {
      await this.users.incrementStorageUsed(userId, size);
    }

    await this.imageQueue.add(
      QUEUE_NAMES.IMAGE_PROCESSING,
      { imageId: image.id, key },
      {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 200 },
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
      },
    );

    return {
      slug,
      shareUrl: `${this.config.get('NEXT_PUBLIC_APP_URL').replace(/\/+$/, '')}/i/${slug}`,
    };
  }

  private buildObjectKey(
    userId: string | null,
    slug: string,
    ext: string,
  ): string {
    const scope = userId ? `u/${userId}` : 'anon';
    return `${scope}/${slug}/original.${ext}`;
  }

  private filenameFromKey(key: string): string {
    const last = key.split('/').pop();
    return last ?? key;
  }
}
