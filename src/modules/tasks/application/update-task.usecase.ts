import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type {
  TaskRepositoryPort,
  UpdateTaskData,
} from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';
import type { ProjectColumnRepositoryPort } from './ports/project-column-repository.port';
import { PROJECT_COLUMN_REPOSITORY_PORT } from './ports/project-column-repository.port';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
    @Inject(PROJECT_COLUMN_REPOSITORY_PORT)
    private readonly columns: ProjectColumnRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateTaskData): Promise<Task> {
    const existing = await this.tasks.findById(id);
    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    const targetProjectId = input.projetoId ?? existing.projetoId;
    if (input.projetoId && input.projetoId !== existing.projetoId) {
      const project = await this.projects.findById(input.projetoId);
      if (!project) {
        throw new NotFoundException('Projeto não encontrado.');
      }
    }

    if (input.columnId) {
      const column = await this.columns.findById(input.columnId);
      if (!column || column.projetoId !== targetProjectId) {
        throw new NotFoundException('Coluna não encontrada no projeto.');
      }
    }

    const data: UpdateTaskData = { ...input };

    if (input.progresso === 100) {
      data.status = 'CONCLUIDO';
    } else if (input.status === 'CONCLUIDO') {
      data.progresso = 100;
    }

    return this.tasks.update(id, data);
  }
}
