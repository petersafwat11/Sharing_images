import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Logger,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AppConfigService } from '../config/app-config.service';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { StartPortraitDto } from './dto/start-portrait.dto';
import { PortraitsService } from './portraits.service';

interface ReplicateWebhookBody {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string[] | null;
  error: string | null;
}

@Controller('portraits')
export class PortraitsController {
  private readonly logger = new Logger(PortraitsController.name);

  constructor(
    private readonly portraits: PortraitsService,
    private readonly config: AppConfigService,
  ) {}

  /** POST /api/portraits/start */
  @Post('start')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { ttl: 3_600_000, limit: 20 } })
  async startPortrait(
    @Body() dto: StartPortraitDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.portraits.startPortrait({
      themeSlug: dto.themeSlug,
      inputKeys: dto.inputKeys,
      userId: user?.id ?? null,
      email: dto.email ?? null,
    });
  }

  /** GET /api/portraits/:shareSlug/status — polled every 3s by the frontend */
  @Get(':shareSlug/status')
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async getStatus(@Param('shareSlug') shareSlug: string) {
    return this.portraits.getStatus(shareSlug);
  }

  /** GET /api/portraits/:shareSlug */
  @Get(':shareSlug')
  async getPortrait(@Param('shareSlug') shareSlug: string) {
    return this.portraits.getStatus(shareSlug);
  }

  /**
   * POST /api/portraits/:shareSlug/print — Gelato print order stub
   * Returns 503 until GELATO_API_KEY is configured. Tracks intent via analytics.
   */
  @Post(':shareSlug/print')
  @Throttle({ default: { ttl: 3_600_000, limit: 10 } })
  async orderPrint(
    @Param('shareSlug') _shareSlug: string,
    @Body() _body: unknown,
  ) {
    throw new ServiceUnavailableException('Print ordering coming soon');
  }

  /**
   * POST /api/portraits/webhook/replicate?secret=<REPLICATE_WEBHOOK_SECRET>
   * Replicate calls this when a prediction completes.
   * Webhook is the source of truth — polling is UI-only fallback.
   */
  @Post('webhook/replicate')
  @HttpCode(200)
  async handleReplicateWebhook(
    @Query('secret') secret: string,
    @Body() body: ReplicateWebhookBody,
    @Headers('x-replicate-signature') _sig: string | undefined,
  ) {
    if (secret !== this.config.get('REPLICATE_WEBHOOK_SECRET')) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const { id: replicateId, status, output } = body;
    this.logger.log(`Replicate webhook: prediction=${replicateId} status=${status}`);

    const portrait = await this.portraits.getByReplicateId(replicateId);
    if (!portrait) {
      this.logger.warn(`Webhook: no portrait found for replicateId=${replicateId}`);
      return { received: true };
    }

    if (status === 'succeeded' && Array.isArray(output) && output.length > 0) {
      await this.portraits.processReplicateOutput(portrait.id, output);
    } else if (status === 'failed' || status === 'canceled') {
      await this.portraits.failPortrait(portrait.id);
    }

    return { received: true };
  }
}
