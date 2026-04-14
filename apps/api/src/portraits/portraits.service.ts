import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bullmq';
import { customAlphabet } from 'nanoid';
import sharp from 'sharp';
import { encode as encodeBlurhash } from 'blurhash';
import {
  QUEUE_NAMES,
  MIN_PORTRAIT_INPUTS,
  MAX_PORTRAIT_INPUTS,
  PORTRAIT_NUM_OUTPUTS,
  PORTRAIT_EXPIRY_DAYS_ANONYMOUS,
  THEME_SLUGS,
} from '@picflow/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { AnalyticsService } from '../analytics/analytics.service';
import type { PortraitStatusResponse, StartPortraitResponse } from './dto/portrait-response.dto';

export interface PortraitJob {
  portraitId: string;
  themeSlug: string;
  inputKeys: string[];
  userId: string | null;
  email: string | null;
}

const SLUG_ALPHABET =
  '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
const generateSlug = customAlphabet(SLUG_ALPHABET, 8);

@Injectable()
export class PortraitsService {
  private readonly logger = new Logger(PortraitsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly analytics: AnalyticsService,
    @InjectQueue(QUEUE_NAMES.PORTRAIT_GENERATION)
    private readonly queue: Queue<PortraitJob>,
  ) {}

  async startPortrait(opts: {
    themeSlug: string;
    inputKeys: string[];
    userId: string | null;
    email: string | null;
  }): Promise<StartPortraitResponse> {
    const { themeSlug, inputKeys, userId, email } = opts;

    if (!THEME_SLUGS.has(themeSlug)) {
      throw new BadRequestException(`Unknown theme: ${themeSlug}`);
    }
    if (inputKeys.length < MIN_PORTRAIT_INPUTS || inputKeys.length > MAX_PORTRAIT_INPUTS) {
      throw new BadRequestException(
        `Provide ${MIN_PORTRAIT_INPUTS}–${MAX_PORTRAIT_INPUTS} source images`,
      );
    }
    if (!userId && !email) {
      throw new BadRequestException('Email is required for anonymous generation');
    }

    const shareSlug = await this.generateUniqueSlug();
    const expiresAt = userId
      ? null
      : new Date(Date.now() + PORTRAIT_EXPIRY_DAYS_ANONYMOUS * 86_400_000);

    const portrait = await this.prisma.$transaction(async (tx) => {
      if (userId) {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { creditBalance: true },
        });
        if (!user || user.creditBalance < 1) {
          throw new BadRequestException('Insufficient credits');
        }
        await tx.user.update({
          where: { id: userId },
          data: { creditBalance: { decrement: 1 } },
        });
        await tx.creditTransaction.create({
          data: {
            userId,
            delta: -1,
            type: 'GENERATION',
            description: `Portrait — theme: ${themeSlug}`,
          },
        });
      }

      return tx.portrait.create({
        data: { shareSlug, userId, email, themeSlug, inputKeys, expiresAt },
        select: { id: true, shareSlug: true },
      });
    });

    await this.queue.add(
      QUEUE_NAMES.PORTRAIT_GENERATION,
      { portraitId: portrait.id, themeSlug, inputKeys, userId, email },
      { attempts: 1, removeOnComplete: true, removeOnFail: false },
    );

    void this.analytics.trackStart(themeSlug);

    return { shareSlug: portrait.shareSlug, status: 'PENDING' };
  }

  async getStatus(shareSlug: string): Promise<PortraitStatusResponse> {
    const portrait = await this.prisma.portrait.findUnique({
      where: { shareSlug },
      select: {
        shareSlug: true,
        status: true,
        themeSlug: true,
        createdAt: true,
        results: {
          select: { id: true, s3Key: true, width: true, height: true, blurHash: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!portrait) throw new NotFoundException('Portrait not found');

    return {
      shareSlug: portrait.shareSlug,
      status: portrait.status,
      themeSlug: portrait.themeSlug,
      createdAt: portrait.createdAt,
      results: portrait.results.map((r) => ({
        id: r.id,
        url: this.storage.publicUrl(r.s3Key),
        width: r.width,
        height: r.height,
        blurHash: r.blurHash,
        sortOrder: r.sortOrder,
      })),
    };
  }

  async getByReplicateId(replicateId: string): Promise<{
    id: string;
    status: string;
    userId: string | null;
    email: string | null;
    inputKeys: string[];
  } | null> {
    return this.prisma.portrait.findFirst({
      where: { replicateId },
      select: { id: true, status: true, userId: true, email: true, inputKeys: true },
    });
  }

  async setReplicateId(portraitId: string, replicateId: string): Promise<void> {
    await this.prisma.portrait.update({
      where: { id: portraitId },
      data: { replicateId, status: 'PROCESSING' },
      select: { id: true },
    });
  }

  /**
   * Idempotent — safe to call from both the polling worker and the webhook handler.
   * Only the first caller that wins the DB race actually processes results.
   */
  async processReplicateOutput(portraitId: string, outputUrls: string[]): Promise<void> {
    const portrait = await this.prisma.portrait.findUnique({
      where: { id: portraitId },
      select: { id: true, status: true, userId: true, email: true, shareSlug: true, inputKeys: true, themeSlug: true },
    });

    if (!portrait || portrait.status === 'DONE' || portrait.status === 'FAILED') return;

    const urls = outputUrls.slice(0, PORTRAIT_NUM_OUTPUTS);
    const processed = await Promise.all(
      urls.map(async (url, i) => {
        const buffer = await this.downloadBuffer(url);
        const key = `portraits/${portraitId}/result-${i}.webp`;
        const [, blurHash, meta] = await Promise.all([
          this.storage.putObject(key, buffer, 'image/webp'),
          this.computeBlurHash(buffer),
          sharp(buffer).metadata(),
        ]);
        return { s3Key: key, blurHash, width: meta.width ?? null, height: meta.height ?? null, sortOrder: i };
      }),
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.portrait.updateMany({
        where: { id: portraitId, status: { notIn: ['DONE', 'FAILED'] } },
        data: { status: 'DONE' },
      });
      if (count === 0) return 0;
      await Promise.all(
        processed.map((r) => tx.portraitResult.create({ data: { portraitId, ...r } })),
      );
      return count;
    });

    if (updated === 0) return; // Webhook + polling race — other path won

    await this.storage.deleteObjects(portrait.inputKeys);

    const emailTo = await this.resolveEmail(portrait);
    if (emailTo) {
      await this.email.sendPortraitsReady({ to: emailTo, shareSlug: portrait.shareSlug });
    }

    void this.analytics.trackCompletion(portrait.themeSlug ?? '');
    this.logger.log(`Portrait ${portraitId} completed with ${processed.length} results`);
  }

  async failPortrait(portraitId: string): Promise<void> {
    const portrait = await this.prisma.portrait.findUnique({
      where: { id: portraitId },
      select: { id: true, status: true, userId: true, inputKeys: true, themeSlug: true },
    });

    if (!portrait || portrait.status === 'DONE' || portrait.status === 'FAILED') return;

    await this.prisma.portrait.update({
      where: { id: portraitId },
      data: { status: 'FAILED' },
      select: { id: true },
    });

    if (portrait.userId) {
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: portrait.userId },
          data: { creditBalance: { increment: 1 } },
        }),
        this.prisma.creditTransaction.create({
          data: {
            userId: portrait.userId,
            delta: 1,
            type: 'REFUND',
            description: 'Generation failed — credit refunded',
            portraitId,
          },
        }),
      ]);
    }

    await this.storage.deleteObjects(portrait.inputKeys);
    void this.analytics.trackFailure(portrait.themeSlug ?? '');
    this.logger.warn(`Portrait ${portraitId} failed — credit refunded`);
  }

  private async resolveEmail(portrait: {
    email: string | null;
    userId: string | null;
  }): Promise<string | null> {
    if (portrait.email) return portrait.email;
    if (!portrait.userId) return null;
    const user = await this.prisma.user.findUnique({
      where: { id: portrait.userId },
      select: { email: true },
    });
    return user?.email ?? null;
  }

  private async generateUniqueSlug(attempts = 3): Promise<string> {
    for (let i = 0; i < attempts; i++) {
      const slug = generateSlug();
      const existing = await this.prisma.portrait.findUnique({
        where: { shareSlug: slug },
        select: { id: true },
      });
      if (!existing) return slug;
    }
    throw new Error('Failed to generate unique portrait slug');
  }

  private async downloadBuffer(url: string): Promise<Buffer> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed for ${url}: HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }

  private async computeBlurHash(buffer: Buffer): Promise<string> {
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });
    return encodeBlurhash(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
  }
}
