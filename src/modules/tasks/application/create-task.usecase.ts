import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type {
  CreateTaskData,
  TaskRepositoryPort,
} from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';
import type { ProjectRepositoryPort } from './ports/project-repository.port';
import { PROJECT_REPOSITORY_PORT } from './ports/project-repository.port';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
    @Inject(PROJECT_REPOSITORY_PORT)
    private readonly projects: ProjectRepositoryPort,
  ) {}

  async execute(input: CreateTaskData): Promise<Task> {
    const project = await this.projects.findById(input.projetoId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado.');
    }

    let status = input.status ?? 'BACKLOG';
    let progresso = input.progresso ?? 0;

    if (progresso === 100) {
      status = 'CONCLUIDO';
    } else if (status === 'CONCLUIDO') {
      progresso = 100;
    }

    return this.tasks.create({
      ...input,
      status,
      progresso,
    });
  }
}
