import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { METRICS_REPOSITORY } from './metrics.repository';
import type { MetricsRepository } from './metrics.repository';
import type {
  MetricsActor,
  MetricFilter,
  NewMetricGoal,
  MetricEvent,
  MetricPeriod,
} from '../domain/metrics';

function bucket(date: string, period: MetricPeriod): string {
  const d = new Date(date);
  if (period === 'YEARLY') return `${d.getUTCFullYear()}`;
  if (period === 'MONTHLY') return d.toISOString().slice(0, 7);
  if (period === 'WEEKLY')
    d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
@Injectable()
export class MetricsUseCases {
  constructor(
    @Inject(METRICS_REPOSITORY) private readonly repo: MetricsRepository,
  ) {}
  async options(actor: MetricsActor) {
    return { teams: await this.repo.teams(actor) };
  }
  async goals(actor: MetricsActor) {
    return this.repo.goals((await this.repo.teams(actor)).map((t) => t.id));
  }
  private async validate(actor: MetricsActor, input: MetricFilter) {
    const start = new Date(input.startDate),
      end = new Date(input.endDate);
    if (
      !Number.isFinite(+start) ||
      !Number.isFinite(+end) ||
      end < start ||
      +end - +start > 366 * 5 * 86400000
    )
      throw new BadRequestException('Período inválido. Use até cinco anos.');
    const team = (await this.repo.teams(actor)).find(
      (t) => t.id === input.teamId,
    );
    if (!team)
      throw new NotFoundException('Time não encontrado ou sem acesso.');
    const userIds = input.userIds?.length
      ? input.userIds
      : team.members.map((m) => m.id);
    if (
      userIds.some((id) => !team.members.some((m) => m.id === id)) ||
      new Set(userIds).size !== userIds.length
    )
      throw new BadRequestException(
        'Pessoas devem pertencer ao time selecionado e estar ativas.',
      );
    return { ...input, userIds };
  }
  async create(actor: MetricsActor, input: NewMetricGoal) {
    if (
      !input.name.trim() ||
      !Number.isFinite(input.target) ||
      input.target <= 0 ||
      !input.userIds.length
    )
      throw new BadRequestException('Preencha nome, pessoas e meta positiva.');
    await this.validate(actor, input);
    return this.repo.create({
      ...input,
      name: input.name.trim(),
      createdBy: actor.id,
    });
  }
  async analysis(actor: MetricsActor, input: MetricFilter) {
    const filter = await this.validate(actor, input);
    const events = await this.repo.events(filter);
    const orders = events.filter((e) => e.kind === 'order');
    const validOrders = orders.filter((e) => e.phase !== 'CANCELLED');
    const visits = events.filter((e) => e.kind === 'visit');
    const selected = events.filter((e) =>
      input.type === 'SALES'
        ? e.kind === 'order' && e.phase !== 'CANCELLED'
        : input.type === 'RETURN'
          ? e.kind === 'order' && e.phase !== 'CANCELLED' && e.returning
          : input.type === 'VISITS'
            ? e.kind === 'visit'
            : input.type === 'PROSPECTING'
              ? e.kind === 'prospect'
              : e.kind === 'activity',
    );
    const totals = new Map<
      string,
      { label: string; value: number; quantity: number }
    >();
    for (
      let d = new Date(input.startDate);
      d <= new Date(input.endDate);
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const label = bucket(d.toISOString(), input.period);
      totals.set(label, { label, value: 0, quantity: 0 });
    }
    const returnedInBucket = new Set<string>();
    for (const e of selected) {
      const key = `${bucket(e.date, input.period)}:${e.clientId}`;
      if (input.type === 'RETURN' && returnedInBucket.has(key)) continue;
      returnedInBucket.add(key);
      const row = totals.get(bucket(e.date, input.period));
      if (row) {
        row.quantity++;
        row.value += input.type === 'SALES' ? e.value : 1;
      }
    }
    const series = [...totals.values()];
    const unique = (rows: MetricEvent[]) =>
      new Set(rows.map((e) => e.clientId).filter(Boolean)).size;
    return {
      series,
      comparison: [false, true].map((returning) => {
        const rows = validOrders.filter(
          (e) => Boolean(e.returning) === returning,
        );
        const ids = new Set(rows.map((e) => e.clientId));
        return {
          label: returning ? 'Recorrentes' : 'Primeiro pedido',
          clients: unique(rows),
          visits: visits.filter((e) => ids.has(e.clientId)).length,
          orders: rows.length,
          frequency: unique(rows)
            ? Number((rows.length / unique(rows)).toFixed(2))
            : 0,
        };
      }),
      distribution: [
        {
          label: 'Novos',
          value: orders.filter((e) =>
            ['DRAFT', 'ABERTO'].includes(e.phase ?? ''),
          ).length,
        },
        {
          label: 'Em andamento',
          value: orders.filter((e) =>
            ['PENDING', 'APROVADO'].includes(e.phase ?? ''),
          ).length,
        },
        {
          label: 'Concluídos',
          value: orders.filter((e) =>
            ['FATURADO', 'ENTREGUE'].includes(e.phase ?? ''),
          ).length,
        },
        {
          label: 'Cancelados',
          value: orders.filter((e) => e.phase === 'CANCELLED').length,
        },
      ],
      frequency: series.map((s) => ({
        label: s.label,
        value: validOrders.filter(
          (e) => bucket(e.date, input.period) === s.label,
        ).length,
      })),
      summary: {
        value:
          input.type === 'RETURN'
            ? unique(selected)
            : series.reduce((sum, s) => sum + s.value, 0),
        quantity: input.type === 'RETURN' ? unique(selected) : selected.length,
        clients: unique([...validOrders, ...visits]),
        visits: visits.length,
      },
      definitions: [
        'Vendas: valor de pedidos, sem orçamentos, excluídos e cancelados.',
        'Atividades: tarefas concluídas pela data de atualização. Visitas: compromissos agendados.',
        'Prospecção: novos contatos vinculados a trabalho das pessoas selecionadas.',
        'Retorno: clientes únicos com pedido anterior não cancelado na carteira selecionada, por período e no total; não mede reativação após inatividade.',
      ],
    };
  }
}
