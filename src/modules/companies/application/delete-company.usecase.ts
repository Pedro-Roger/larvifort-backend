import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import { COMPANY_REPOSITORY_PORT } from './ports/company-repository.port';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companies: CompanyRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.companies.findById(id);
    if (!existing) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    await this.companies.delete(id);
  }
}
