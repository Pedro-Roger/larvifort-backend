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
    prioridade: true,
    progresso: true,
    tags: true,
    prazo: true,
    estimativaH: true,
    assigneeId: true,
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
});
