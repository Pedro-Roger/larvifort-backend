import { PrismaFieldSearchRepository } from './field.prisma.repository';

describe('PrismaFieldSearchRepository', () => {
  const sampleRow = {
    id: 'search-1',
    clienteId: 'cli-1',
    cliente: {
      id: 'cli-1',
      firstName: 'Carlos',
      lastName: 'Silva',
      email: 'carlos@fazenda.com',
      phone: '11999999999',
      cidade: 'Natal',
    },
    dataPesquisa: new Date('2026-09-08T00:00:00.000Z'),
    responsavelId: 'user-1',
    responsavel: {
      id: 'user-1',
      firstName: 'Fernando',
      lastName: 'Almeida',
      email: 'fernando@larvifort.com.br',
    },
    larvas: ['Larvifort', 'Outra'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [] as string[],
    outroMotivo: null,
    uniformidadeBercario: 'OTIMA' as const,
    uniformidadeCultivo: 'BOA' as const,
    sobrevBercario: 85,
    sobrevCultivo: 90,
    resultadosUltimoCiclo: 'Excelente',
    observacoes: 'Tudo certo',
    createdAt: new Date('2026-09-08T00:00:00.000Z'),
    updatedAt: new Date('2026-09-08T00:00:00.000Z'),
  };

  const EXPECTED_SELECT = {
    id: true,
    clienteId: true,
    cliente: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        cidade: true,
      },
    },
    dataPesquisa: true,
    responsavelId: true,
    responsavel: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    },
    larvas: true,
    maioriaLarvifort: true,
    parouLarvifort: true,
    motivosSaida: true,
    outroMotivo: true,
    uniformidadeBercario: true,
    uniformidadeCultivo: true,
    sobrevBercario: true,
    sobrevCultivo: true,
    resultadosUltimoCiclo: true,
    observacoes: true,
    createdAt: true,
    updatedAt: true,
  };

  function makeSut(mocks?: {
    findMany?: jest.Mock;
    count?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      fieldSearch: {
        findMany: mocks?.findMany ?? jest.fn(),
        count: mocks?.count ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaFieldSearchRepository(prisma);
    return { sut, prisma: prisma.fieldSearch };
  }

  it('deve listar pesquisas com paginação e filtros', async () => {
    const fromDate = new Date('2026-09-01');
    const toDate = new Date('2026-09-30');
    const findMany = jest.fn().mockResolvedValue([sampleRow]);
    const count = jest.fn().mockResolvedValue(1);
    const { sut } = makeSut({ findMany, count });

    const result = await sut.findMany({
      clienteId: 'cli-1',
      somenteLarvifort: true,
      de: fromDate,
      ate: toDate,
      page: 1,
      limit: 10,
    });

    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.data[0]?.cliente?.firstName).toBe('Carlos');
    expect(result.data[0]?.responsavel?.email).toBe(
      'fernando@larvifort.com.br',
    );
    expect(findMany).toHaveBeenCalledWith({
      where: {
        clienteId: 'cli-1',
        maioriaLarvifort: true,
        dataPesquisa: {
          gte: fromDate,
          lte: toDate,
        },
      },
      skip: 0,
      take: 10,
      orderBy: { dataPesquisa: 'desc' },
      select: EXPECTED_SELECT,
    });
  });

  it('deve buscar pesquisa por id', async () => {
    const findUnique = jest.fn().mockResolvedValue(sampleRow);
    const { sut } = makeSut({ findUnique });

    const result = await sut.findById('search-1');
    expect(result).toBeDefined();
    expect(result?.id).toBe('search-1');
    expect(result?.larvas).toEqual(['Larvifort', 'Outra']);
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'search-1' },
      select: EXPECTED_SELECT,
    });
  });

  it('deve retornar null quando busca por id não encontrar registro', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const { sut } = makeSut({ findUnique });

    const result = await sut.findById('search-ghost');
    expect(result).toBeNull();
  });

  it('deve criar uma nova pesquisa', async () => {
    const create = jest.fn().mockResolvedValue(sampleRow);
    const { sut } = makeSut({ create });

    const dataPesquisa = new Date('2026-09-08');
    const result = await sut.create({
      clienteId: 'cli-1',
      dataPesquisa,
      larvas: ['Larvifort'],
      maioriaLarvifort: true,
      parouLarvifort: false,
      motivosSaida: [],
    });

    expect(result.id).toBe('search-1');
    expect(create).toHaveBeenCalledWith({
      data: {
        clienteId: 'cli-1',
        dataPesquisa,
        responsavelId: undefined,
        larvas: ['Larvifort'],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
        outroMotivo: undefined,
        uniformidadeBercario: undefined,
        uniformidadeCultivo: undefined,
        sobrevBercario: undefined,
        sobrevCultivo: undefined,
        resultadosUltimoCiclo: undefined,
        observacoes: undefined,
      },
      select: EXPECTED_SELECT,
    });
  });

  it('deve atualizar uma pesquisa existente', async () => {
    const update = jest.fn().mockResolvedValue(sampleRow);
    const { sut } = makeSut({ update });

    const result = await sut.update('search-1', {
      sobrevCultivo: 95,
    });

    expect(result.id).toBe('search-1');
    expect(update).toHaveBeenCalledWith({
      where: { id: 'search-1' },
      data: { sobrevCultivo: 95 },
      select: EXPECTED_SELECT,
    });
  });

  it('deve deletar uma pesquisa', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('search-1');
    expect(del).toHaveBeenCalledWith({
      where: { id: 'search-1' },
    });
  });
});
