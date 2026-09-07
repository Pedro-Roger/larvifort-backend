import { ListCompaniesUseCase } from './list-companies.usecase';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import type { Company } from '../domain/company';

describe('ListCompaniesUseCase', () => {
  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Fazenda Rio Grande Ltda',
    cnpj: '12345678000199',
    city: 'Rifaina',
    status: 'ATIVA',
    grupoId: 'g-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna lista paginada de empresas', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_COMPANY], total: 1 });
    const companies = { findMany } as unknown as CompanyRepositoryPort;
    const sut = new ListCompaniesUseCase(companies);

    const result = await sut.execute({
      page: 1,
      limit: 10,
      search: 'rio grande',
    });

    expect(findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'rio grande',
    });
    expect(result).toEqual({
      data: [SAMPLE_COMPANY],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });
});
