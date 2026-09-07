import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Company } from '../domain/company';
import type {
  CompanyRepositoryPort,
  UpdateCompanyData,
} from './ports/company-repository.port';
import { COMPANY_REPOSITORY_PORT } from './ports/company-repository.port';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY_PORT)
    private readonly companies: CompanyRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateCompanyData): Promise<Company> {
    const existing = await this.companies.findById(id);
    if (!existing) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    if (input.cnpj !== undefined && input.cnpj !== null) {
      const cnpj = input.cnpj.trim();
      if (cnpj && cnpj !== existing.cnpj) {
        const companyWithCnpj = await this.companies.findByCnpj(cnpj);
        if (companyWithCnpj && companyWithCnpj.id !== id) {
          throw new ConflictException('CNPJ já cadastrado.');
        }
      }
    }

    return this.companies.update(id, input);
  }
}
