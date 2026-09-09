import { PrismaService } from '../../../core/database/prisma.service';
import { DashboardPrismaRepository } from './dashboard.prisma.repository';

describe('DashboardPrismaRepository', () => {
  function makeSut() {
    const prisma = {
      cliente: {
        count: jest.fn().mockResolvedValueOnce(10).mockResolvedValueOnce(4),
        findMany: jest.fn(),
      },
      sale: { aggregate: jest.fn() },
      meta: { aggregate: jest.fn() },
      appointment: { groupBy: jest.fn() },
      user: { findMany: jest.fn() },
    };
    return {
      sut: new DashboardPrismaRepository(prisma as unknown as PrismaService),
      prisma,
    };
  }

  it('calcula resumo com taxa, receita, ticket e metas', async () => {
    const { sut, prisma } = makeSut();
    prisma.sale.aggregate.mockResolvedValue({
      _sum: { valor: 3000 },
      _count: { _all: 3 },
      _avg: { valor: 1000 },
    });
    prisma.meta.aggregate.mockResolvedValue({
      _sum: { metaValor: 5000, metaVolume: 5 },
    });

    await expect(sut.resumo()).resolves.toEqual({
      totalClientes: 10,
      clientesAtivos: 4,
      taxaConversao: 40,
      receitaTotal: 3000,
      ticketMedio: 1000,
      vendasMes: 3,
      metaValor: 5000,
      metaVolume: 5,
    });
  });

  it('retorna frequência de visitas por cliente', async () => {
    const { sut, prisma } = makeSut();
    prisma.appointment.groupBy.mockResolvedValue([
      { clienteId: 'c-1', _count: { _all: 3 } },
    ]);
    prisma.cliente.findMany.mockResolvedValue([
      { id: 'c-1', firstName: 'Ana', lastName: 'Silva' },
    ]);

    await expect(sut.frequenciaVisitas()).resolves.toEqual([
      { cliente: 'Ana Silva', visitas: 3 },
    ]);
  });

  it('monta atividade com última e próxima visita', async () => {
    const { sut, prisma } = makeSut();
    const ontem = new Date(Date.now() - 86_400_000);
    const amanha = new Date(Date.now() + 86_400_000);
    prisma.cliente.findMany.mockResolvedValue([
      {
        firstName: 'Ana',
        lastName: 'Silva',
        statusLead: 'CLIENTE_ATIVO',
        appointments: [{ data: ontem }, { data: amanha }],
      },
    ]);

    await expect(sut.atividadeClientes()).resolves.toEqual([
      {
        cliente: 'Ana Silva',
        ultimaVisita: ontem.toISOString(),
        proximaVisita: amanha.toISOString(),
        status: 'CLIENTE_ATIVO',
      },
    ]);
  });

  it('calcula taxa e ticket e usa cache por 60 segundos', async () => {
    const { sut, prisma } = makeSut();
    prisma.sale.aggregate.mockResolvedValue({ _avg: { valor: 250 } });

    const first = await sut.taxaVendas();
    const second = await sut.taxaVendas();

    expect(first).toEqual({ taxaConversao: 40, ticketMedio: 250 });
    expect(second).toEqual(first);
    expect(prisma.sale.aggregate).toHaveBeenCalledTimes(1);
  });

  it('agrega valor atual e metas mensais com cache', async () => {
    const { sut, prisma } = makeSut();
    prisma.sale.aggregate.mockResolvedValue({ _sum: { valor: 2000 } });
    prisma.meta.aggregate.mockResolvedValue({
      _sum: { metaValor: 5000, metaVolume: 8 },
    });

    const first = await sut.metas();
    const second = await sut.metas();

    expect(first).toEqual({
      valorAtual: 2000,
      valorMeta: 5000,
      metaVolume: 8,
    });
    expect(second).toEqual(first);
    expect(prisma.meta.aggregate).toHaveBeenCalledTimes(1);
  });

  it('conta tarefas abertas e em andamento por usuário', async () => {
    const { sut, prisma } = makeSut();
    prisma.user.findMany.mockResolvedValue([
      {
        id: 'u-1',
        firstName: 'Ana',
        lastName: 'Silva',
        assignedTasks: [
          { status: 'BACKLOG' },
          { status: 'EM_REVISAO' },
          { status: 'EM_ANDAMENTO' },
        ],
      },
    ]);

    await expect(sut.workload()).resolves.toEqual([
      {
        userId: 'u-1',
        userName: 'Ana Silva',
        tarefasAbertas: 2,
        tarefasEmAndamento: 1,
      },
    ]);
  });
});
