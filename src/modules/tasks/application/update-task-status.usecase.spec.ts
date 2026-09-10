import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateTaskStatusUseCase } from './update-task-status.usecase';
import type {
  TaskRepositoryPort,
  UpdateTaskData,
} from './ports/task-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import type { RulesEnginePort } from '../../rules/application/ports/rules-engine.port';
import type { RuleEvaluationResult } from '../../rules/domain/rule';
import type { Task, ProjectColumn } from '../domain/task';

describe('UpdateTaskStatusUseCase', () => {
  const SAMPLE_TASK: Task = {
    id: 't-1',
    projetoId: 'p-1',
    columnId: 'c-1',
    titulo: 'Desenvolver API',
    descricao: null,
    status: 'EM_ANDAMENTO',
    prioridade: 'MEDIA',
    progresso: 50,
    tags: [],
    prazo: null,
    estimativaH: null,
    assigneeId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_COLUMN: ProjectColumn = {
    id: 'c-2',
    projetoId: 'p-1',
    title: 'Concluído',
    order: 3,
    color: '#10b981',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const MOCK_USER = {
    id: 'u-1',
    role: 'USER' as const,
    teamId: 'team-1',
  };

  const MOCK_RULE_RESULT_ALLOW: RuleEvaluationResult = {
    allowed: true,
    requiredFields: [],
    setFields: {},
    triggeredAutomations: [],
    blockingRules: [],
  };

  const MOCK_RULE_RESULT_DENY: RuleEvaluationResult = {
    allowed: false,
    requiredFields: [],
    setFields: {},
    triggeredAutomations: [],
    blockingRules: ['rule-1'],
  };

  function makeSut(ruleResult = MOCK_RULE_RESULT_ALLOW) {
    const findById = jest.fn().mockResolvedValue(SAMPLE_TASK);
    const update = jest
      .fn()
      .mockImplementation((_id: string, data: UpdateTaskData) =>
        Promise.resolve({ ...SAMPLE_TASK, ...data }),
      );
    const findColumnById = jest.fn().mockResolvedValue(SAMPLE_COLUMN);
    const evaluate = jest.fn().mockResolvedValue(ruleResult);

    const tasks = { findById, update } as unknown as TaskRepositoryPort;
    const columns = {
      findById: findColumnById,
    } as unknown as ProjectColumnRepositoryPort;
    const rulesEngine = { evaluate } as unknown as RulesEnginePort;

    return {
      sut: new UpdateTaskStatusUseCase(tasks, columns, rulesEngine),
      findById,
      update,
      findColumnById,
      evaluate,
    };
  }

  describe('UpdateTaskStatusUseCase', () => {
    it('altera status para CONCLUIDO e ajusta progresso para 100', async () => {
      const { sut, findById, update, evaluate } = makeSut();

      const result = await sut.execute(
        't-1',
        { status: 'CONCLUIDO' },
        MOCK_USER,
      );

      expect(findById).toHaveBeenCalledWith('t-1');
      expect(update).toHaveBeenCalledWith('t-1', {
        status: 'CONCLUIDO',
        columnId: 'c-1',
        progresso: 100,
      });
      expect(evaluate).toHaveBeenCalled();
      expect(result.status).toBe('CONCLUIDO');
    });

    it('move tarefa para nova coluna válida', async () => {
      const { sut, findById, update, findColumnById, evaluate } = makeSut();

      const result = await sut.execute('t-1', { columnId: 'c-2' }, MOCK_USER);

      expect(findById).toHaveBeenCalledWith('t-1');
      expect(findColumnById).toHaveBeenCalledWith('c-2');
      expect(update).toHaveBeenCalledWith('t-1', {
        status: 'EM_ANDAMENTO',
        columnId: 'c-2',
        progresso: 50,
      });
      expect(evaluate).toHaveBeenCalled();
      expect(result.columnId).toBe('c-2');
    });

    it('lança 404 quando coluna informada pertence a outro projeto', async () => {
      const findById = jest.fn().mockResolvedValue(SAMPLE_TASK);
      const findColumnById = jest.fn().mockResolvedValue({
        ...SAMPLE_COLUMN,
        projetoId: 'p-other',
      });
      const tasks = { findById } as unknown as TaskRepositoryPort;
      const columns = {
        findById: findColumnById,
      } as unknown as ProjectColumnRepositoryPort;
      const rulesEngine = {
        evaluate: jest.fn().mockResolvedValue(MOCK_RULE_RESULT_ALLOW),
      } as unknown as RulesEnginePort;
      const sut = new UpdateTaskStatusUseCase(tasks, columns, rulesEngine);

      await expect(
        sut.execute('t-1', { columnId: 'c-other' }, MOCK_USER),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança 404 quando tarefa não existe', async () => {
      const findById = jest.fn().mockResolvedValue(null);
      const tasks = { findById } as unknown as TaskRepositoryPort;
      const columns = {
        findById: jest.fn(),
      } as unknown as ProjectColumnRepositoryPort;
      const rulesEngine = {
        evaluate: jest.fn().mockResolvedValue(MOCK_RULE_RESULT_ALLOW),
      } as unknown as RulesEnginePort;
      const sut = new UpdateTaskStatusUseCase(tasks, columns, rulesEngine);

      await expect(
        sut.execute('t-ghost', { status: 'CONCLUIDO' }, MOCK_USER),
      ).rejects.toThrow(NotFoundException);
    });

    it('lança 403 quando regra DENY_MOVE bloqueia o movimento', async () => {
      const { sut } = makeSut(MOCK_RULE_RESULT_DENY);

      await expect(
        sut.execute('t-1', { columnId: 'c-2' }, MOCK_USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
