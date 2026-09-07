import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateCompanyUseCase } from './update-company.usecase';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import type { Company } from '../domain/company';

describe('UpdateCompanyUseCase', () => {
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

  it('atualiza dados da empresa com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const findByCnpj = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_COMPANY,
      name: 'Novo Nome',
    });
    const companies = {
      findById,
      findByCnpj,
      update,
    } as unknown as CompanyRepositoryPort;
    const sut = new UpdateCompanyUseCase(companies);

    const result = await sut.execute('e-1', { name: 'Novo Nome' });

    expect(findById).toHaveBeenCalledWith('e-1');
    expect(update).toHaveBeenCalledWith('e-1', { name: 'Novo Nome' });
    expect(result.name).toBe('Novo Nome');
  });

  it('lança 404 quando empresa não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const companies = { findById } as unknown as CompanyRepositoryPort;
    const sut = new UpdateCompanyUseCase(companies);

    await expect(sut.execute('e-ghost', { name: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 409 quando o novo CNPJ já pertence a outra empresa', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const findByCnpj = jest.fn().mockResolvedValue({
      ...SAMPLE_COMPANY,
      id: 'e-2',
      cnpj: '99999999000199',
    });
    const update = jest.fn();
    const companies = {
      findById,
      findByCnpj,
      update,
    } as unknown as CompanyRepositoryPort;
    const sut = new UpdateCompanyUseCase(companies);

    await expect(
      sut.execute('e-1', { cnpj: '99999999000199' }),
    ).rejects.toThrow(ConflictException);

    expect(update).not.toHaveBeenCalled();
  });
});
