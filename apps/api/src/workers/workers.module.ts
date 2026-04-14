import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '@picflow/shared';
import { ImagesModule } from '../images/images.module';
import { PortraitsModule } from '../portraits/portraits.module';
import { ReplicateModule } from '../replicate/replicate.module';
import { ImageProcessorProcessor } from './image-processor.processor';
import { PortraitGeneratorProcessor } from './portrait-generator.processor';
import { ViewFlushProcessor } from './view-flush.processor';

@Module({
  imports: [
    ImagesModule,
    PortraitsModule,
    ReplicateModule,
    BullModule.registerQueue(
      { name: QUEUE_NAMES.IMAGE_PROCESSING },
      { name: QUEUE_NAMES.VIEW_FLUSH },
      { name: QUEUE_NAMES.PORTRAIT_GENERATION },
    ),
  ],
  providers: [
    ImageProcessorProcessor,
    ViewFlushProcessor,
    PortraitGeneratorProcessor,
  ],
})
export class WorkersModule {}
