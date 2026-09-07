import { NotFoundException } from '@nestjs/common';
import { DeleteCompanyUseCase } from './delete-company.usecase';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import type { Company } from '../domain/company';

describe('DeleteCompanyUseCase', () => {
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

  it('deleta empresa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const del = jest.fn().mockResolvedValue(undefined);
    const companies = {
      findById,
      delete: del,
    } as unknown as CompanyRepositoryPort;
    const sut = new DeleteCompanyUseCase(companies);

    await sut.execute('e-1');

    expect(findById).toHaveBeenCalledWith('e-1');
    expect(del).toHaveBeenCalledWith('e-1');
  });

  it('lança 404 quando empresa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const companies = {
      findById,
      delete: del,
    } as unknown as CompanyRepositoryPort;
    const sut = new DeleteCompanyUseCase(companies);

    await expect(sut.execute('e-ghost')).rejects.toThrow(NotFoundException);
    expect(del).not.toHaveBeenCalled();
  });
});
