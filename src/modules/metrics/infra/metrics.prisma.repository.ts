import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import type { MetricsRepository } from '../application/metrics.repository';
import type {
  MetricsActor,
  NewMetricGoal,
  MetricFilter,
  MetricGoal,
  MetricEvent,
} from '../domain/metrics';
@Injectable()
export class MetricsPrismaRepository implements MetricsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async teams(actor: MetricsActor) {
    const user = await this.prisma.user.findUnique({
      where: { id: actor.id },
      select: { active: true, role: true, teamId: true },
    });
    if (!user?.active) return [];
    const teams = await this.prisma.team.findMany({
      where: user.role === 'ADMIN' ? {} : { id: user.teamId ?? '' },
      include: {
        members: {
          where: { active: true },
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return teams.map((t) => ({
      id: t.id,
      name: t.name,
      members: t.members.map((m) => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`.trim(),
      })),
    }));
  }
  async goals(teamIds: string[]): Promise<MetricGoal[]> {
    return this.prisma.metricGoal.findMany({
      where: { teamId: { in: teamIds } },
      orderBy: { createdAt: 'desc' },
    }) as unknown as Promise<MetricGoal[]>;
  }
  async create(
    input: NewMetricGoal & { createdBy: string },
  ): Promise<MetricGoal> {
    return this.prisma.metricGoal.create({
      data: input,
    }) as unknown as Promise<MetricGoal>;
  }
  async events(
    filter: MetricFilter & { userIds: string[] },
  ): Promise<MetricEvent[]> {
    const start = new Date(filter.startDate),
      end = new Date(filter.endDate);
    if (filter.endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
    const range = { gte: start, lte: end },
      users = { in: filter.userIds };
    const [orders, visits, tasks, prospects] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          deletedAt: null,
          status: 'PEDIDO',
          orderDate: { lte: end },
          OR: [
            { salesRepUserId: users },
            { salesRepUserId: null, creatorId: users },
          ],
        },
        select: {
          id: true,
          orderDate: true,
          totalAmount: true,
          clientId: true,
          phase: true,
        },
        orderBy: [{ orderDate: 'asc' }, { id: 'asc' }],
      }),
      this.prisma.appointment.findMany({
        where: { ownerId: users, tipo: 'VISITA', data: range },
        select: { data: true, clienteId: true },
      }),
      this.prisma.task.findMany({
        where: { assigneeId: users, status: 'CONCLUIDO', updatedAt: range },
        select: { updatedAt: true, clienteId: true },
      }),
      this.prisma.cliente.findMany({
        where: {
          createdAt: range,
          statusLead: { in: ['NOVO', 'SEM_CONTATO'] },
          OR: [
            { appointments: { some: { ownerId: users } } },
            { tasks: { some: { assigneeId: users } } },
            {
              orders: {
                some: {
                  deletedAt: null,
                  OR: [
                    { salesRepUserId: users },
                    { salesRepUserId: null, creatorId: users },
                  ],
                },
              },
            },
          ],
        },
        select: { id: true, createdAt: true },
      }),
    ]);
    const seen = new Set<string>();
    const events: MetricEvent[] = [];
    for (const order of orders) {
      const returning = seen.has(order.clientId);
      if (order.phase !== 'CANCELLED') seen.add(order.clientId);
      if (order.orderDate >= start)
        events.push({
          date: order.orderDate.toISOString(),
          value: order.totalAmount,
          kind: 'order',
          clientId: order.clientId,
          phase: order.phase,
          returning,
        });
    }
    return [
      ...events,
      ...visits.map((v) => ({
        date: v.data.toISOString(),
        value: 1,
        kind: 'visit' as const,
        clientId: v.clienteId ?? undefined,
      })),
      ...tasks.map((t) => ({
        date: t.updatedAt.toISOString(),
        value: 1,
        kind: 'activity' as const,
        clientId: t.clienteId ?? undefined,
      })),
      ...prospects.map((p) => ({
        date: p.createdAt.toISOString(),
        value: 1,
        kind: 'prospect' as const,
        clientId: p.id,
      })),
    ];
  }
}
