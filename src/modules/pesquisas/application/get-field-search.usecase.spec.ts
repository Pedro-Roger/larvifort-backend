import { NotFoundException } from '@nestjs/common';
import { GetFieldSearchByIdUseCase } from './get-field-search.usecase';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import type { FieldSearch } from '../domain/field-search';

describe('GetFieldSearchByIdUseCase', () => {
  const mockSearch: FieldSearch = {
    id: 'search-1',
    clienteId: 'cli-1',
    cliente: {
      id: 'cli-1',
      firstName: 'João',
      lastName: 'Silva',
    },
    dataPesquisa: new Date('2026-09-08'),
    responsavelId: 'user-1',
    responsavel: {
      id: 'user-1',
      firstName: 'Fernando',
      lastName: 'Almeida',
      email: 'fernando@lavifort.com.br',
    },
    larvas: ['Larvifort'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [],
    outroMotivo: null,
    uniformidadeBercario: 'OTIMA',
    uniformidadeCultivo: 'OTIMA',
    sobrevBercario: 90,
    sobrevCultivo: 92,
    resultadosUltimoCiclo: null,
    observacoes: null,
    createdAt: new Date('2026-09-08'),
    updatedAt: new Date('2026-09-08'),
  };

  it('deve retornar a pesquisa quando encontrada', async () => {
    const findById = jest.fn().mockResolvedValue(mockSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new GetFieldSearchByIdUseCase(repo);

    const result = await sut.execute('search-1');
    expect(result).toEqual(mockSearch);
    expect(findById).toHaveBeenCalledWith('search-1');
  });

  it('deve lançar NotFoundException quando a pesquisa não existir', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new GetFieldSearchByIdUseCase(repo);

    await expect(sut.execute('search-inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
