import { Module } from '@nestjs/common';
import { ReplicateService } from './replicate.service';

@Module({
  providers: [ReplicateService],
  exports: [ReplicateService],
})
export class ReplicateModule {}
