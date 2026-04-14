import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  QUEUE_NAMES,
  VIEW_FLUSH_INTERVAL_MS,
} from '@picflow/shared';
import type { Job, Queue } from 'bullmq';
import { ImagesService } from '../images/images.service';

const REPEATABLE_JOB_NAME = 'view-flush-tick';

/**
 * Repeatable BullMQ job that reconciles per-slug view counters from
 * Redis back into Postgres every VIEW_FLUSH_INTERVAL_MS. Registered
 * once per process on bootstrap; BullMQ deduplicates the schedule via
 * `jobId`, so multiple worker replicas won't double-schedule.
 */
@Processor(QUEUE_NAMES.VIEW_FLUSH)
export class ViewFlushProcessor implements OnApplicationBootstrap {
  private readonly logger = new Logger(ViewFlushProcessor.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.VIEW_FLUSH)
    private readonly queue: Queue,
    private readonly images: ImagesService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    // Clear any stale repeatable schedules from previous deploys, then
    // register a fresh one. Idempotent across restarts.
    const existing = await this.queue.getRepeatableJobs();
    for (const job of existing) {
      await this.queue.removeRepeatableByKey(job.key);
    }
    await this.queue.add(
      REPEATABLE_JOB_NAME,
      {},
      {
        jobId: REPEATABLE_JOB_NAME,
        repeat: { every: VIEW_FLUSH_INTERVAL_MS },
        removeOnComplete: { count: 20 },
        removeOnFail: { count: 50 },
      },
    );
    this.logger.log(
      `View-flush scheduler armed (every ${VIEW_FLUSH_INTERVAL_MS}ms)`,
    );
  }

  @Process(REPEATABLE_JOB_NAME)
  async handle(_job: Job): Promise<void> {
    const { flushed } = await this.images.flushAllTrackedViews();
    if (flushed > 0) {
      this.logger.log(`Flushed view counters for ${flushed} slugs`);
    }
  }
}
