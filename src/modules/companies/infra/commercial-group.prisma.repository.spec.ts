import { PrismaCommercialGroupRepository } from './commercial-group.prisma.repository';

describe('PrismaCommercialGroupRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
    findCompanies?: jest.Mock;
  }) {
    const prisma = {
      grupoComercial: {
        findMany: mocks?.findMany ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
      empresa: {
        findMany: mocks?.findCompanies ?? jest.fn(),
      },
    };
    const sut = new PrismaCommercialGroupRepository(prisma);
    return { sut, prisma };
  }

  const SAMPLE_GROUP = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_GROUP_SELECT = {
    id: true,
    name: true,
    color: true,
    createdAt: true,
    updatedAt: true,
  };

  const EXPECTED_COMPANY_SELECT = {
    id: true,
    name: true,
    cnpj: true,
    city: true,
    status: true,
    grupoId: true,
    createdAt: true,
    updatedAt: true,
  };

  it('findAll retorna todos os grupos comerciais', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_GROUP]);
    const { sut } = makeSut({ findMany });

    const result = await sut.findAll();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { name: 'asc' },
      select: EXPECTED_GROUP_SELECT,
    });
    expect(result).toEqual([SAMPLE_GROUP]);
  });

  it('findById retorna grupo ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_GROUP)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('g-1');
    expect(found).toEqual(SAMPLE_GROUP);

    const missing = await sut.findById('g-ghost');
    expect(missing).toBeNull();
  });

  it('findByName retorna grupo ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_GROUP)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByName('Coopercitrus');
    expect(findUnique).toHaveBeenCalledWith({
      where: { name: 'Coopercitrus' },
      select: EXPECTED_GROUP_SELECT,
    });
    expect(found).toEqual(SAMPLE_GROUP);
  });

  it('create insere novo grupo comercial', async () => {
    const create = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const { sut } = makeSut({ create });

    const result = await sut.create({
      name: 'Coopercitrus',
      color: '#16a34a',
    });

    expect(create).toHaveBeenCalledWith({
      data: { name: 'Coopercitrus', color: '#16a34a' },
      select: EXPECTED_GROUP_SELECT,
    });
    expect(result).toEqual(SAMPLE_GROUP);
  });

  it('update atualiza campos do grupo', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_GROUP,
      name: 'Novo Grupo',
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('g-1', { name: 'Novo Grupo' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'g-1' },
      data: { name: 'Novo Grupo' },
      select: EXPECTED_GROUP_SELECT,
    });
    expect(result.name).toBe('Novo Grupo');
  });

  it('delete remove grupo por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('g-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 'g-1' } });
  });

  it('findCompaniesByGroupId retorna empresas pertencentes ao grupo', async () => {
    const sampleCompany = {
      id: 'e-1',
      name: 'Empresa 1',
      cnpj: null,
      city: 'Rifaina',
      status: 'ATIVA' as const,
      grupoId: 'g-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const findCompanies = jest.fn().mockResolvedValue([sampleCompany]);
    const { sut } = makeSut({ findCompanies });

    const result = await sut.findCompaniesByGroupId('g-1');

    expect(findCompanies).toHaveBeenCalledWith({
      where: { grupoId: 'g-1' },
      orderBy: { name: 'asc' },
      select: EXPECTED_COMPANY_SELECT,
    });
    expect(result).toEqual([sampleCompany]);
  });
});
