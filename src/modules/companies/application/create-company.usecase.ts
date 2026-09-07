import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Company } from '../domain/company';
import type {
  CompanyRepositoryPort,
  CreateCompanyData,
} from './ports/company-repository.port';
import { COMPANY_REPOSITORY_PORT } from './ports/company-repository.port';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companies: CompanyRepositoryPort,
  ) {}

  async execute(input: CreateCompanyData): Promise<Company> {
    if (input.cnpj?.trim()) {
      const existing = await this.companies.findByCnpj(input.cnpj.trim());
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado.');
      }
    }

    return this.companies.create(input);
  }
}
