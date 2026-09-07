import { ConflictException } from '@nestjs/common';
import { CreateCommercialGroupUseCase } from './create-commercial-group.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup } from '../domain/company';

describe('CreateCommercialGroupUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('cria grupo com sucesso', async () => {
    const findByName = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const groups = {
      findByName,
      create,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new CreateCommercialGroupUseCase(groups);

    const result = await sut.execute({
      name: 'Coopercitrus',
      color: '#16a34a',
    });

    expect(findByName).toHaveBeenCalledWith('Coopercitrus');
    expect(create).toHaveBeenCalledWith({
      name: 'Coopercitrus',
      color: '#16a34a',
    });
    expect(result).toEqual(SAMPLE_GROUP);
  });

  it('lança 409 quando nome de grupo já existe', async () => {
    const findByName = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const create = jest.fn();
    const groups = {
      findByName,
      create,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new CreateCommercialGroupUseCase(groups);

    await expect(sut.execute({ name: 'Coopercitrus' })).rejects.toThrow(
      ConflictException,
    );

    expect(create).not.toHaveBeenCalled();
  });
});
