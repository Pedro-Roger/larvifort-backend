import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Company } from '../domain/company';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import { COMPANY_REPOSITORY_PORT } from './ports/company-repository.port';

@Injectable()
export class GetCompanyByIdUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companies: CompanyRepositoryPort,
  ) {}

  async execute(id: string): Promise<Company> {
    const company = await this.companies.findById(id);
    if (!company) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    return company;
  }
}
