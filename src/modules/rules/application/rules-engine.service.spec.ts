import { RulesEngineService } from './rules-engine.service';
import type { RuleRepositoryPort } from './ports/rule-repository.port';
import type {
  Rule,
  RuleEvaluationContext,
  RuleEvaluationResult,
} from '../domain/rule';

describe('RulesEngineService', () => {
  const baseDate = new Date('2026-09-10T10:00:00Z');

  function makeRule(overrides: Partial<Rule>): Rule {
    return {
      id: 'rule-1',
      name: 'Regra de teste',
      description: null,
      scope: 'COLUMN',
      scopeId: null,
      projectId: null,
      columnId: null,
      action: 'ALLOW_MOVE',
      conditions: {},
      parameters: {},
      priority: 0,
      active: true,
      createdAt: baseDate,
      updatedAt: baseDate,
      ...overrides,
    };
  }

  function makeContext(
    overrides: Partial<RuleEvaluationContext> = {},
  ): RuleEvaluationContext {
    return {
      userId: 'u-1',
      userRole: 'USER',
      teamId: 'team-1',
      projectId: 'p-1',
      columnId: 'c-1',
      taskId: 't-1',
      fromColumnId: 'c-0',
      toColumnId: 'c-1',
      taskData: { status: 'EM_ANDAMENTO', progresso: 50 },
      ...overrides,
    };
  }

  function makeSut(rules: Rule[]) {
    const findApplicableRules = jest.fn().mockResolvedValue(rules);
    const repo = { findApplicableRules } as unknown as RuleRepositoryPort;
    const sut = new RulesEngineService(repo);
    return { sut, findApplicableRules };
  }

  it('retorna allowed=true quando nenhuma regra aplicável existe', async () => {
    const { sut, findApplicableRules } = makeSut([]);
    const context = makeContext();

    const result = await sut.evaluate(context);
    expect(result).toEqual<RuleEvaluationResult>({
      allowed: true,
      requiredFields: [],
      setFields: {},
      triggeredAutomations: [],
      blockingRules: [],
    });
    expect(findApplicableRules).toHaveBeenCalledWith({
      userId: context.userId,
      userRole: context.userRole,
      teamId: context.teamId,
      projectId: context.projectId,
      columnId: context.columnId,
    });
  });

  it('ignora regras inativas', async () => {
    const { sut } = makeSut([
      makeRule({ id: 'inactive', active: false, action: 'DENY_MOVE' }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.allowed).toBe(true);
  });

  it('aplica DENY_MOVE bloqueando o movimento com prioridade', async () => {
    const { sut } = makeSut([
      makeRule({ id: 'blocker', priority: 10, action: 'DENY_MOVE' }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.allowed).toBe(false);
    expect(result.blockingRules).toEqual(['blocker']);
  });

  it('DENY_MOVE bloqueia mesmo com ALLOW_MOVE de menor prioridade', async () => {
    const { sut } = makeSut([
      makeRule({ id: 'deny', priority: 20, action: 'DENY_MOVE' }),
      makeRule({ id: 'allow', priority: 5, action: 'ALLOW_MOVE' }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.allowed).toBe(false);
    expect(result.blockingRules).toEqual(['deny']);
  });

  it('ALLOW_MOVE mantém liberado quando não há DENY_MOVE', async () => {
    const { sut } = makeSut([
      makeRule({ id: 'allow', priority: 20, action: 'ALLOW_MOVE' }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.allowed).toBe(true);
  });

  it('REQUIRE_FIELD acumula campos obrigatórios sem duplicar', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'req-a',
        priority: 1,
        action: 'REQUIRE_FIELD',
        parameters: { fields: ['observacao', 'prazo'] },
      }),
      makeRule({
        id: 'req-b',
        priority: 2,
        action: 'REQUIRE_FIELD',
        parameters: { fields: ['observacao'] },
      }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.requiredFields).toEqual(['observacao', 'prazo']);
  });

  it('SET_FIELD mescla campos definidos pelas regras', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'setter',
        priority: 3,
        action: 'SET_FIELD',
        parameters: { fields: { columnId: 'c-9', prioridade: 'ALTA' } },
      }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.setFields).toEqual({
      columnId: 'c-9',
      prioridade: 'ALTA',
    });
  });

  it('TRIGGER_AUTOMATION registra automações a disparar', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'auto',
        priority: 1,
        action: 'TRIGGER_AUTOMATION',
        parameters: { automationId: 'automation-1' },
      }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.triggeredAutomations).toEqual(['automation-1']);
  });

  it('não dispara automação se o parâmetro automationId ausente', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'auto',
        priority: 1,
        action: 'TRIGGER_AUTOMATION',
        parameters: {},
      }),
    ]);

    const result = await sut.evaluate(makeContext());
    expect(result.triggeredAutomations).toEqual([]);
  });

  it('avalia condições por usuário, time, cargo, projeto e colunas', async () => {
    const context = makeContext({
      userId: 'u-1',
      teamId: 'team-1',
      userRole: 'USER',
      projectId: 'p-1',
      columnId: 'c-1',
      fromColumnId: 'c-0',
      toColumnId: 'c-1',
    });
    const matching = makeRule({
      id: 'match',
      priority: 5,
      action: 'DENY_MOVE',
      conditions: {
        userId: 'u-1',
        teamId: 'team-1',
        role: 'USER',
        projectId: 'p-1',
        columnId: 'c-1',
        fromColumnId: 'c-0',
        toColumnId: 'c-1',
      },
    });
    const { sut } = makeSut([matching]);

    const result = await sut.evaluate(context);
    expect(result.allowed).toBe(false);
    expect(result.blockingRules).toEqual(['match']);
  });

  it('não aplica regra quando condição de usuário não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-user',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { userId: 'u-999' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ userId: 'u-1' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de team não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-team',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { teamId: 'team-999' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ teamId: 'team-1' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de cargo não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-role',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { role: 'ADMIN' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ userRole: 'USER' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de projeto não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-project',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { projectId: 'p-999' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ projectId: 'p-1' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de coluna origem não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-from',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { fromColumnId: 'c-other' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ fromColumnId: 'c-0' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de coluna destino não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'other-to',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { toColumnId: 'c-other' },
      }),
    ]);

    const result = await sut.evaluate(makeContext({ toColumnId: 'c-1' }));
    expect(result.allowed).toBe(true);
  });

  it('não aplica regra quando condição de taskData não casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'taskdata-mismatch',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { taskData: { prioridade: 'ALTA' } },
      }),
    ]);

    const result = await sut.evaluate(
      makeContext({ taskData: { prioridade: 'BAIXA' } }),
    );
    expect(result.allowed).toBe(true);
  });

  it('aplica regra quando condição de taskData casa', async () => {
    const { sut } = makeSut([
      makeRule({
        id: 'taskdata-match',
        priority: 5,
        action: 'DENY_MOVE',
        conditions: { taskData: { prioridade: 'BAIXA' } },
      }),
    ]);

    const result = await sut.evaluate(
      makeContext({ taskData: { prioridade: 'BAIXA' } }),
    );
    expect(result.allowed).toBe(false);
  });
});
