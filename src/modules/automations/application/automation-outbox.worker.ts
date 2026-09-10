import { Inject, Injectable } from '@nestjs/common';
import { AutomationEngineService } from './automation-engine.service';
import {
  AUTOMATION_OUTBOX_PORT,
  type AutomationOutboxPort,
} from './ports/automation-outbox.port';

@Injectable()
export class AutomationOutboxWorker {
  private readonly maxAttempts = 5;

  constructor(
    @Inject(AUTOMATION_OUTBOX_PORT)
    private readonly outbox: AutomationOutboxPort,
    private readonly engine: AutomationEngineService,
  ) {}

  async runOnce(limit = 20): Promise<void> {
    const messages = await this.outbox.claimPending(limit);
    for (const message of messages) {
      try {
        await this.engine.process(
          {
            id: message.eventId,
            type: message.eventType,
            projetoId: message.projetoId,
            aggregateId: message.aggregateId,
            payload: message.payload,
            depth: message.depth,
            causationChain: message.causationChain,
            occurredAt: message.availableAt,
          },
          message.attempts + 1,
        );
        await this.outbox.markProcessed(message.id);
      } catch (error) {
        const text = this.sanitize(error);
        if (message.attempts + 1 >= this.maxAttempts) {
          await this.outbox.markDead(message.id, text);
        } else {
          const delay = Math.min(60_000, 1000 * 2 ** message.attempts);
          await this.outbox.markRetry(
            message.id,
            new Date(Date.now() + delay),
            text,
          );
        }
      }
    }
  }

  private sanitize(error: unknown): string {
    return (error instanceof Error ? error.message : 'Unknown error')
      .replace(
        /(token|password|secret|authorization)\s*[=:]\s*[^\s]+/gi,
        '$1=[REDACTED]',
      )
      .replace(/[\r\n]+/g, ' ')
      .slice(0, 500);
  }
}
