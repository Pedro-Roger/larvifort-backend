import { RulesController } from './rules.controller';
import type { CreateRuleUseCase } from '../application/create-rule.usecase';
import type { ListRulesUseCase } from '../application/list-rules.usecase';
import type { GetRuleByIdUseCase } from '../application/get-rule.usecase';
import type { UpdateRuleUseCase } from '../application/update-rule.usecase';
import type { DeleteRuleUseCase } from '../application/delete-rule.usecase';
import type { Rule, RuleScope, RuleAction } from '../domain/rule';
import type { Paginated } from '../../../core/common/pagination';

describe('RulesController', () => {
  const SAMPLE_RULE: Rule = {
    id: 'rule-1',
    name: 'Impedir movimento para Concluído',
    description: null,
    scope: 'COLUMN',
    scopeId: null,
    projectId: 'p-1',
    columnId: 'c-1',
    action: 'DENY_MOVE',
    conditions: { columnId: 'c-1' },
    parameters: {},
    priority: 10,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();

    const listRules = { execute: listExecute } as unknown as ListRulesUseCase;
    const getRuleById = {
      execute: getExecute,
    } as unknown as GetRuleByIdUseCase;
    const createRule = {
      execute: createExecute,
    } as unknown as CreateRuleUseCase;
    const updateRule = {
      execute: updateExecute,
    } as unknown as UpdateRuleUseCase;
    const deleteRule = {
      execute: deleteExecute,
    } as unknown as DeleteRuleUseCase;

    const sut = new RulesController(
      listRules,
      createRule,
      getRuleById,
      updateRule,
      deleteRule,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
    };
  }

  it('findMany delega para ListRulesUseCase', async () => {
    const { sut, listExecute } = makeSut();
    const paginatedResult: Paginated<Rule> = {
      data: [SAMPLE_RULE],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    };
    listExecute.mockResolvedValue(paginatedResult);

    const result = await sut.findMany({
      scope: 'COLUMN',
      columnId: 'c-1',
      page: 1,
      limit: 20,
    });

    expect(listExecute).toHaveBeenCalledWith({
      scope: 'COLUMN',
      columnId: 'c-1',
      page: 1,
      limit: 20,
    });
    expect(result).toEqual(paginatedResult);
  });

  it('findById delega para GetRuleByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_RULE);

    const result = await sut.findById('rule-1');

    expect(getExecute).toHaveBeenCalledWith('rule-1');
    expect(result).toEqual(SAMPLE_RULE);
  });

  it('create delega para CreateRuleUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_RULE);

    const dto = {
      name: 'Impedir movimento para Concluído',
      scope: 'COLUMN' as RuleScope,
      action: 'DENY_MOVE' as RuleAction,
      conditions: { columnId: 'c-1' },
      parameters: {},
    };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_RULE);
  });

  it('update delega para UpdateRuleUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_RULE, name: 'Atualizada' });

    const result = await sut.update('rule-1', { name: 'Atualizada' });

    expect(updateExecute).toHaveBeenCalledWith('rule-1', {
      name: 'Atualizada',
    });
    expect(result.name).toBe('Atualizada');
  });

  it('delete delega para DeleteRuleUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('rule-1');

    expect(deleteExecute).toHaveBeenCalledWith('rule-1');
  });
});
