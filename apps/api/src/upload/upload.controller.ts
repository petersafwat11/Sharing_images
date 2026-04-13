import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  RATE_LIMITS,
  type ConfirmUploadResponse,
  type PresignResponse,
} from '@picflow/shared';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { ConfirmUploadDto } from './dto/confirm-upload.dto';
import { PresignRequestDto } from './dto/presign-request.dto';
import { UploadService } from './upload.service';

@Controller('upload')
@UseGuards(OptionalJwtAuthGuard)
export class UploadController {
  constructor(private readonly upload: UploadService) {}

  @Post('presign')
  // Upper-bound for authenticated users; the guard trusts the higher of the
  // two rates the JWT grants (see Throttler config in app.module.ts).
  @Throttle({
    default: {
      limit: RATE_LIMITS.AUTHENTICATED_UPLOADS_PER_HOUR,
      ttl: 60 * 60 * 1000,
    },
  })
  async presign(
    @Body() dto: PresignRequestDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PresignResponse> {
    return this.upload.createPresignedUpload(
      dto.filename,
      dto.mimeType,
      dto.size,
      user?.id ?? null,
    );
  }

  @Post('confirm')
  async confirm(
    @Body() dto: ConfirmUploadDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<ConfirmUploadResponse> {
    return this.upload.confirmUpload(
      dto.key,
      dto.slug,
      user?.id ?? null,
      undefined,
      undefined,
    );
  }
}
