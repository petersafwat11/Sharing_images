import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Image, ImageListResponse } from '@picflow/shared';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListImagesQueryDto } from './dto/image-response.dto';
import { ImagesService } from './images.service';

@Controller()
export class ImagesController {
  constructor(private readonly images: ImagesService) {}

  /**
   * Public: fetch metadata for the share page. Increments view counter.
   */
  @Get('i/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<Image> {
    return this.images.getBySlug(slug);
  }

  /**
   * Authenticated: list the current user's images.
   */
  @Get('images')
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() query: ListImagesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ImageListResponse> {
    return this.images.listForUser(
      user.id,
      query.page,
      query.pageSize,
      query.sort,
    );
  }

  @Delete('images/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.images.deleteById(id, user.id);
  }
}
