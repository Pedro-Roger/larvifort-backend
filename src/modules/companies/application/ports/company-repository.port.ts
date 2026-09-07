import type { Company, StatusEmpresa } from '../../domain/company';

export const COMPANY_REPOSITORY_PORT = 'COMPANY_REPOSITORY_PORT';

export interface FindCompaniesFilter {
  grupoId?: string;
  status?: StatusEmpresa;
  search?: string;
  page: number;
  limit: number;
}

export interface CreateCompanyData {
  name: string;
  cnpj?: string | null;
  city?: string | null;
  status?: StatusEmpresa;
  grupoId?: string | null;
}

export interface UpdateCompanyData {
  name?: string;
  cnpj?: string | null;
  city?: string | null;
  status?: StatusEmpresa;
  grupoId?: string | null;
}

export interface CompanyRepositoryPort {
  findMany(
    filter: FindCompaniesFilter,
  ): Promise<{ data: Company[]; total: number }>;
  findById(id: string): Promise<Company | null>;
  findByCnpj(cnpj: string): Promise<Company | null>;
  create(data: CreateCompanyData): Promise<Company>;
  update(id: string, data: UpdateCompanyData): Promise<Company>;
  delete(id: string): Promise<void>;
}
