import { Inject, Injectable } from '@nestjs/common';
import { paginated } from '../../../core/common/pagination';
import type { Paginated } from '../../../core/common/pagination';
import type { Company } from '../domain/company';
import type {
  CompanyRepositoryPort,
  FindCompaniesFilter,
} from './ports/company-repository.port';
import { COMPANY_REPOSITORY_PORT } from './ports/company-repository.port';

@Injectable()
export class ListCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companies: CompanyRepositoryPort,
  ) {}

  async execute(filter: FindCompaniesFilter): Promise<Paginated<Company>> {
    const page = Math.max(1, filter.page || 1);
    const limit = Math.max(1, Math.min(100, filter.limit || 20));

    const { data, total } = await this.companies.findMany({
      ...filter,
      page,
      limit,
    });

    return paginated(data, total, page, limit);
  }
}
