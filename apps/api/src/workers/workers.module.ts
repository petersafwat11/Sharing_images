import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '@picflow/shared';
import { ImagesModule } from '../images/images.module';
import { ImageProcessorProcessor } from './image-processor.processor';
import { ViewFlushProcessor } from './view-flush.processor';

@Module({
  imports: [
    ImagesModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.IMAGE_PROCESSING },
      { name: QUEUE_NAMES.VIEW_FLUSH },
    ),
  ],
  providers: [ImageProcessorProcessor, ViewFlushProcessor],
})
export class WorkersModule {}
