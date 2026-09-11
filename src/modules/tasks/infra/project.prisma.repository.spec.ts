import { PrismaProjectRepository } from './project.prisma.repository';

describe('PrismaProjectRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      projeto: {
        findMany: mocks?.findMany ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaProjectRepository(prisma);
    return { sut, prisma: prisma.projeto };
  }

  const SAMPLE_PROJECT = {
    id: 'p-1',
    name: 'LarviFort CRM',
    columns: [],
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_SELECT = {
    id: true,
    name: true,
    columns: {
      orderBy: { order: 'asc' },
      select: {
        id: true,
        projetoId: true,
        title: true,
        order: true,
        color: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    createdAt: true,
    updatedAt: true,
  };

  it('findAll retorna todos os projetos', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_PROJECT]);
    const { sut } = makeSut({ findMany });

    const result = await sut.findAll();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: EXPECTED_SELECT,
    });
    expect(result).toEqual([SAMPLE_PROJECT]);
  });

  it('findById retorna projeto ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_PROJECT)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('p-1');
    expect(found).toEqual(SAMPLE_PROJECT);

    const missing = await sut.findById('p-ghost');
    expect(missing).toBeNull();
  });

  it('findByName retorna projeto ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_PROJECT)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByName('LarviFort CRM');
    expect(findUnique).toHaveBeenCalledWith({
      where: { name: 'LarviFort CRM' },
      select: EXPECTED_SELECT,
    });
    expect(found).toEqual(SAMPLE_PROJECT);
  });

  it('create insere novo projeto com colunas padrão', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const { sut } = makeSut({ create });

    const result = await sut.create({ name: 'LarviFort CRM' });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'LarviFort CRM',
        columns: {
          create: [
            { title: 'Backlog', color: null, order: 0 },
            { title: 'Em Andamento', color: null, order: 1 },
            { title: 'Em Revisão', color: null, order: 2 },
            { title: 'Concluído', color: null, order: 3 },
          ],
        },
      },
      select: EXPECTED_SELECT,
    });
    expect(result).toEqual(SAMPLE_PROJECT);
  });

  it('create insere novo projeto com colunas ricas personalizadas', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const { sut } = makeSut({ create });

    const customCols = [
      { name: 'Novos', color: '#0ea5e9', order: 0 },
      { name: 'Resolvidos', color: '#10b981', order: 1 },
    ];
    await sut.create({ name: 'Helpdesk', columns: customCols });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Helpdesk',
        columns: {
          create: [
            { title: 'Novos', color: '#0ea5e9', order: 0 },
            { title: 'Resolvidos', color: '#10b981', order: 1 },
          ],
        },
      },
      select: EXPECTED_SELECT,
    });
  });

  it('create insere novo projeto com initialColumns (string[])', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_PROJECT);
    const { sut } = makeSut({ create });

    await sut.create({ name: 'Simples', initialColumns: ['To Do', 'Done'] });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Simples',
        columns: {
          create: [
            { title: 'To Do', color: null, order: 0 },
            { title: 'Done', color: null, order: 1 },
          ],
        },
      },
      select: EXPECTED_SELECT,
    });
  });

  it('update atualiza campos do projeto', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_PROJECT,
      name: 'Novo Nome',
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('p-1', { name: 'Novo Nome' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'p-1' },
      data: { name: 'Novo Nome' },
      select: EXPECTED_SELECT,
    });
    expect(result.name).toBe('Novo Nome');
  });

  it('delete remove projeto por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('p-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 'p-1' } });
  });
});
