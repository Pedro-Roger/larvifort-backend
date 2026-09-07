import { PrismaUserRepository } from './user.prisma.repository';

describe('PrismaUserRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    count?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      user: {
        findMany: mocks?.findMany ?? jest.fn(),
        count: mocks?.count ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaUserRepository(prisma);
    return { sut, prisma: prisma.user };
  }

  const SAMPLE_USER_ROW = {
    id: 'u-1',
    firstName: 'Fernando',
    lastName: 'Silva',
    email: 'fernando@lavifort.com.br',
    role: 'ADMIN' as const,
    active: true,
    teamId: 't-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    active: true,
    teamId: true,
    createdAt: true,
    updatedAt: true,
  };

  it('findMany busca usuários com filtros, paginação e search', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_USER_ROW]);
    const count = jest.fn().mockResolvedValue(1);
    const { sut } = makeSut({ findMany, count });

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      search: 'fernando',
      teamId: 't-1',
      role: 'ADMIN',
      active: true,
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        teamId: 't-1',
        role: 'ADMIN',
        active: true,
        OR: [
          { firstName: { contains: 'fernando', mode: 'insensitive' } },
          { lastName: { contains: 'fernando', mode: 'insensitive' } },
          { email: { contains: 'fernando', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: EXPECTED_SELECT,
    });
    expect(result.data).toEqual([SAMPLE_USER_ROW]);
    expect(result.total).toBe(1);
  });

  it('findById retorna usuário ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_USER_ROW)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('u-1');
    expect(found).toEqual(SAMPLE_USER_ROW);

    const missing = await sut.findById('u-ghost');
    expect(missing).toBeNull();
  });

  it('findByEmail retorna usuário ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_USER_ROW)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByEmail('  Fernando@lavifort.com.br  ');
    expect(findUnique).toHaveBeenCalledWith({
      where: { email: 'fernando@lavifort.com.br' },
      select: EXPECTED_SELECT,
    });
    expect(found).toEqual(SAMPLE_USER_ROW);
  });

  it('create insere novo usuário e retorna entidade de domínio', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_USER_ROW);
    const { sut } = makeSut({ create });

    const result = await sut.create({
      firstName: 'Fernando',
      lastName: 'Silva',
      email: 'fernando@lavifort.com.br',
      passwordHash: 'hash-bcrypt',
      role: 'ADMIN',
      teamId: 't-1',
      active: true,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        firstName: 'Fernando',
        lastName: 'Silva',
        email: 'fernando@lavifort.com.br',
        passwordHash: 'hash-bcrypt',
        role: 'ADMIN',
        teamId: 't-1',
        active: true,
      },
      select: EXPECTED_SELECT,
    });
    expect(result).toEqual(SAMPLE_USER_ROW);
  });

  it('update atualiza campos do usuário e retorna entidade atualizada', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_USER_ROW,
      firstName: 'Novo Nome',
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('u-1', { firstName: 'Novo Nome' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u-1' },
      data: { firstName: 'Novo Nome' },
      select: EXPECTED_SELECT,
    });
    expect(result.firstName).toBe('Novo Nome');
  });

  it('delete remove usuário por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('u-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 'u-1' } });
  });
});
