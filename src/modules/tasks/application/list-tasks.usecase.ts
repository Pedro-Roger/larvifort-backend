import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { Task } from '../domain/task';
import type {
  FindTasksFilter,
  TaskRepositoryPort,
} from './ports/task-repository.port';
import { TASK_REPOSITORY_PORT } from './ports/task-repository.port';

@Injectable()
export class ListTasksUseCase {
  constructor(
    @Inject(TASK_REPOSITORY_PORT)
    private readonly tasks: TaskRepositoryPort,
  ) {}

  async execute(filter: FindTasksFilter): Promise<Paginated<Task>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.tasks.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
