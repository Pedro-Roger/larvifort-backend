import { PrismaAutomationRepository } from './automation.prisma.repository';
import type { Automation } from '../domain/automation';

describe('PrismaAutomationRepository', () => {
  const baseDate = new Date('2026-09-10T10:00:00Z');

  const sampleRow: Automation = {
    id: 'automation-1',
    projetoId: 'project-1',
    name: 'Mover urgente',
    description: null,
    trigger: 'TASK_CREATED',
    conditions: [{ field: 'prioridade', operator: 'EQUALS', value: 'ALTA' }],
    conditionMode: 'AND',
    actions: [
      { type: 'ADD_TAG', params: { tag: 'automatica' } },
      { type: 'MOVE_TASK', params: { columnId: 'column-2' } },
    ],
    schedule: null,
    isActive: true,
    priority: 0,
    createdBy: 'user-1',
    createdAt: baseDate,
    updatedAt: baseDate,
    deletedAt: null,
  };

  function makePrismaMock() {
    return {
      projetoAutomacao: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      automationExecution: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
  }

  function makeSut(prismaMock = makePrismaMock()) {
    const sut = new PrismaAutomationRepository(prismaMock);
    return { sut, prisma: prismaMock };
  }

  it('findMany lista automações do projeto ordenadas por prioridade', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.findMany.mockResolvedValue([sampleRow]);

    const result = await sut.findMany('project-1');

    expect(result).toEqual([sampleRow]);
    expect(prisma.projetoAutomacao.findMany).toHaveBeenCalledWith({
      where: { projetoId: 'project-1', deletedAt: null },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('findById devolve automação encontrada', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.findUnique.mockResolvedValue(sampleRow);

    const result = await sut.findById('automation-1');
    expect(result).toEqual(sampleRow);
    expect(prisma.projetoAutomacao.findUnique).toHaveBeenCalledWith({
      where: { id: 'automation-1' },
    });
  });

  it('findById devolve null quando automação não existe ou está deletada', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.findUnique.mockResolvedValue(null);

    const result = await sut.findById('automation-ghost');
    expect(result).toBeNull();

    prisma.projetoAutomacao.findUnique.mockResolvedValue({
      ...sampleRow,
      deletedAt: new Date(),
    });
    const result2 = await sut.findById('automation-1');
    expect(result2).toBeNull();
  });

  it('findActiveByEvent busca automações ativas por trigger e projeto', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.findMany.mockResolvedValue([sampleRow]);

    const result = await sut.findActiveByEvent('project-1', 'TASK_CREATED');

    expect(result).toEqual([sampleRow]);
    expect(prisma.projetoAutomacao.findMany).toHaveBeenCalledWith({
      where: {
        projetoId: 'project-1',
        trigger: 'TASK_CREATED',
        isActive: true,
        deletedAt: null,
      },
      orderBy: { priority: 'asc' },
    });
  });

  it('create persiste automação', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.create.mockResolvedValue(sampleRow);

    const result = await sut.create({
      projetoId: 'project-1',
      name: 'Nova automação',
      trigger: 'TASK_CREATED',
      conditions: [],
      actions: [{ type: 'NOTIFY', params: {} }],
      createdBy: 'user-1',
    });

    expect(result).toEqual(sampleRow);
    expect(prisma.projetoAutomacao.create).toHaveBeenCalled();
  });

  it('update atualiza apenas campos informados', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.update.mockResolvedValue({
      ...sampleRow,
      name: 'Atualizada',
      isActive: false,
    });

    const result = await sut.update('automation-1', {
      name: 'Atualizada',
      isActive: false,
    });

    expect(result.name).toBe('Atualizada');
    expect(result.isActive).toBe(false);
    expect(prisma.projetoAutomacao.update).toHaveBeenCalledWith({
      where: { id: 'automation-1' },
      data: { name: 'Atualizada', isActive: false },
    });
  });

  it('softDelete marca automação como deletada e inativa', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.update.mockResolvedValue(undefined);

    await sut.softDelete('automation-1');

    expect(prisma.projetoAutomacao.update).toHaveBeenCalledWith({
      where: { id: 'automation-1' },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: { deletedAt: expect.any(Date), isActive: false },
    });
  });

  it('reorder atualiza prioridades em transação', async () => {
    const { sut, prisma } = makeSut();
    prisma.projetoAutomacao.updateMany.mockResolvedValue({ count: 1 });
    prisma.$transaction.mockResolvedValue(undefined);

    await sut.reorder('project-1', ['automation-2', 'automation-1']);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.projetoAutomacao.updateMany).toHaveBeenCalledTimes(2);
    expect(prisma.projetoAutomacao.updateMany).toHaveBeenNthCalledWith(1, {
      where: { id: 'automation-2', projetoId: 'project-1', deletedAt: null },
      data: { priority: 0 },
    });
    expect(prisma.projetoAutomacao.updateMany).toHaveBeenNthCalledWith(2, {
      where: { id: 'automation-1', projetoId: 'project-1', deletedAt: null },
      data: { priority: 1 },
    });
  });

  it('hasExecution verifica execução bem-sucedida', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationExecution.findFirst.mockResolvedValue({ id: 'exec-1' });

    const result = await sut.hasExecution('automation-1', 'event-1');

    expect(result).toBe(true);
    expect(prisma.automationExecution.findFirst).toHaveBeenCalledWith({
      where: {
        automationId: 'automation-1',
        eventId: 'event-1',
        result: 'SUCCESS',
      },
      select: { id: true },
    });
  });

  it('hasExecution devolve false quando não há execução', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationExecution.findFirst.mockResolvedValue(null);

    const result = await sut.hasExecution('automation-1', 'event-1');

    expect(result).toBe(false);
  });

  it('createExecution cria registro de execução', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationExecution.create.mockResolvedValue({ id: 'exec-1' });

    const result = await sut.createExecution({
      automationId: 'automation-1',
      eventId: 'event-1',
      attempt: 1,
    });

    expect(result).toEqual({ id: 'exec-1' });
  });

  it('completeExecution atualiza execução com resultado', async () => {
    const { sut, prisma } = makeSut();
    prisma.automationExecution.update.mockResolvedValue(undefined);

    await sut.completeExecution('exec-1', {
      durationMs: 100,
      result: 'SUCCESS',
      error: null,
    });

    expect(prisma.automationExecution.update).toHaveBeenCalledWith({
      where: { id: 'exec-1' },
      data: {
        durationMs: 100,
        result: 'SUCCESS',
        error: null,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        completedAt: expect.any(Date),
      },
    });
  });

  it('findHistory busca histórico de execuções do projeto', async () => {
    const execRow = {
      id: 'exec-1',
      automationId: 'automation-1',
      eventId: 'event-1',
      attempt: 1,
      durationMs: 100,
      result: 'SUCCESS' as const,
      error: null,
      createdAt: baseDate,
      completedAt: baseDate,
      automation: { projetoId: 'project-1' },
    };
    const { sut, prisma } = makeSut();
    prisma.automationExecution.findMany.mockResolvedValue([execRow]);

    const result = await sut.findHistory('project-1', 10);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'exec-1',
      automationId: 'automation-1',
      eventId: 'event-1',
    });
    expect(prisma.automationExecution.findMany).toHaveBeenCalledWith({
      where: { automation: { projetoId: 'project-1' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { automation: { select: { projetoId: true } } },
    });
  });
});
