import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TaskRepositoryPort } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.tasks.findById(id);
    if (!existing) {
      throw new NotFoundException('Tarefa não encontrada.');
    }
    await this.tasks.delete(id);
  }
}
