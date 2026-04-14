import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '@picflow/shared';
import { AnalyticsModule } from '../analytics/analytics.module';
import { EmailModule } from '../email/email.module';
import { PortraitsController } from './portraits.controller';
import { PortraitsService } from './portraits.service';

@Module({
  imports: [
    AnalyticsModule,
    EmailModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.PORTRAIT_GENERATION }),
  ],
  controllers: [PortraitsController],
  providers: [PortraitsService],
  exports: [PortraitsService],
})
export class PortraitsModule {}
