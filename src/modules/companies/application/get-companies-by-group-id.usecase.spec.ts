import { NotFoundException } from '@nestjs/common';
import { GetCompaniesByGroupIdUseCase } from './get-companies-by-group-id.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup, Company } from '../domain/company';

describe('GetCompaniesByGroupIdUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const SAMPLE_COMPANY: Company = {
    id: 'e-1',
    name: 'Empresa 1',
    cnpj: null,
    city: 'Rifaina',
    status: 'ATIVA',
    grupoId: 'g-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna empresas pertencentes ao grupo', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const findCompaniesByGroupId = jest
      .fn()
      .mockResolvedValue([SAMPLE_COMPANY]);
    const groups = {
      findById,
      findCompaniesByGroupId,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new GetCompaniesByGroupIdUseCase(groups);

    const result = await sut.execute('g-1');

    expect(findById).toHaveBeenCalledWith('g-1');
    expect(findCompaniesByGroupId).toHaveBeenCalledWith('g-1');
    expect(result).toEqual([SAMPLE_COMPANY]);
  });

  it('lança 404 quando grupo não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const findCompaniesByGroupId = jest.fn();
    const groups = {
      findById,
      findCompaniesByGroupId,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new GetCompaniesByGroupIdUseCase(groups);

    await expect(sut.execute('g-ghost')).rejects.toThrow(NotFoundException);
    expect(findCompaniesByGroupId).not.toHaveBeenCalled();
  });
});
