import { NotFoundException } from '@nestjs/common';
import { GetCompanyByIdUseCase } from './get-company-by-id.usecase';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import type { Company } from '../domain/company';

describe('GetCompanyByIdUseCase', () => {
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

  it('retorna empresa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const companies = { findById } as unknown as CompanyRepositoryPort;
    const sut = new GetCompanyByIdUseCase(companies);

    const result = await sut.execute('e-1');

    expect(findById).toHaveBeenCalledWith('e-1');
    expect(result).toEqual(SAMPLE_COMPANY);
  });

  it('lança 404 quando empresa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const companies = { findById } as unknown as CompanyRepositoryPort;
    const sut = new GetCompanyByIdUseCase(companies);

    await expect(sut.execute('e-ghost')).rejects.toThrow(NotFoundException);
  });
});
