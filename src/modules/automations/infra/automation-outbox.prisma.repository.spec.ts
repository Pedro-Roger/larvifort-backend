import { PrismaAutomationOutboxRepository } from './automation-outbox.prisma.repository';
import type { AutomationEvent } from '../domain/automation';

describe('PrismaAutomationOutboxRepository', () => {
  const baseDate = new Date('2026-09-10T10:00:00Z');

  const sampleEvent: AutomationEvent = {
    id: 'event-1',
    type: 'TASK_CREATED',
    projetoId: 'project-1',
    aggregateId: 'task-1',
    payload: { prioridade: 'ALTA' },
    depth: 0,
    causationChain: [],
    occurredAt: baseDate,
  };

  function makePrismaMock() {
    return {
      automationOutboxEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
  }

  function makeSut(prismaMock = makePrismaMock()) {
    const sut = new PrismaAutomationOutboxRepository(prismaMock);
    return { sut, prisma: prismaMock };
  }

  it('publish cria evento no outbox se depth <= MAX_AUTOMATION_DEPTH', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.create.mockResolvedValue({});

    await sut.publish(sampleEvent);

    expect(prisma.automationOutboxEvent.create).toHaveBeenCalledWith({
      data: {
        eventId: sampleEvent.id,
        eventType: sampleEvent.type,
        projetoId: sampleEvent.projetoId,
        aggregateId: sampleEvent.aggregateId,
        payload: sampleEvent.payload,
        depth: sampleEvent.depth,
        causationChain: sampleEvent.causationChain,
        availableAt: sampleEvent.occurredAt,
      },
    });
  });

  it('publish não cria evento se depth > MAX_AUTOMATION_DEPTH', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.create.mockResolvedValue({});

    await sut.publish({ ...sampleEvent, depth: 6 });

    expect(prisma.automationOutboxEvent.create).not.toHaveBeenCalled();
  });

  it('claimPending busca eventos pendentes prontos para processamento', async () => {
    const { sut, prisma } = makeSut();
    const rows = [
      {
        id: 'outbox-1',
        eventId: 'event-1',
        eventType: 'TASK_CREATED',
        projetoId: 'project-1',
        aggregateId: 'task-1',
        payload: {},
        depth: 0,
        causationChain: [],
        attempts: 0,
        availableAt: baseDate,
      },
    ];
    prisma.automationOutboxEvent.findMany.mockResolvedValue(rows);

    const result = await sut.claimPending(10);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'outbox-1',
      eventId: 'event-1',
      eventType: 'TASK_CREATED',
      payload: {},
      causationChain: [],
    });
    expect(prisma.automationOutboxEvent.findMany).toHaveBeenCalledWith({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: { status: 'PENDING', availableAt: { lte: expect.any(Date) } },
      orderBy: { availableAt: 'asc' },
      take: 10,
    });
  });

  it('claimPending limita a 100 itens', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.findMany.mockResolvedValue([]);

    await sut.claimPending(500);

    expect(prisma.automationOutboxEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('markProcessed atualiza status para PROCESSED', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.update.mockResolvedValue({});

    await sut.markProcessed('outbox-1');

    expect(prisma.automationOutboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'outbox-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { status: 'PROCESSED', processedAt: expect.any(Date) },
    });
  });

  it('markRetry atualiza status para PENDING com backoff', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.update.mockResolvedValue({});

    const availableAt = new Date(Date.now() + 2000);
    await sut.markRetry('outbox-1', availableAt, 'error message');

    expect(prisma.automationOutboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'outbox-1' },
      data: {
        status: 'PENDING',
        availableAt,
        lastError: 'error message',
        attempts: { increment: 1 },
      },
    });
  });

  it('markDead atualiza status para DEAD', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationOutboxEvent.update.mockResolvedValue({});

    await sut.markDead('outbox-1', 'fatal error');

    expect(prisma.automationOutboxEvent.update).toHaveBeenCalledWith({
      where: { id: 'outbox-1' },
      data: {
        status: 'DEAD',
        lastError: 'fatal error',
        attempts: { increment: 1 },
      },
    });
  });
});
