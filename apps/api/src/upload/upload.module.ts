import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { QUEUE_NAMES } from '@picflow/shared';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.IMAGE_PROCESSING }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
