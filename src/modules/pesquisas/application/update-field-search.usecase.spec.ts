import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateFieldSearchUseCase } from './update-field-search.usecase';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import type { FieldSearch } from '../domain/field-search';

describe('UpdateFieldSearchUseCase', () => {
  const existingSearch: FieldSearch = {
    id: 'search-1',
    clienteId: 'cli-1',
    dataPesquisa: new Date('2026-09-08'),
    responsavelId: 'user-1',
    larvas: ['Larvifort'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [],
    outroMotivo: null,
    uniformidadeBercario: 'BOA',
    uniformidadeCultivo: 'BOA',
    sobrevBercario: 80,
    sobrevCultivo: 85,
    resultadosUltimoCiclo: null,
    observacoes: null,
    createdAt: new Date('2026-09-08'),
    updatedAt: new Date('2026-09-08'),
  };

  it('deve atualizar uma pesquisa de campo com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const update = jest.fn().mockResolvedValue({
      ...existingSearch,
      sobrevBercario: 95,
    });
    const repo = { findById, update } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    const result = await sut.execute('search-1', {
      sobrevBercario: 95,
    });

    expect(result.sobrevBercario).toBe(95);
    expect(findById).toHaveBeenCalledWith('search-1');
    expect(update).toHaveBeenCalledWith('search-1', {
      sobrevBercario: 95,
      dataPesquisa: undefined,
    });
  });

  it('deve lançar NotFoundException quando a pesquisa não existir', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(
      sut.execute('search-inexistente', { sobrevBercario: 90 }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException quando larvas for array vazio', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(sut.execute('search-1', { larvas: [] })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve lançar BadRequestException quando parouLarvifort for true e motivosSaida for vazio', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(
      sut.execute('search-1', {
        parouLarvifort: true,
        motivosSaida: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando motivosSaida contiver OUTRO e outroMotivo for vazio', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(
      sut.execute('search-1', {
        parouLarvifort: true,
        motivosSaida: ['OUTRO'],
        outroMotivo: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando sobrevBercario estiver fora de 0-100', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(
      sut.execute('search-1', { sobrevBercario: 150 }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando sobrevCultivo estiver fora de 0-100', async () => {
    const findById = jest.fn().mockResolvedValue(existingSearch);
    const repo = { findById } as unknown as FieldSearchRepositoryPort;
    const sut = new UpdateFieldSearchUseCase(repo);

    await expect(
      sut.execute('search-1', { sobrevCultivo: -10 }),
    ).rejects.toThrow(BadRequestException);
  });
});
