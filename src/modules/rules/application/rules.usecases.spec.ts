import { NotFoundException } from '@nestjs/common';
import { CreateRuleUseCase } from './create-rule.usecase';
import { ListRulesUseCase } from './list-rules.usecase';
import { GetRuleByIdUseCase } from './get-rule.usecase';
import { UpdateRuleUseCase } from './update-rule.usecase';
import { DeleteRuleUseCase } from './delete-rule.usecase';
import type {
  RuleRepositoryPort,
  CreateRuleData,
  UpdateRuleData,
} from './ports/rule-repository.port';
import type { Rule } from '../domain/rule';

describe('Rules Use Cases', () => {
  const baseDate = new Date('2026-09-10T10:00:00Z');

  const mockRule: Rule = {
    id: 'rule-1',
    name: 'Impedir movimento para Concluído',
    description: 'Bloqueia tarefa sem campos obrigatórios',
    scope: 'COLUMN',
    scopeId: 'c-1',
    projectId: 'p-1',
    columnId: 'c-1',
    action: 'DENY_MOVE',
    conditions: {},
    parameters: {},
    priority: 10,
    active: true,
    createdAt: baseDate,
    updatedAt: baseDate,
  };

  const createInput: CreateRuleData = {
    name: 'Regra de teste',
    scope: 'USER',
    action: 'REQUIRE_FIELD',
    conditions: { role: 'ADMIN' },
    parameters: { fields: ['observacao'] },
    priority: 5,
  };

  const updateInput: UpdateRuleData = {
    name: 'Regra renomeada',
    active: false,
    priority: 2,
  };

  describe('CreateRuleUseCase', () => {
    it('deve criar uma regra via repositório', async () => {
      const create = jest.fn().mockResolvedValue(mockRule);
      const repo = { create } as unknown as RuleRepositoryPort;
      const sut = new CreateRuleUseCase(repo);

      const result = await sut.execute(createInput);
      expect(result).toEqual(mockRule);
      expect(create).toHaveBeenCalledWith(createInput);
    });
  });

  describe('ListRulesUseCase', () => {
    it('deve listar regras com paginação', async () => {
      const findMany = jest
        .fn()
        .mockResolvedValue({ data: [mockRule], total: 1 });
      const repo = { findMany } as unknown as RuleRepositoryPort;
      const sut = new ListRulesUseCase(repo);

      const result = await sut.execute({ page: 1, limit: 20 });
      expect(result).toEqual({
        data: [mockRule],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
      expect(findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('deve normalizar página/limite para valores mínimos e máximos', async () => {
      const findMany = jest.fn().mockResolvedValue({ data: [], total: 0 });
      const repo = { findMany } as unknown as RuleRepositoryPort;
      const sut = new ListRulesUseCase(repo);

      await sut.execute({ page: 0, limit: 500 });
      expect(findMany).toHaveBeenCalledWith({
        page: 1,
        limit: 100,
      });
    });

    it('deve repassar filtros de escopo/projeto/coluna', async () => {
      const findMany = jest
        .fn()
        .mockResolvedValue({ data: [mockRule], total: 1 });
      const repo = { findMany } as unknown as RuleRepositoryPort;
      const sut = new ListRulesUseCase(repo);

      await sut.execute({
        page: 2,
        limit: 10,
        scope: 'COLUMN',
        columnId: 'c-1',
      });
      expect(findMany).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        scope: 'COLUMN',
        columnId: 'c-1',
      });
    });
  });

  describe('GetRuleByIdUseCase', () => {
    it('deve buscar regra por id', async () => {
      const findById = jest.fn().mockResolvedValue(mockRule);
      const repo = { findById } as unknown as RuleRepositoryPort;
      const sut = new GetRuleByIdUseCase(repo);

      const result = await sut.execute('rule-1');
      expect(result).toEqual(mockRule);
      expect(findById).toHaveBeenCalledWith('rule-1');
    });

    it('deve lançar NotFoundException quando a regra não existe', async () => {
      const findById = jest.fn().mockResolvedValue(null);
      const repo = { findById } as unknown as RuleRepositoryPort;
      const sut = new GetRuleByIdUseCase(repo);

      await expect(sut.execute('rule-ghost')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('UpdateRuleUseCase', () => {
    it('deve atualizar uma regra existente', async () => {
      const update = jest
        .fn()
        .mockResolvedValue({ ...mockRule, ...updateInput });
      const repo = { update } as unknown as RuleRepositoryPort;
      const sut = new UpdateRuleUseCase(repo);

      const result = await sut.execute('rule-1', updateInput);
      expect(result.name).toBe('Regra renomeada');
      expect(result.active).toBe(false);
      expect(update).toHaveBeenCalledWith('rule-1', updateInput);
    });
  });

  describe('DeleteRuleUseCase', () => {
    it('deve deletar uma regra existente', async () => {
      const findById = jest.fn().mockResolvedValue(mockRule);
      const del = jest.fn().mockResolvedValue(undefined);
      const repo = { findById, delete: del } as unknown as RuleRepositoryPort;
      const sut = new DeleteRuleUseCase(repo);

      await sut.execute('rule-1');
      expect(findById).toHaveBeenCalledWith('rule-1');
      expect(del).toHaveBeenCalledWith('rule-1');
    });

    it('deve lançar NotFoundException quando a regra não existe', async () => {
      const findById = jest.fn().mockResolvedValue(null);
      const del = jest.fn();
      const repo = { findById, delete: del } as unknown as RuleRepositoryPort;
      const sut = new DeleteRuleUseCase(repo);

      await expect(sut.execute('rule-ghost')).rejects.toThrow(
        NotFoundException,
      );
      expect(del).not.toHaveBeenCalled();
    });
  });
});
