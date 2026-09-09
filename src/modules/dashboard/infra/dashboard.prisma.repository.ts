import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import type { DashboardRepositoryPort } from '../domain/dashboard.repository.port';

const CACHE_TTL_MS = 60_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class DashboardPrismaRepository implements DashboardRepositoryPort {
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(private readonly prisma: PrismaService) {}

  async resumo() {
    const inicioMes = this.inicioMesAtual();
    const mes = this.mesAtual();
    const [totalClientes, clientesAtivos, vendas, metas] = await Promise.all([
      this.prisma.cliente.count(),
      this.prisma.cliente.count({ where: { statusLead: 'CLIENTE_ATIVO' } }),
      this.prisma.sale.aggregate({
        where: { data: { gte: inicioMes } },
        _sum: { valor: true },
        _count: { _all: true },
        _avg: { valor: true },
      }),
      this.prisma.meta.aggregate({
        where: { mes },
        _sum: { metaValor: true, metaVolume: true },
      }),
    ]);

    const vendasMes = vendas._count._all;
    return {
      totalClientes,
      clientesAtivos,
      taxaConversao: this.percentual(clientesAtivos, totalClientes),
      receitaTotal: vendas._sum.valor ?? 0,
      ticketMedio: vendas._avg.valor ?? 0,
      vendasMes,
      metaValor: metas._sum.metaValor ?? 0,
      metaVolume: metas._sum.metaVolume ?? 0,
    };
  }

  async frequenciaVisitas() {
    const visitas = await this.prisma.appointment.groupBy({
      by: ['clienteId'],
      where: { tipo: 'VISITA', clienteId: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { clienteId: 'desc' } },
    });
    const ids = visitas
      .map((visita) => visita.clienteId)
      .filter((id): id is string => id !== null);
    const clientes = await this.prisma.cliente.findMany({
      where: { id: { in: ids } },
      select: { id: true, firstName: true, lastName: true },
    });
    const nomes = new Map(
      clientes.map((cliente) => [
        cliente.id,
        `${cliente.firstName} ${cliente.lastName}`.trim(),
      ]),
    );

    return visitas
      .filter((visita) => visita.clienteId !== null)
      .map((visita) => ({
        cliente: nomes.get(visita.clienteId ?? '') ?? 'Cliente removido',
        visitas: visita._count._all,
      }));
  }

  async atividadeClientes() {
    const hoje = new Date();
    const clientes = await this.prisma.cliente.findMany({
      select: {
        firstName: true,
        lastName: true,
        statusLead: true,
        appointments: {
          where: { tipo: 'VISITA' },
          select: { data: true },
          orderBy: { data: 'asc' },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return clientes.map((cliente) => {
      const anteriores = cliente.appointments.filter(
        (appointment) => appointment.data < hoje,
      );
      const proximas = cliente.appointments.filter(
        (appointment) => appointment.data >= hoje,
      );
      return {
        cliente: `${cliente.firstName} ${cliente.lastName}`.trim(),
        ultimaVisita: this.dataIso(anteriores.at(-1)?.data),
        proximaVisita: this.dataIso(proximas[0]?.data),
        status: cliente.statusLead,
      };
    });
  }

  taxaVendas() {
    return this.cached('taxa-vendas', async () => {
      const [totalClientes, clientesAtivos, vendas] = await Promise.all([
        this.prisma.cliente.count(),
        this.prisma.cliente.count({ where: { statusLead: 'CLIENTE_ATIVO' } }),
        this.prisma.sale.aggregate({ _avg: { valor: true } }),
      ]);
      return {
        taxaConversao: this.percentual(clientesAtivos, totalClientes),
        ticketMedio: vendas._avg.valor ?? 0,
      };
    });
  }

  metas() {
    return this.cached('metas', async () => {
      const mes = this.mesAtual();
      const inicioMes = this.inicioMesAtual();
      const [vendas, metas] = await Promise.all([
        this.prisma.sale.aggregate({
          where: { data: { gte: inicioMes } },
          _sum: { valor: true },
        }),
        this.prisma.meta.aggregate({
          where: { mes },
          _sum: { metaValor: true, metaVolume: true },
        }),
      ]);
      return {
        valorAtual: vendas._sum.valor ?? 0,
        valorMeta: metas._sum.metaValor ?? 0,
        metaVolume: metas._sum.metaVolume ?? 0,
      };
    });
  }

  async workload() {
    const users = await this.prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        assignedTasks: {
          where: { status: { in: ['BACKLOG', 'EM_ANDAMENTO', 'EM_REVISAO'] } },
          select: { status: true },
        },
      },
      orderBy: { firstName: 'asc' },
    });

    return users.map((user) => ({
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`.trim(),
      tarefasAbertas: user.assignedTasks.filter(
        (task) => task.status === 'BACKLOG' || task.status === 'EM_REVISAO',
      ).length,
      tarefasEmAndamento: user.assignedTasks.filter(
        (task) => task.status === 'EM_ANDAMENTO',
      ).length,
    }));
  }

  private cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key) as CacheEntry<T> | undefined;
    if (cached && cached.expiresAt > Date.now())
      return Promise.resolve(cached.value);
    return loader().then((value) => {
      this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    });
  }

  private percentual(parte: number, total: number): number {
    return total === 0 ? 0 : Number(((parte / total) * 100).toFixed(2));
  }

  private mesAtual(): string {
    return new Date().toISOString().slice(0, 7);
  }

  private inicioMesAtual(): Date {
    const agora = new Date();
    return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1));
  }

  private dataIso(data?: Date): string {
    return data?.toISOString() ?? '';
  }
}
