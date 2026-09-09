import { ListPesquisasUseCase } from './list-pesquisas.usecase';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import type { FieldSearch } from '../domain/field-search';

describe('ListPesquisasUseCase', () => {
  const mockSearches: FieldSearch[] = [
    {
      id: 'search-1',
      clienteId: 'cli-1',
      dataPesquisa: new Date('2026-09-08'),
      larvas: ['Larvifort'],
      maioriaLarvifort: true,
      parouLarvifort: false,
      motivosSaida: [],
      createdAt: new Date('2026-09-08'),
      updatedAt: new Date('2026-09-08'),
    },
  ];

  it('deve listar pesquisas paginadas com filtros aplicados', async () => {
    const findMany = jest.fn().mockResolvedValue({
      data: mockSearches,
      total: 1,
    });
    const repo = { findMany } as unknown as FieldSearchRepositoryPort;
    const sut = new ListPesquisasUseCase(repo);

    const result = await sut.execute({
      clienteId: 'cli-1',
      somenteLarvifort: true,
      page: 1,
      limit: 10,
    });

    expect(result.data).toEqual(mockSearches);
    expect(result.meta.total).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(findMany).toHaveBeenCalledWith({
      clienteId: 'cli-1',
      somenteLarvifort: true,
      page: 1,
      limit: 10,
    });
  });
});
