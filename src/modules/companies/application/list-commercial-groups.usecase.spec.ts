import { ListCommercialGroupsUseCase } from './list-commercial-groups.usecase';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import type { CommercialGroup } from '../domain/company';

describe('ListCommercialGroupsUseCase', () => {
  const SAMPLE_GROUP: CommercialGroup = {
    id: 'g-1',
    name: 'Coopercitrus',
    color: '#16a34a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retorna lista de grupos comerciais', async () => {
    const findAll = jest.fn().mockResolvedValue([SAMPLE_GROUP]);
    const groups = { findAll } as unknown as CommercialGroupRepositoryPort;
    const sut = new ListCommercialGroupsUseCase(groups);

    const result = await sut.execute();

    expect(findAll).toHaveBeenCalled();
    expect(result).toEqual([SAMPLE_GROUP]);
  });
});
