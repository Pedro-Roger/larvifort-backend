import { PrismaCompanyRepository } from './company.prisma.repository';

describe('PrismaCompanyRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    count?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      empresa: {
        findMany: mocks?.findMany ?? jest.fn(),
        count: mocks?.count ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaCompanyRepository(prisma);
    return { sut, prisma: prisma.empresa };
  }

  const SAMPLE_COMPANY = {
    id: 'e-1',
    name: 'Fazenda Rio Grande Ltda',
    cnpj: '12345678000199',
    city: 'Rifaina',
    status: 'ATIVA' as const,
    grupoId: 'g-1',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_SELECT = {
    id: true,
    name: true,
    cnpj: true,
    city: true,
    status: true,
    grupoId: true,
    createdAt: true,
    updatedAt: true,
  };

  it('findMany busca empresas com filtros de grupo, status, search e paginação', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_COMPANY]);
    const count = jest.fn().mockResolvedValue(1);
    const { sut } = makeSut({ findMany, count });

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      search: 'rio grande',
      grupoId: 'g-1',
      status: 'ATIVA',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        grupoId: 'g-1',
        status: 'ATIVA',
        OR: [
          { name: { contains: 'rio grande', mode: 'insensitive' } },
          { cnpj: { contains: 'rio grande', mode: 'insensitive' } },
          { city: { contains: 'rio grande', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: EXPECTED_SELECT,
    });
    expect(result.data).toEqual([SAMPLE_COMPANY]);
    expect(result.total).toBe(1);
  });

  it('findById retorna empresa ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_COMPANY)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('e-1');
    expect(found).toEqual(SAMPLE_COMPANY);

    const missing = await sut.findById('e-ghost');
    expect(missing).toBeNull();
  });

  it('findByCnpj retorna empresa ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_COMPANY)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByCnpj('12345678000199');
    expect(findUnique).toHaveBeenCalledWith({
      where: { cnpj: '12345678000199' },
      select: EXPECTED_SELECT,
    });
    expect(found).toEqual(SAMPLE_COMPANY);
  });

  it('create insere nova empresa e retorna registro', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const { sut } = makeSut({ create });

    const result = await sut.create({
      name: 'Fazenda Rio Grande Ltda',
      cnpj: '12345678000199',
      city: 'Rifaina',
      status: 'ATIVA',
      grupoId: 'g-1',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Fazenda Rio Grande Ltda',
        cnpj: '12345678000199',
        city: 'Rifaina',
        status: 'ATIVA',
        grupoId: 'g-1',
      },
      select: EXPECTED_SELECT,
    });
    expect(result).toEqual(SAMPLE_COMPANY);
  });

  it('update atualiza campos da empresa', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_COMPANY,
      name: 'Novo Nome',
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('e-1', { name: 'Novo Nome' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'e-1' },
      data: { name: 'Novo Nome' },
      select: EXPECTED_SELECT,
    });
    expect(result.name).toBe('Novo Nome');
  });

  it('delete remove empresa por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('e-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 'e-1' } });
  });
});
