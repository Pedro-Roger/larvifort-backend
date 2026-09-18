import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  Prisma,
  type MetricGoal as PrismaMetricGoal,
} from '../../../../generated/prisma/client';
import type { MetricsRepository } from '../application/metrics.repository';
import {
  metricPeriods,
  metricTypes,
  type MetricEvent,
  type MetricFilter,
  type MetricGoal,
  type MetricPeriod,
  type MetricsActor,
  type MetricType,
  type NewMetricGoal,
} from '../domain/metrics';

const metricTypeValues: ReadonlySet<string> = new Set(metricTypes);
const metricPeriodValues: ReadonlySet<string> = new Set(metricPeriods);

function isMetricType(value: string): value is MetricType {
  return metricTypeValues.has(value);
}

function isMetricPeriod(value: string): value is MetricPeriod {
  return metricPeriodValues.has(value);
}
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
    const goals = await this.prisma.metricGoal.findMany({
      where: { teamId: { in: teamIds } },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((goal) => this.toMetricGoal(goal));
  }
  async create(
    input: NewMetricGoal & { createdBy: string },
  ): Promise<MetricGoal> {
    const goal = await this.prisma.metricGoal.create({
      data: input,
    });
    return this.toMetricGoal(goal);
  }
  async events(
    filter: MetricFilter & { userIds: string[] },
  ): Promise<MetricEvent[]> {
    const start = new Date(filter.startDate),
      end = new Date(filter.endDate);
    if (filter.endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
    if (!filter.userIds.length) return [];
    const range = { gte: start, lte: end },
      users = { in: filter.userIds };
    const orderUserIds = Prisma.join(filter.userIds);
    const orders = await this.prisma.$queryRaw<
      {
        id: string;
        orderDate: Date;
        totalAmount: number;
        clientId: string;
        phase: string;
      }[]
    >`
      SELECT id, "orderDate", "totalAmount", "clientId", phase::text AS phase
      FROM "Order"
      WHERE "deletedAt" IS NULL
        AND status::text = 'PEDIDO'
        AND "orderDate" <= ${end}
        AND (
          "salesRepUserId" IN (${orderUserIds})
          OR ("salesRepUserId" IS NULL AND "creatorId" IN (${orderUserIds}))
        )
      ORDER BY "orderDate" ASC, id ASC
    `;
    const [visits, tasks, prospects] = await Promise.all([
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

  private toMetricGoal(goal: PrismaMetricGoal): MetricGoal {
    if (!isMetricType(goal.type)) {
      throw new Error(`Invalid metric goal type: ${goal.type}`);
    }
    if (!isMetricPeriod(goal.period)) {
      throw new Error(`Invalid metric goal period: ${goal.period}`);
    }
    return {
      ...goal,
      type: goal.type,
      period: goal.period,
    };
  }
}
