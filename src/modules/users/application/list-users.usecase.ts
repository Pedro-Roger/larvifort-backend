import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { User } from '../domain/user';
import type {
  FindUsersFilter,
  UserRepositoryPort,
} from './ports/user-repository.port';
import { USER_REPOSITORY_PORT } from './ports/user-repository.port';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT)
    private readonly users: UserRepositoryPort,
  ) {}

  async execute(filter: FindUsersFilter): Promise<Paginated<User>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.users.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
