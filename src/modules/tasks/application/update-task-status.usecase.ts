import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { StatusTarefa, Task } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';
import type { RulesEnginePort } from '../../rules/application/ports/rules-engine.port';
import type { RuleEvaluationContext } from '../../rules/domain/rule';
import { RULES_ENGINE_PORT } from '../../rules/application/ports/rules-engine.port';

export interface UpdateTaskStatusInput {
  status?: StatusTarefa;
  columnId?: string;
  progresso?: number;
}

export interface CurrentUserContext {
  id: string;
  role: 'ADMIN' | 'USER';
  teamId: string | null;
}

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
    @Inject(RULES_ENGINE_PORT)
    private readonly rulesEngine: RulesEnginePort,
  ) {}

  async execute(
    id: string,
    input: UpdateTaskStatusInput,
    currentUser: CurrentUserContext,
  ): Promise<Task> {
    const existing = await this.tasks.findById(id);
    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    let columnId = input.columnId ?? existing.columnId;
    let status = input.status ?? existing.status;

    if (input.columnId) {
      const column = await this.columns.findById(input.columnId);
      if (!column || column.projetoId !== existing.projetoId) {
        throw new NotFoundException('Coluna não encontrada no projeto.');
      }
      columnId = column.id;
    }

    let progresso: number;

    if (status === 'CONCLUIDO') {
      progresso = 100;
    } else if (input.progresso === 100) {
      status = 'CONCLUIDO';
      progresso = 100;
    } else if (input.progresso !== undefined) {
      progresso = input.progresso;
    } else if (existing.progresso === 100 && existing.status !== 'CONCLUIDO') {
      progresso = 0;
    } else {
      progresso = existing.progresso;
    }

    // Evaluar regras personalizadas
    const ruleContext: RuleEvaluationContext = {
      userId: currentUser.id,
      userRole: currentUser.role,
      teamId: currentUser.teamId,
      projectId: existing.projetoId,
      columnId: columnId ?? null,
      taskId: existing.id,
      fromColumnId: existing.columnId ?? null,
      toColumnId: columnId ?? null,
      taskData: {
        status: existing.status,
        progresso: existing.progresso,
        prioridade: existing.prioridade,
        assigneeId: existing.assigneeId,
        tags: existing.tags,
      },
    };

    const ruleResult = await this.rulesEngine.evaluate(ruleContext);

    if (!ruleResult.allowed) {
      throw new ForbiddenException({
        message: 'Movimento não permitido por regras personalizadas.',
        blockingRules: ruleResult.blockingRules,
      });
    }

    // Aplicar campos definidos pelas regras
    const finalColumnId =
      (ruleResult.setFields.columnId as string | null | undefined) ?? columnId;
    const finalStatus =
      (ruleResult.setFields.status as StatusTarefa | undefined) ?? status;
    const finalProgresso =
      (ruleResult.setFields.progresso as number | undefined) ?? progresso;

    return this.tasks.update(id, {
      status: finalStatus,
      columnId: finalColumnId,
      progresso: finalProgresso,
    });
  }
}
