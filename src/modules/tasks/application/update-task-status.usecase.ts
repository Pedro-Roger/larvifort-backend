import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { StatusTarefa, Task } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

export interface UpdateTaskStatusInput {
  status: StatusTarefa;
  progresso?: number;
}

@Injectable()
export class UpdateTaskStatusUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateTaskStatusInput): Promise<Task> {
    const existing = await this.tasks.findById(id);
    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }

    let status = input.status;
    let progresso: number;

    if (status === 'CONCLUIDO') {
      progresso = 100;
    } else if (input.progresso === 100) {
      status = 'CONCLUIDO';
      progresso = 100;
    } else if (input.progresso !== undefined) {
      progresso = input.progresso;
    } else if (existing.progresso === 100) {
      progresso = 0;
    } else {
      progresso = existing.progresso;
    }

    return this.tasks.update(id, { status, progresso });
  }
}
