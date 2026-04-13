import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { AppConfigService } from '../config/app-config.service';
import { REDIS_CLIENT, RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: AppConfigService): Redis => {
        return new Redis(config.get('REDIS_URL'), {
          maxRetriesPerRequest: null,
          enableReadyCheck: true,
        });
      },
      inject: [AppConfigService],
    },
    RedisService,
  ],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
