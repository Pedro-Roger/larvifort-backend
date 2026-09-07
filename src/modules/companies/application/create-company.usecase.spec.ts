import { ConflictException } from '@nestjs/common';
import { CreateCompanyUseCase } from './create-company.usecase';
import type { CompanyRepositoryPort } from './ports/company-repository.port';
import type { Company } from '../domain/company';

describe('CreateCompanyUseCase', () => {
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

  it('cria empresa quando CNPJ é válido e não duplicado', async () => {
    const findByCnpj = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const companies = {
      findByCnpj,
      create,
    } as unknown as CompanyRepositoryPort;
    const sut = new CreateCompanyUseCase(companies);

    const result = await sut.execute({
      name: 'Fazenda Rio Grande Ltda',
      cnpj: '12345678000199',
      city: 'Rifaina',
      status: 'ATIVA',
      grupoId: 'g-1',
    });

    expect(findByCnpj).toHaveBeenCalledWith('12345678000199');
    expect(create).toHaveBeenCalledWith({
      name: 'Fazenda Rio Grande Ltda',
      cnpj: '12345678000199',
      city: 'Rifaina',
      status: 'ATIVA',
      grupoId: 'g-1',
    });
    expect(result).toEqual(SAMPLE_COMPANY);
  });

  it('lança 409 quando o CNPJ já existe', async () => {
    const findByCnpj = jest.fn().mockResolvedValue(SAMPLE_COMPANY);
    const create = jest.fn();
    const companies = {
      findByCnpj,
      create,
    } as unknown as CompanyRepositoryPort;
    const sut = new CreateCompanyUseCase(companies);

    await expect(
      sut.execute({
        name: 'Fazenda Rio Grande Ltda',
        cnpj: '12345678000199',
      }),
    ).rejects.toThrow(ConflictException);

    expect(create).not.toHaveBeenCalled();
  });
});
