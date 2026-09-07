import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateCommercialGroupUseCase } from './update-commercial-group.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup } from '../domain/company';

describe('UpdateCommercialGroupUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('atualiza grupo com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const findByName = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_GROUP,
      name: 'Novo Grupo',
    });
    const groups = {
      findById,
      findByName,
      update,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new UpdateCommercialGroupUseCase(groups);

    const result = await sut.execute('g-1', { name: 'Novo Grupo' });

    expect(findById).toHaveBeenCalledWith('g-1');
    expect(update).toHaveBeenCalledWith('g-1', { name: 'Novo Grupo' });
    expect(result.name).toBe('Novo Grupo');
  });

  it('lança 404 quando grupo não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const groups = { findById } as unknown as CommercialGroupRepositoryPort;
    const sut = new UpdateCommercialGroupUseCase(groups);

    await expect(sut.execute('g-ghost', { name: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 409 quando o novo nome já pertence a outro grupo', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_GROUP);
    const findByName = jest.fn().mockResolvedValue({
      ...SAMPLE_GROUP,
      id: 'g-2',
      name: 'NutriVale',
    });
    const update = jest.fn();
    const groups = {
      findById,
      findByName,
      update,
    } as unknown as CommercialGroupRepositoryPort;
    const sut = new UpdateCommercialGroupUseCase(groups);

    await expect(sut.execute('g-1', { name: 'NutriVale' })).rejects.toThrow(
      ConflictException,
    );

    expect(update).not.toHaveBeenCalled();
  });
});
