import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { CreateGiftDto } from './dto/create-gift.dto';
import { GiftsService } from './gifts.service';

@Controller('gifts')
export class GiftsController {
  constructor(private readonly gifts: GiftsService) {}

  /** POST /api/gifts — create a shareable gift link for a completed portrait */
  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @Throttle({ default: { ttl: 3_600_000, limit: 30 } })
  async createGift(
    @Body() dto: CreateGiftDto,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.gifts.createGift({
      portraitShareSlug: dto.portraitShareSlug,
      userId: user?.id ?? null,
      recipientName: dto.recipientName,
      message: dto.message,
    });
  }

  /** GET /api/gifts/:id — fetch gift + portrait results (marks claimed on first view) */
  @Get(':id')
  @Throttle({ default: { ttl: 60_000, limit: 60 } })
  async getGift(@Param('id') id: string) {
    return this.gifts.getGift(id);
  }
}
