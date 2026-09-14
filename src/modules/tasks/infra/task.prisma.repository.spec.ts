import { PrismaTaskRepository } from './task.prisma.repository';

describe('PrismaTaskRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    count?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      task: {
        findMany: mocks?.findMany ?? jest.fn(),
        count: mocks?.count ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaTaskRepository(prisma);
    return { sut, prisma: prisma.task };
  }

  const SAMPLE_TASK = {
    id: 't-1',
    projetoId: 'p-1',
    columnId: 'c-1',
    titulo: 'Desenvolver API',
    descricao: 'Implementar Kanban',
    status: 'EM_ANDAMENTO' as const,
    tipo: 'GERAL' as const,
    appointmentId: null,
    clienteId: null,
    confirmation: null,
    assignee: { firstName: 'Pedro', lastName: 'Roger' },
    prioridade: 'ALTA' as const,
    progresso: 50,
    tags: ['backend', 'nestjs'],
    prazo: new Date('2026-10-01'),
    estimativaH: 8,
    assigneeId: 'u-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_SELECT = {
    id: true,
    projetoId: true,
    columnId: true,
    titulo: true,
    descricao: true,
    status: true,
    tipo: true,
    appointmentId: true,
    clienteId: true,
    confirmation: {
      select: {
        id: true,
        taskId: true,
        confirmedById: true,
        confirmedAt: true,
        latitude: true,
        longitude: true,
        accuracyMeters: true,
        createdAt: true,
      },
    },
    prioridade: true,
    progresso: true,
    tags: true,
    prazo: true,
    estimativaH: true,
    assigneeId: true,
    assignee: {
      select: { firstName: true, lastName: true },
    },
    createdAt: true,
    updatedAt: true,
  };

  it('findMany busca tarefas com filtros e paginação', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_TASK]);
    const count = jest.fn().mockResolvedValue(1);
    const { sut } = makeSut({ findMany, count });

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      search: 'desenvolver',
      projetoId: 'p-1',
      columnId: 'c-1',
      status: 'EM_ANDAMENTO',
      assigneeId: 'u-1',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        projetoId: 'p-1',
        columnId: 'c-1',
        status: 'EM_ANDAMENTO',
        assigneeId: 'u-1',
        OR: [
          { titulo: { contains: 'desenvolver', mode: 'insensitive' } },
          { descricao: { contains: 'desenvolver', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: EXPECTED_SELECT,
    });
    expect(result.data).toEqual([SAMPLE_TASK]);
    expect(result.total).toBe(1);
  });

  it('findById retorna tarefa ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_TASK)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('t-1');
    expect(found).toEqual(SAMPLE_TASK);

    const missing = await sut.findById('t-ghost');
    expect(missing).toBeNull();
  });

  it('retorna a relação do responsável para os indicadores da equipe', async () => {
    const findUnique = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const { sut } = makeSut({ findUnique });

    const result = await sut.findById('t-1');

    expect(result).toEqual(SAMPLE_TASK);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 't-1' },
      select: EXPECTED_SELECT,
    });
  });

  it('create insere nova tarefa e deduplica tags', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const { sut } = makeSut({ create });

    const result = await sut.create({
      projetoId: 'p-1',
      columnId: 'c-1',
      titulo: 'Desenvolver API',
      descricao: 'Implementar Kanban',
      status: 'EM_ANDAMENTO',
      prioridade: 'ALTA',
      progresso: 50,
      tags: ['backend', 'backend', 'nestjs'],
      prazo: new Date('2026-10-01'),
      estimativaH: 8,
      assigneeId: 'u-1',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        projetoId: 'p-1',
        columnId: 'c-1',
        titulo: 'Desenvolver API',
        descricao: 'Implementar Kanban',
        status: 'EM_ANDAMENTO',
        tipo: 'GERAL',
        appointmentId: null,
        clienteId: null,
        prioridade: 'ALTA',
        progresso: 50,
        tags: ['backend', 'nestjs'],
        prazo: new Date('2026-10-01'),
        estimativaH: 8,
        assigneeId: 'u-1',
      },
      select: EXPECTED_SELECT,
    });
    expect(result).toEqual(SAMPLE_TASK);
  });

  it('update atualiza campos da tarefa', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_TASK,
      titulo: 'Novo Titulo',
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('t-1', { titulo: 'Novo Titulo' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 't-1' },
      data: { titulo: 'Novo Titulo' },
      select: EXPECTED_SELECT,
    });
    expect(result.titulo).toBe('Novo Titulo');
  });

  it('delete remove tarefa por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('t-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 't-1' } });
  });

  it('confirmActivity cria confirmação de atividade', async () => {
    const createConf = jest.fn().mockResolvedValue({
      id: 'conf-1',
      taskId: 't-1',
      confirmedById: 'u-1',
      confirmedAt: new Date('2026-10-15T14:30:00.000Z'),
      latitude: -3.7319,
      longitude: -38.5267,
      accuracyMeters: 10.0,
      createdAt: new Date('2026-10-15T14:30:00.000Z'),
    });
    const prisma = {
      task: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      taskActivityConfirmation: {
        create: createConf,
        findUnique: jest.fn(),
      },
    };
    const sut = new PrismaTaskRepository(prisma);

    const result = await sut.confirmActivity('t-1', {
      confirmedById: 'u-1',
      confirmedAt: new Date('2026-10-15T14:30:00.000Z'),
      latitude: -3.7319,
      longitude: -38.5267,
      accuracyMeters: 10.0,
    });

    expect(createConf).toHaveBeenCalled();
    expect(result.id).toBe('conf-1');
  });

  it('findConfirmationByTaskId retorna confirmação ou null', async () => {
    const findUniqueConf = jest.fn().mockResolvedValue({
      id: 'conf-1',
      taskId: 't-1',
      confirmedById: 'u-1',
      confirmedAt: new Date(),
      latitude: -3.7319,
      longitude: -38.5267,
      accuracyMeters: 10.0,
      createdAt: new Date(),
    });
    const prisma = {
      task: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      taskActivityConfirmation: {
        create: jest.fn(),
        findUnique: findUniqueConf,
      },
    };
    const sut = new PrismaTaskRepository(prisma);

    const result = await sut.findConfirmationByTaskId('t-1');
    expect(findUniqueConf).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { taskId: 't-1' },
      }),
    );
    expect(result?.id).toBe('conf-1');
  });
});
