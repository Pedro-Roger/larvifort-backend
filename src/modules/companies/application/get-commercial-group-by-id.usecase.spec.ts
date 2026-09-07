import { NotFoundException } from '@nestjs/common';
import { GetCommercialGroupByIdUseCase } from './get-commercial-group-by-id.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup } from '../domain/company';

describe('GetCommercialGroupByIdUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna grupo quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const groups = { findById } as unknown as CommercialGroupRepositoryPort;
    const sut = new GetCommercialGroupByIdUseCase(groups);

    const result = await sut.execute('g-1');

    expect(findById).toHaveBeenCalledWith('g-1');
    expect(result).toEqual(SAMPLE_GROUP);
  });

  it('lança 404 quando grupo não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const groups = { findById } as unknown as CommercialGroupRepositoryPort;
    const sut = new GetCommercialGroupByIdUseCase(groups);

    await expect(sut.execute('g-ghost')).rejects.toThrow(NotFoundException);
  });
});
