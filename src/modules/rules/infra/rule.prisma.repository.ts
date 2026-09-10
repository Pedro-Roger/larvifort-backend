import { Inject, Injectable } from '@nestjs/common';
import type { Rule, RuleScope } from '../domain/rule';
import type {
  RuleRepositoryPort,
  CreateRuleData,
  FindRulesFilter,
  UpdateRuleData,
} from '../application/ports/rule-repository.port';

export const PRISMA_RULES_TOKEN = 'PRISMA_RULES_TOKEN';

interface RuleRow {
  id: string;
  name: string;
  description: string | null;
  scope: RuleScope;
  scopeId: string | null;
  projectId: string | null;
  columnId: string | null;
  action:
    | 'ALLOW_MOVE'
    | 'DENY_MOVE'
    | 'REQUIRE_FIELD'
    | 'SET_FIELD'
    | 'TRIGGER_AUTOMATION';
  conditions: Record<string, unknown>;
  parameters: Record<string, unknown>;
  priority: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaRuleCrud {
  rule: {
    findMany(args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy?: Record<string, 'asc' | 'desc'>;
    }): Promise<RuleRow[]>;
    count(args?: { where?: Record<string, unknown> }): Promise<number>;
    findUnique(args: { where: { id: string } }): Promise<RuleRow | null>;
    create(args: { data: Record<string, unknown> }): Promise<RuleRow>;
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<RuleRow>;
    delete(args: { where: { id: string } }): Promise<unknown>;
  };
}

@Injectable()
export class PrismaRuleRepository implements RuleRepositoryPort {
  constructor(
    @Inject(PRISMA_RULES_TOKEN)
    private readonly prisma: PrismaRuleCrud,
  ) {}

  async findMany(
    filter: FindRulesFilter,
  ): Promise<{ data: Rule[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (filter.scope !== undefined) {
      where.scope = filter.scope;
    }
    if (filter.scopeId !== undefined) {
      where.scopeId = filter.scopeId;
    }
    if (filter.projectId !== undefined) {
      where.projectId = filter.projectId;
    }
    if (filter.columnId !== undefined) {
      where.columnId = filter.columnId;
    }
    if (filter.active !== undefined) {
      where.active = filter.active;
    }

    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));
    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      this.prisma.rule.findMany({
        where,
        skip,
        take: limit,
        orderBy: { priority: 'desc' },
      }),
      this.prisma.rule.count({ where }),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }

  async findById(id: string): Promise<Rule | null> {
    const row = await this.prisma.rule.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findApplicableRules(context: {
    userId: string;
    userRole: 'ADMIN' | 'USER';
    teamId: string | null;
    projectId: string;
    columnId: string | null;
  }): Promise<Rule[]> {
    void context; // reserved for future rule filtering
    // Fetch broadly and filter in the engine for flexibility
    const rows = await this.prisma.rule.findMany({
      where: { active: true },
      orderBy: { priority: 'desc' },
    });

    return rows.map((r) => this.toDomain(r));
  }

  async create(data: CreateRuleData): Promise<Rule> {
    const row = await this.prisma.rule.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        scope: data.scope,
        scopeId: data.scopeId ?? null,
        projectId: data.projectId ?? null,
        columnId: data.columnId ?? null,
        action: data.action,
        conditions: data.conditions,
        parameters: data.parameters,
        priority: data.priority ?? 0,
        active: data.active ?? true,
      },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateRuleData): Promise<Rule> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.scopeId !== undefined) updateData.scopeId = data.scopeId;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if (data.columnId !== undefined) updateData.columnId = data.columnId;
    if (data.action !== undefined) updateData.action = data.action;
    if (data.conditions !== undefined) updateData.conditions = data.conditions;
    if (data.parameters !== undefined) updateData.parameters = data.parameters;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.active !== undefined) updateData.active = data.active;

    const row = await this.prisma.rule.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rule.delete({ where: { id } });
  }

  private toDomain(row: RuleRow): Rule {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      scopeId: row.scopeId,
      projectId: row.projectId,
      columnId: row.columnId,
      action: row.action,
      conditions: row.conditions,
      parameters: row.parameters,
      priority: row.priority,
      active: row.active,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
