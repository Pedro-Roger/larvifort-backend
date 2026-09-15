import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

@Injectable()
export class ListSubtasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(parentId: string): Promise<Task[]> {
    const parent = await this.tasks.findById(parentId);
    if (!parent)
      throw new NotFoundException('Tarefa principal não encontrada.');
    const result = await this.tasks.findMany({
      projetoId: parent.projetoId,
      parentId,
      page: 1,
      limit: 100,
    });
    return result.data;
  }
}
