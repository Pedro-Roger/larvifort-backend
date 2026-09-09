import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { FieldSearch } from '../domain/field-search';
import type {
  FieldSearchRepositoryPort,
  FindPesquisasFilter,
} from './ports/field-repository.port';
import { FIELD_SEARCH_REPOSITORY_PORT } from './ports/field-repository.port';

@Injectable()
export class ListPesquisasUseCase {
  constructor(
    @Inject(FIELD_SEARCH_REPOSITORY_PORT)
    private readonly pesquisas: FieldSearchRepositoryPort,
  ) {}

  async execute(filter: FindPesquisasFilter): Promise<Paginated<FieldSearch>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.pesquisas.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
