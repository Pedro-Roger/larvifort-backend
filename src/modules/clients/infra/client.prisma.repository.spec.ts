import { PrismaClientRepository } from './client.prisma.repository';

describe('PrismaClientRepository', () => {
  function makeSut(mocks?: {
    findMany?: jest.Mock;
    count?: jest.Mock;
    findUnique?: jest.Mock;
    create?: jest.Mock;
    update?: jest.Mock;
    delete?: jest.Mock;
  }) {
    const prisma = {
      cliente: {
        findMany: mocks?.findMany ?? jest.fn(),
        count: mocks?.count ?? jest.fn(),
        findUnique: mocks?.findUnique ?? jest.fn(),
        create: mocks?.create ?? jest.fn(),
        update: mocks?.update ?? jest.fn(),
        delete: mocks?.delete ?? jest.fn(),
      },
    };
    const sut = new PrismaClientRepository(prisma);
    return { sut, prisma: prisma.cliente };
  }

  const SAMPLE_CLIENT_ROW = {
    id: 'c-1',
    firstName: 'João',
    lastName: 'Pescador',
    email: 'joao@fazenda.com.br',
    phone: '11999999999',
    birthdate: new Date('1980-05-10'),
    cpfCnpj: '12345678901',
    statusLead: 'NOVO' as const,
    origem: 'Site',
    pais: 'Brasil',
    cidade: 'Rifaina',
    uf: 'SP',
    endereco: 'Fazenda Rio Grande',
    observacoes: 'Cliente potencial',
    empresaId: 'e-1',
    laminaAgua: 5000,
    qtdViveiros: 4,
    densidade: 30,
    producaoMedia: 12000,
    temBercario: true,
    qtdBercarios: 2,
    volumeBercarios: 500,
    alimentadorAutomatico: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-02'),
  };

  const EXPECTED_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    birthdate: true,
    cpfCnpj: true,
    statusLead: true,
    origem: true,
    pais: true,
    cidade: true,
    uf: true,
    endereco: true,
    observacoes: true,
    empresaId: true,
    laminaAgua: true,
    qtdViveiros: true,
    densidade: true,
    producaoMedia: true,
    temBercario: true,
    qtdBercarios: true,
    volumeBercarios: true,
    alimentadorAutomatico: true,
    createdAt: true,
    updatedAt: true,
  };

  it('findMany busca clientes com filtros e paginação', async () => {
    const findMany = jest.fn().mockResolvedValue([SAMPLE_CLIENT_ROW]);
    const count = jest.fn().mockResolvedValue(1);
    const { sut } = makeSut({ findMany, count });

    const result = await sut.findMany({
      page: 1,
      limit: 10,
      search: 'joao',
      status: 'NOVO',
      empresaId: 'e-1',
      cidade: 'Rifaina',
    });

    expect(findMany).toHaveBeenCalledWith({
      where: {
        statusLead: 'NOVO',
        empresaId: 'e-1',
        cidade: { contains: 'Rifaina', mode: 'insensitive' },
        OR: [
          { firstName: { contains: 'joao', mode: 'insensitive' } },
          { lastName: { contains: 'joao', mode: 'insensitive' } },
          { email: { contains: 'joao', mode: 'insensitive' } },
          { cpfCnpj: { contains: 'joao', mode: 'insensitive' } },
          { cidade: { contains: 'joao', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: EXPECTED_SELECT,
    });
    expect(result.data).toEqual([SAMPLE_CLIENT_ROW]);
    expect(result.total).toBe(1);
  });

  it('findById retorna cliente ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_CLIENT_ROW)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findById('c-1');
    expect(found).toEqual(SAMPLE_CLIENT_ROW);

    const missing = await sut.findById('c-ghost');
    expect(missing).toBeNull();
  });

  it('findByCpfCnpj retorna cliente ou null', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce(SAMPLE_CLIENT_ROW)
      .mockResolvedValueOnce(null);
    const { sut } = makeSut({ findUnique });

    const found = await sut.findByCpfCnpj('12345678901');
    expect(found).toEqual(SAMPLE_CLIENT_ROW);

    const missing = await sut.findByCpfCnpj('00000000000');
    expect(missing).toBeNull();
  });

  it('create insere cliente garantindo coerência de berçário', async () => {
    const create = jest.fn().mockResolvedValue({
      ...SAMPLE_CLIENT_ROW,
      temBercario: false,
      qtdBercarios: null,
      volumeBercarios: null,
    });
    const { sut } = makeSut({ create });

    const result = await sut.create({
      firstName: 'João',
      lastName: 'Pescador',
      email: 'joao@fazenda.com.br',
      temBercario: false,
      qtdBercarios: 5,
      volumeBercarios: 100,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        firstName: 'João',
        lastName: 'Pescador',
        email: 'joao@fazenda.com.br',
        phone: null,
        birthdate: null,
        cpfCnpj: null,
        statusLead: 'NOVO',
        origem: null,
        pais: 'Brasil',
        cidade: null,
        uf: null,
        endereco: null,
        observacoes: null,
        empresaId: null,
        laminaAgua: null,
        qtdViveiros: null,
        densidade: null,
        producaoMedia: null,
        temBercario: false,
        qtdBercarios: null,
        volumeBercarios: null,
        alimentadorAutomatico: false,
      },
      select: EXPECTED_SELECT,
    });
    expect(result.temBercario).toBe(false);
  });

  it('update atualiza cliente e zera berçários quando temBercario passa a ser false', async () => {
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_CLIENT_ROW,
      temBercario: false,
      qtdBercarios: null,
      volumeBercarios: null,
    });
    const { sut } = makeSut({ update });

    const result = await sut.update('c-1', { temBercario: false });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'c-1' },
      data: {
        temBercario: false,
        qtdBercarios: null,
        volumeBercarios: null,
      },
      select: EXPECTED_SELECT,
    });
    expect(result.temBercario).toBe(false);
  });

  it('delete remove cliente por id', async () => {
    const del = jest.fn().mockResolvedValue({});
    const { sut } = makeSut({ delete: del });

    await sut.delete('c-1');

    expect(del).toHaveBeenCalledWith({ where: { id: 'c-1' } });
  });
});
