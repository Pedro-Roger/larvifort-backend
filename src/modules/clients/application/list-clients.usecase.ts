import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { Client } from '../domain/client';
import type {
  ClientRepositoryPort,
  FindClientsFilter,
} from './ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from './ports/client-repository.port';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clients: ClientRepositoryPort,
  ) {}

  async execute(filter: FindClientsFilter): Promise<Paginated<Client>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.clients.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
