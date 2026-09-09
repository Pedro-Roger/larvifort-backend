import { BadRequestException } from '@nestjs/common';
import { CreateFieldSearchUseCase } from './create-field-search.usecase';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import type { FieldSearch } from '../domain/field-search';

describe('CreateFieldSearchUseCase', () => {
  const mockCreatedSearch: FieldSearch = {
    id: 'search-1',
    clienteId: 'cli-1',
    dataPesquisa: new Date('2026-09-08'),
    responsavelId: 'user-1',
    larvas: ['Larvifort', 'Outra'],
    maioriaLarvifort: true,
    parouLarvifort: false,
    motivosSaida: [],
    outroMotivo: null,
    uniformidadeBercario: 'OTIMA',
    uniformidadeCultivo: 'BOA',
    sobrevBercario: 85,
    sobrevCultivo: 90,
    resultadosUltimoCiclo: 'Bom resultado',
    observacoes: 'Nenhuma',
    createdAt: new Date('2026-09-08'),
    updatedAt: new Date('2026-09-08'),
  };

  it('deve criar uma pesquisa de campo com sucesso', async () => {
    const create = jest.fn().mockResolvedValue(mockCreatedSearch);
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    const result = await sut.execute({
      clienteId: 'cli-1',
      dataPesquisa: new Date('2026-09-08'),
      responsavelId: 'user-1',
      larvas: ['Larvifort', 'Outra'],
      maioriaLarvifort: true,
      parouLarvifort: false,
      motivosSaida: [],
      uniformidadeBercario: 'OTIMA',
      uniformidadeCultivo: 'BOA',
      sobrevBercario: 85,
      sobrevCultivo: 90,
    });

    expect(result).toEqual(mockCreatedSearch);
    expect(create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar BadRequestException quando larvas for vazio', async () => {
    const create = jest.fn();
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: [],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando parouLarvifort for true e motivosSaida for vazio', async () => {
    const create = jest.fn();
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: false,
        parouLarvifort: true,
        motivosSaida: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando motivosSaida contiver OUTRO e outroMotivo for vazio', async () => {
    const create = jest.fn();
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: false,
        parouLarvifort: true,
        motivosSaida: ['OUTRO'],
        outroMotivo: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando sobrevBercario for menor que 0 ou maior que 100', async () => {
    const create = jest.fn();
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
        sobrevBercario: 105,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
        sobrevBercario: -5,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve lançar BadRequestException quando sobrevCultivo for menor que 0 ou maior que 100', async () => {
    const create = jest.fn();
    const repo = { create } as unknown as FieldSearchRepositoryPort;
    const sut = new CreateFieldSearchUseCase(repo);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
        sobrevCultivo: 110,
      }),
    ).rejects.toThrow(BadRequestException);

    await expect(
      sut.execute({
        clienteId: 'cli-1',
        dataPesquisa: new Date('2026-09-08'),
        larvas: ['Larvifort'],
        maioriaLarvifort: true,
        parouLarvifort: false,
        motivosSaida: [],
        sobrevCultivo: -1,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
