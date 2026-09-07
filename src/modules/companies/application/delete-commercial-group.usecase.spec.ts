import { NotFoundException } from '@nestjs/common';
import { DeleteCommercialGroupUseCase } from './delete-commercial-group.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup } from '../domain/company';

describe('DeleteCommercialGroupUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('deleta grupo com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const del = jest.fn().mockResolvedValue(undefined);
    const groups = {
      findById,
      delete: del,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new DeleteCommercialGroupUseCase(groups);

    await sut.execute('g-1');

    expect(findById).toHaveBeenCalledWith('g-1');
    expect(del).toHaveBeenCalledWith('g-1');
  });

  it('lança 404 quando grupo não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const groups = {
      findById,
      delete: del,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new DeleteCommercialGroupUseCase(groups);

    await expect(sut.execute('g-ghost')).rejects.toThrow(NotFoundException);
    expect(del).not.toHaveBeenCalled();
  });
});
