import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output: string[] | null;
  error: string | null;
  urls: { get: string; cancel: string };
}

@Injectable()
export class ReplicateService {
  private readonly logger = new Logger(ReplicateService.name);
  private readonly baseUrl = 'https://api.replicate.com/v1';
  private readonly token: string;

  constructor(private readonly config: AppConfigService) {
    this.token = config.get('REPLICATE_API_TOKEN');
  }

  async createPrediction(opts: {
    modelVersion: string;
    input: Record<string, unknown>;
    webhookUrl: string;
    webhookEventsFilter?: string[];
  }): Promise<ReplicatePrediction> {
    const res = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: opts.modelVersion,
        input: opts.input,
        webhook: opts.webhookUrl,
        webhook_events_filter: opts.webhookEventsFilter ?? ['completed'],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Replicate createPrediction failed ${res.status}: ${text}`);
    }

    const data = (await res.json()) as ReplicatePrediction;
    this.logger.log(`Created prediction id=${data.id}`);
    return data;
  }

  async getPrediction(id: string): Promise<ReplicatePrediction> {
    const res = await fetch(`${this.baseUrl}/predictions/${id}`, {
      headers: { Authorization: `Token ${this.token}` },
    });

    if (!res.ok) {
      throw new Error(`Replicate getPrediction failed ${res.status} for id=${id}`);
    }

    return (await res.json()) as ReplicatePrediction;
  }
}
