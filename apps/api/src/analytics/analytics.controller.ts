import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { AppConfigService } from '../config/app-config.service';
import { ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly config: AppConfigService,
  ) {}

  /** GET /api/admin/analytics?days=7 — admin-only dashboard stats */
  @Get()
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') daysParam?: string,
  ) {
    const adminId = this.config.get('ADMIN_USER_ID');
    if (adminId && user.id !== adminId) {
      throw new ForbiddenException('Admin access required');
    }
    const days = Math.min(parseInt(daysParam ?? '7', 10) || 7, 90);
    return this.analytics.getDashboardStats(days);
  }
}
