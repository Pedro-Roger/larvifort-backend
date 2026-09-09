import { NotFoundException } from '@nestjs/common';
import { DeleteFieldSearchUseCase } from './delete-field-search.usecase';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import type { FieldSearch } from '../domain/field-search';

describe('DeleteFieldSearchUseCase', () => {
  const mockSearch: FieldSearch = {
    id: 'search-1',
    clienteId: 'cli-1',
    dataPesquisa: new Date('2026-09-08'),
    larvas: ['Larvifort'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [],
    createdAt: new Date('2026-09-08'),
    updatedAt: new Date('2026-09-08'),
  };

  it('deve deletar a pesquisa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(mockSearch);
    const del = jest.fn().mockResolvedValue(undefined);
    const repo = {
      findById,
      delete: del,
    } as unknown as FieldSearchRepositoryPort;
    const sut = new DeleteFieldSearchUseCase(repo);

    await sut.execute('search-1');
    expect(findById).toHaveBeenCalledWith('search-1');
    expect(del).toHaveBeenCalledWith('search-1');
  });

  it('deve lançar NotFoundException quando a pesquisa não existir', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const del = jest.fn();
    const repo = {
      findById,
      delete: del,
    } as unknown as FieldSearchRepositoryPort;
    const sut = new DeleteFieldSearchUseCase(repo);

    await expect(sut.execute('search-inexistente')).rejects.toThrow(
      NotFoundException,
    );
    expect(del).not.toHaveBeenCalled();
  });
});
