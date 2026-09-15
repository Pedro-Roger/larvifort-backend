import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Task } from '../domain/task';
import type { TaskRepositoryPort, UpdateTaskData } from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

@Injectable()
export class UpdateSubtaskUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateTaskData): Promise<Task> {
    const existing = await this.tasks.findById(id);
    if (!existing?.parentId) throw new NotFoundException('Subtarefa não encontrada.');
    const updated = await this.tasks.update(id, input);
    await this.tasks.syncParentProgress(existing.parentId);
    return updated;
  }
}
