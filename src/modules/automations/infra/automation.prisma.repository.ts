import { Inject, Injectable } from '@nestjs/common';
import type {
  Automation,
  AutomationAction,
  AutomationCondition,
  AutomationExecution,
  AutomationExecutionResult,
  AutomationTrigger,
} from '../domain/automation';
import type {
  AutomationRepositoryPort,
  CreateAutomationData,
  UpdateAutomationData,
} from '../application/ports/automation-repository.port';

export const PRISMA_AUTOMATIONS_TOKEN = 'PRISMA_AUTOMATIONS_TOKEN';

type AutomationRow = Omit<Automation, 'conditions' | 'actions'> & {
  conditions: unknown;
  actions: unknown;
};

interface ExecutionRow extends AutomationExecution {
  automation: { projetoId: string };
}

interface PrismaAutomationCrud {
  projetoAutomacao: {
    findMany(args: Record<string, unknown>): Promise<AutomationRow[]>;
    findUnique(args: Record<string, unknown>): Promise<AutomationRow | null>;
    create(args: Record<string, unknown>): Promise<AutomationRow>;
    update(args: Record<string, unknown>): Promise<AutomationRow>;
    updateMany(args: Record<string, unknown>): Promise<{ count: number }>;
  };
  automationExecution: {
    findFirst(args: Record<string, unknown>): Promise<{ id: string } | null>;
    create(args: Record<string, unknown>): Promise<{ id: string }>;
    update(args: Record<string, unknown>): Promise<unknown>;
    findMany(args: Record<string, unknown>): Promise<ExecutionRow[]>;
  };
  $transaction<T>(operations: Promise<unknown>[]): Promise<T>;
}

@Injectable()
export class PrismaAutomationRepository implements AutomationRepositoryPort {
  constructor(
    @Inject(PRISMA_AUTOMATIONS_TOKEN)
    private readonly prisma: PrismaAutomationCrud,
  ) {}

  async findMany(projetoId: string): Promise<Automation[]> {
    const rows = await this.prisma.projetoAutomacao.findMany({
      where: { projetoId, deletedAt: null },
      orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<Automation | null> {
    const row = await this.prisma.projetoAutomacao.findUnique({
      where: { id },
    });
    return row && !row.deletedAt ? this.toDomain(row) : null;
  }

  async findActiveByEvent(
    projetoId: string,
    trigger: AutomationTrigger,
  ): Promise<Automation[]> {
    const rows = await this.prisma.projetoAutomacao.findMany({
      where: { projetoId, trigger, isActive: true, deletedAt: null },
      orderBy: { priority: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  async create(data: CreateAutomationData): Promise<Automation> {
    const row = await this.prisma.projetoAutomacao.create({ data });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateAutomationData): Promise<Automation> {
    const row = await this.prisma.projetoAutomacao.update({
      where: { id },
      data,
    });
    return this.toDomain(row);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.projetoAutomacao.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async reorder(projetoId: string, ids: string[]): Promise<void> {
    const operations = ids.map((id, priority) =>
      this.prisma.projetoAutomacao.updateMany({
        where: { id, projetoId, deletedAt: null },
        data: { priority },
      }),
    );
    await this.prisma.$transaction<void>(operations);
  }

  async hasExecution(automationId: string, eventId: string): Promise<boolean> {
    const row = await this.prisma.automationExecution.findFirst({
      where: { automationId, eventId, result: 'SUCCESS' },
      select: { id: true },
    });
    return Boolean(row);
  }

  createExecution(data: {
    automationId: string;
    eventId: string;
    attempt: number;
  }): Promise<{ id: string }> {
    return this.prisma.automationExecution.create({ data });
  }

  async completeExecution(
    id: string,
    data: {
      durationMs: number;
      result: AutomationExecutionResult;
      error: string | null;
    },
  ): Promise<void> {
    await this.prisma.automationExecution.update({
      where: { id },
      data: { ...data, completedAt: new Date() },
    });
  }

  async findHistory(
    projetoId: string,
    limit: number,
  ): Promise<AutomationExecution[]> {
    const rows = await this.prisma.automationExecution.findMany({
      where: { automation: { projetoId } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { automation: { select: { projetoId: true } } },
    });
    return rows.map(({ automation: _automationRelation, ...rest }) => {
      void _automationRelation; // excluded relation, not part of domain
      return rest;
    });
  }

  private toDomain(row: AutomationRow): Automation {
    return {
      ...row,
      conditions: row.conditions as AutomationCondition[],
      actions: row.actions as AutomationAction[],
    };
  }
}
