import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { GalleryService } from './gallery.service';

class SetPublicDto {
  @IsBoolean()
  @Type(() => Boolean)
  isPublic!: boolean;
}

@Controller('gallery')
export class GalleryController {
  constructor(private readonly gallery: GalleryService) {}

  /** GET /api/gallery?themeSlug=&cursor=&take= */
  @Get()
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async getPortraits(
    @Query('themeSlug') themeSlug?: string,
    @Query('cursor') cursor?: string,
    @Query('take') take?: string,
  ) {
    return this.gallery.getPublicPortraits({
      themeSlug,
      cursor,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  /** PATCH /api/gallery/:shareSlug — toggle gallery consent */
  @Patch(':shareSlug')
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async setPublic(
    @Param('shareSlug') shareSlug: string,
    @Body() dto: SetPublicDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    await this.gallery.setPublic(shareSlug, user?.id ?? null, dto.isPublic);
    return { ok: true };
  }
}
