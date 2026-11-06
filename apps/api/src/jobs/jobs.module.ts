import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { z } from 'zod';
import { LocaleSchema } from '@jfa/shared';
import { QueueService } from '../integrations/queue/queue.service';

/** Every background job type and its payload. Add new jobs here. */
export const JobSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('content.publishPacks'), locales: z.array(LocaleSchema).optional(), requestedBy: z.string().optional() }),
  // PHASE 2
  z.object({ type: z.literal('document.scan'), documentId: z.string() }),
  z.object({ type: z.literal('email.send'), template: z.string(), userId: z.string() }),
  // PHASE 3
  z.object({ type: z.literal('consultation.remind'), consultationId: z.string() }),
]);
export type Job = z.infer<typeof JobSchema>;
type Handler<T extends Job['type']> = (job: Extract<Job, { type: T }>) => Promise<unknown>;

/**
 * Enqueue to SQS when configured (worker Lambda handles it), otherwise run inline (local dev).
 * Feature modules register handlers in `onModuleInit` to avoid circular dependencies.
 */
@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly handlers = new Map<Job['type'], (job: Job) => Promise<unknown>>();

  constructor(private readonly queue: QueueService) {}

  register<T extends Job['type']>(type: T, handler: Handler<T>) {
    this.handlers.set(type, handler as (job: Job) => Promise<unknown>);
  }

  async enqueue(job: Job): Promise<{ queued: boolean; result?: unknown }> {
    const parsed = JobSchema.parse(job);
    if (this.queue.isConfigured) {
      await this.queue.send(parsed);
      return { queued: true };
    }
    this.logger.warn(`Queue not configured — running "${parsed.type}" inline`);
    return { queued: false, result: await this.handle(parsed) };
  }

  /** Called by the worker Lambda (src/worker.ts) for each SQS message. */
  async handle(raw: unknown): Promise<unknown> {
    const job = JobSchema.parse(raw);
    const handler = this.handlers.get(job.type);
    if (!handler) throw new Error(`No handler registered for job "${job.type}"`);
    return handler(job);
  }
}

@Global()
@Module({ providers: [JobsService], exports: [JobsService] })
export class JobsModule {}
