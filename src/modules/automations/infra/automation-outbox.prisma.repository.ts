import { Inject, Injectable } from '@nestjs/common';
import type { AutomationEvent, AutomationTrigger } from '../domain/automation';
import type {
  AutomationOutboxMessage,
  AutomationOutboxPort,
} from '../application/ports/automation-outbox.port';

export const PRISMA_AUTOMATION_OUTBOX_TOKEN = 'PRISMA_AUTOMATION_OUTBOX_TOKEN';

type OutboxRow = {
  id: string;
  eventId: string;
  eventType: AutomationTrigger;
  projetoId: string;
  aggregateId: string;
  payload: unknown;
  depth: number;
  causationChain: unknown;
  attempts: number;
  availableAt: Date;
};

interface PrismaOutboxCrud {
  automationOutboxEvent: {
    create(args: Record<string, unknown>): Promise<unknown>;
    findMany(args: Record<string, unknown>): Promise<OutboxRow[]>;
    update(args: Record<string, unknown>): Promise<unknown>;
  };
}

export const MAX_AUTOMATION_DEPTH = 5;

@Injectable()
export class PrismaAutomationOutboxRepository implements AutomationOutboxPort {
  constructor(
    @Inject(PRISMA_AUTOMATION_OUTBOX_TOKEN)
    private readonly prisma: PrismaOutboxCrud,
  ) {}

  async publish(event: AutomationEvent): Promise<void> {
    if (event.depth > MAX_AUTOMATION_DEPTH) return;
    await this.prisma.automationOutboxEvent.create({
      data: {
        eventId: event.id,
        eventType: event.type,
        projetoId: event.projetoId,
        aggregateId: event.aggregateId,
        payload: event.payload,
        depth: event.depth,
        causationChain: event.causationChain,
        availableAt: event.occurredAt,
      },
    });
  }

  async claimPending(limit: number): Promise<AutomationOutboxMessage[]> {
    const rows = await this.prisma.automationOutboxEvent.findMany({
      where: { status: 'PENDING', availableAt: { lte: new Date() } },
      orderBy: { availableAt: 'asc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map((row) => ({
      ...row,
      payload: row.payload as Record<string, unknown>,
      causationChain: row.causationChain as string[],
    }));
  }

  async markProcessed(id: string): Promise<void> {
    await this.update(id, { status: 'PROCESSED', processedAt: new Date() });
  }

  async markRetry(id: string, availableAt: Date, error: string): Promise<void> {
    await this.update(id, {
      status: 'PENDING',
      availableAt,
      lastError: error,
      attempts: { increment: 1 },
    });
  }

  async markDead(id: string, error: string): Promise<void> {
    await this.update(id, {
      status: 'DEAD',
      lastError: error,
      attempts: { increment: 1 },
    });
  }

  private async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.prisma.automationOutboxEvent.update({ where: { id }, data });
  }
}
