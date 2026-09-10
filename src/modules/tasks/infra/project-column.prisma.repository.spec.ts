import { PrismaProjectColumnRepository } from './project-column.prisma.repository';

describe('PrismaProjectColumnRepository', () => {
  const sampleRow = {
    id: 'c-1',
    projetoId: 'p-1',
    title: 'Backlog',
    order: 0,
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const prisma = {
      projetoColumn: {
        findMany: jest.fn().mockResolvedValue([sampleRow]),
        findUnique: jest.fn().mockResolvedValue(sampleRow),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockResolvedValue(sampleRow),
        update: jest.fn().mockResolvedValue(sampleRow),
        delete: jest.fn().mockResolvedValue(sampleRow),
      },
    };
    const sut = new PrismaProjectColumnRepository(prisma);
    return { sut, prisma };
  }

  it('findByProjectId retorna colunas do projeto', async () => {
    const { sut, prisma } = makeSut();
    const result = await sut.findByProjectId('p-1');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Backlog');
    expect(prisma.projetoColumn.findMany).toHaveBeenCalledWith({
      where: { projetoId: 'p-1' },
      orderBy: { order: 'asc' },
      select: expect.any(Object) as Record<string, unknown>,
    });
  });

  it('findById retorna coluna por id', async () => {
    const { sut, prisma } = makeSut();
    const result = await sut.findById('c-1');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('c-1');
    expect(prisma.projetoColumn.findUnique).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      select: expect.any(Object) as Record<string, unknown>,
    });
  });

  it('create persiste nova coluna', async () => {
    const { sut, prisma } = makeSut();
    const result = await sut.create({
      projetoId: 'p-1',
      title: 'Backlog',
      order: 0,
      color: '#3b82f6',
    });

    expect(result.id).toBe('c-1');
    expect(prisma.projetoColumn.create).toHaveBeenCalled();
  });

  it('update atualiza campos da coluna', async () => {
    const { sut, prisma } = makeSut();
    const result = await sut.update('c-1', { title: 'Novo Título' });

    expect(result.id).toBe('c-1');
    expect(prisma.projetoColumn.update).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      data: { title: 'Novo Título' },
      select: expect.any(Object) as Record<string, unknown>,
    });
  });

  it('delete remove coluna', async () => {
    const { sut, prisma } = makeSut();
    await sut.delete('c-1');

    expect(prisma.projetoColumn.delete).toHaveBeenCalledWith({
      where: { id: 'c-1' },
    });
  });

  it('reorder atualiza ordem de cada coluna', async () => {
    const { sut, prisma } = makeSut();
    await sut.reorder('p-1', ['c-2', 'c-1']);

    expect(prisma.projetoColumn.update).toHaveBeenCalledTimes(2);
  });
});
