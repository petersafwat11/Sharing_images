import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { PRESIGNED_URL_TTL_SECONDS } from '@picflow/shared';
import { AppConfigService } from '../config/app-config.service';

export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}

/**
 * Thin abstraction around AWS S3 (will migrate to Cloudflare R2 later).
 * Nothing outside this service should touch `@aws-sdk/*` directly.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: AppConfigService) {
    const region = config.get('AWS_REGION');
    this.client = new S3Client({
      region,
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucket = config.get('AWS_S3_BUCKET');
    this.publicBaseUrl = `https://${this.bucket}.s3.${region}.amazonaws.com`;
  }

  async presignPut(
    key: string,
    mimeType: string,
    ttlSeconds: number = PRESIGNED_URL_TTL_SECONDS,
  ): Promise<PresignedUpload> {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });
    const uploadUrl = await getSignedUrl(this.client, cmd, {
      expiresIn: ttlSeconds,
    });
    return {
      uploadUrl,
      key,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    };
  }

  async headObject(key: string): Promise<{ size: number; mimeType?: string } | null> {
    try {
      const res = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        size: res.ContentLength ?? 0,
        mimeType: res.ContentType,
      };
    } catch (err) {
      this.logger.debug(`HeadObject miss for ${key}: ${String(err)}`);
      return null;
    }
  }

  async getObjectBuffer(key: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    if (!res.Body) {
      throw new Error(`S3 object has no body: ${key}`);
    }
    const chunks: Buffer[] = [];
    // AWS SDK v3 returns a web stream in Node runtime; transformToByteArray handles both.
    const bytes = await res.Body.transformToByteArray();
    chunks.push(Buffer.from(bytes));
    return Buffer.concat(chunks);
  }

  async putObject(
    key: string,
    body: Buffer,
    mimeType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async deleteObjects(keys: ReadonlyArray<string | null | undefined>): Promise<void> {
    const real = keys.filter((k): k is string => !!k);
    await Promise.all(real.map((k) => this.deleteObject(k)));
  }

  publicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }
}
