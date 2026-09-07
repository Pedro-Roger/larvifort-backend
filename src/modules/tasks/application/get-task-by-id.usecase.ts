import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

@Injectable()
export class GetTaskByIdUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.tasks.findById(id);
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada.');
    }
    return task;
  }
}
