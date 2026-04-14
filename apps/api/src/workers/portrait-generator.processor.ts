import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import {
  PHOTOMAKER_MODEL_VERSION,
  PORTRAIT_GENERATION_TIMEOUT_MS,
  PORTRAIT_NUM_OUTPUTS,
  QUEUE_NAMES,
  REPLICATE_POLL_INTERVAL_MS,
  getTheme,
} from '@picflow/shared';
import {
  DetectModerationLabelsCommand,
  RekognitionClient,
} from '@aws-sdk/client-rekognition';
import type { Job } from 'bullmq';
import { AppConfigService } from '../config/app-config.service';
import { ReplicateService } from '../replicate/replicate.service';
import { StorageService } from '../storage/storage.service';
import type { PortraitJob } from '../portraits/portraits.service';
import { PortraitsService } from '../portraits/portraits.service';
import { PrismaService } from '../prisma/prisma.service';

/** Rekognition label categories that trigger rejection */
const REJECT_LABELS = new Set([
  'Explicit Nudity',
  'Violence',
  'Visually Disturbing',
]);

@Processor(QUEUE_NAMES.PORTRAIT_GENERATION)
export class PortraitGeneratorProcessor {
  private readonly logger = new Logger(PortraitGeneratorProcessor.name);
  private readonly rekognition: RekognitionClient;
  private readonly s3Bucket: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;

  constructor(
    private readonly storage: StorageService,
    private readonly replicate: ReplicateService,
    private readonly portraits: PortraitsService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {
    this.rekognition = new RekognitionClient({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.s3Bucket = config.get('AWS_S3_BUCKET');
    this.apiUrl = config.get('NEXT_PUBLIC_API_URL');
    this.webhookSecret = config.get('REPLICATE_WEBHOOK_SECRET');
  }

  @Process(QUEUE_NAMES.PORTRAIT_GENERATION)
  async handle(job: Job<PortraitJob>): Promise<void> {
    const { portraitId, themeSlug, inputKeys, userId } = job.data;
    this.logger.log(`Starting portrait portraitId=${portraitId} theme=${themeSlug}`);

    try {
      // 1. Moderate each source image before calling Replicate
      for (const key of inputKeys) {
        await this.checkModeration(key);
      }

      // 2. Build theme prompt
      const theme = getTheme(themeSlug);
      if (!theme) throw new Error(`Unknown theme: ${themeSlug}`);

      // 3. Build Replicate input (up to 4 source images)
      const [img1, img2, img3, img4] = inputKeys.map((k) =>
        this.storage.publicUrl(k),
      );
      const replicateInput: Record<string, unknown> = {
        prompt: theme.prompt,
        negative_prompt: theme.negativePrompt,
        style_name: theme.style,
        num_outputs: PORTRAIT_NUM_OUTPUTS,
        guidance_scale: 5,
        num_inference_steps: 50,
        style_strength_ratio: 20,
        input_image: img1,
      };
      if (img2) replicateInput['input_image2'] = img2;
      if (img3) replicateInput['input_image3'] = img3;
      if (img4) replicateInput['input_image4'] = img4;

      // 4. Create prediction with webhook URL
      const webhookUrl =
        `${this.apiUrl}/api/portraits/webhook/replicate` +
        `?secret=${encodeURIComponent(this.webhookSecret)}`;

      const prediction = await this.replicate.createPrediction({
        modelVersion: PHOTOMAKER_MODEL_VERSION,
        input: replicateInput,
        webhookUrl,
        webhookEventsFilter: ['completed'],
      });

      // Store replicateId + set PROCESSING
      await this.portraits.setReplicateId(portraitId, prediction.id);

      // 5. Poll as live fallback (webhook is source of truth)
      await this.pollUntilComplete(prediction.id, portraitId);
    } catch (err) {
      this.logger.error(
        `Portrait generation failed portraitId=${portraitId}: ${String(err)}`,
      );
      await this.portraits.failPortrait(portraitId);
    }
  }

  private async pollUntilComplete(
    replicateId: string,
    portraitId: string,
  ): Promise<void> {
    const deadline = Date.now() + PORTRAIT_GENERATION_TIMEOUT_MS;

    while (Date.now() < deadline) {
      await this.sleep(REPLICATE_POLL_INTERVAL_MS);

      // Short-circuit if webhook already handled it
      const portrait = await this.prisma.portrait.findUnique({
        where: { id: portraitId },
        select: { status: true },
      });
      if (portrait?.status === 'DONE' || portrait?.status === 'FAILED') {
        this.logger.log(
          `Polling stopped — webhook already resolved portraitId=${portraitId}`,
        );
        return;
      }

      const prediction = await this.replicate.getPrediction(replicateId);

      if (prediction.status === 'succeeded' && prediction.output) {
        await this.portraits.processReplicateOutput(portraitId, prediction.output);
        return;
      }

      if (
        prediction.status === 'failed' ||
        prediction.status === 'canceled'
      ) {
        throw new Error(
          `Prediction ${replicateId} ${prediction.status}: ${prediction.error ?? 'no error detail'}`,
        );
      }

      this.logger.debug(
        `Polling portraitId=${portraitId} status=${prediction.status}`,
      );
    }

    throw new Error(`Portrait generation timed out after 10 minutes`);
  }

  private async checkModeration(s3Key: string): Promise<void> {
    try {
      const result = await this.rekognition.send(
        new DetectModerationLabelsCommand({
          Image: { S3Object: { Bucket: this.s3Bucket, Name: s3Key } },
          MinConfidence: 60,
        }),
      );

      const flagged = result.ModerationLabels?.some(
        (label) =>
          REJECT_LABELS.has(label.ParentName ?? '') ||
          REJECT_LABELS.has(label.Name ?? ''),
      );

      if (flagged) {
        throw new Error(`Content moderation rejected image key=${s3Key}`);
      }
    } catch (err) {
      // Re-throw moderation failures; log but don't block on Rekognition service errors
      if ((err as Error).message.includes('moderation rejected')) throw err;
      this.logger.warn(
        `Rekognition check failed for key=${s3Key} (allowing): ${String(err)}`,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
