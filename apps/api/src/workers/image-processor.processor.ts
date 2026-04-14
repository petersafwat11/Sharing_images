import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { QUEUE_NAMES, THUMBNAIL_WIDTH_PX } from '@picflow/shared';
import { encode as encodeBlurhash } from 'blurhash';
import type { Job } from 'bullmq';
import sharp from 'sharp';
import { ImagesService } from '../images/images.service';
import { StorageService } from '../storage/storage.service';
import type { ImageProcessingJob } from '../upload/upload.service';

/**
 * BullMQ consumer: generates thumbnail + webp + blurhash for each image.
 * Runs inside the same NestJS app as the HTTP server in dev, but in
 * production can be started separately via `start:worker` — the queue
 * name is shared.
 */
@Processor(QUEUE_NAMES.IMAGE_PROCESSING)
export class ImageProcessorProcessor {
  private readonly logger = new Logger(ImageProcessorProcessor.name);

  constructor(
    private readonly storage: StorageService,
    private readonly images: ImagesService,
  ) {}

  @Process(QUEUE_NAMES.IMAGE_PROCESSING)
  async handle(job: Job<ImageProcessingJob>): Promise<void> {
    const { imageId, key } = job.data;
    this.logger.log(`Processing imageId=${imageId} key=${key}`);

    const buffer = await this.storage.getObjectBuffer(key);
    const base = sharp(buffer, { failOn: 'none' });
    const metadata = await base.metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;

    const [thumbBuffer, webpBuffer, blurHash] = await Promise.all([
      sharp(buffer)
        .resize({ width: THUMBNAIL_WIDTH_PX, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer(),
      sharp(buffer).webp({ quality: 85 }).toBuffer(),
      this.computeBlurHash(buffer),
    ]);

    const thumbKey = this.derivedKey(key, 'thumb.webp');
    const webpKey = this.derivedKey(key, 'full.webp');

    await Promise.all([
      this.storage.putObject(thumbKey, thumbBuffer, 'image/webp'),
      this.storage.putObject(webpKey, webpBuffer, 'image/webp'),
    ]);

    await this.images.applyProcessingResult(imageId, {
      width,
      height,
      thumbKey,
      webpKey,
      blurHash,
    });

    this.logger.log(`Finished imageId=${imageId}`);
  }

  private async computeBlurHash(buffer: Buffer): Promise<string> {
    const { data, info } = await sharp(buffer)
      .raw()
      .ensureAlpha()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    // 4×3 component blurhash is a good balance between size and fidelity.
    return encodeBlurhash(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4,
      3,
    );
  }

  private derivedKey(originalKey: string, suffix: string): string {
    const idx = originalKey.lastIndexOf('/');
    const dir = idx === -1 ? '' : originalKey.slice(0, idx);
    return dir ? `${dir}/${suffix}` : suffix;
  }
}
