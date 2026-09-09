import { PesquisasController } from './pesquisas.controller';
import type { ListPesquisasUseCase } from '../application/list-pesquisas.usecase';
import type { CreateFieldSearchUseCase } from '../application/create-field-search.usecase';
import type { GetFieldSearchByIdUseCase } from '../application/get-field-search.usecase';
import type { UpdateFieldSearchUseCase } from '../application/update-field-search.usecase';
import type { DeleteFieldSearchUseCase } from '../application/delete-field-search.usecase';
import type { FieldSearch } from '../domain/field-search';

describe('PesquisasController', () => {
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

  it('deve listar pesquisas via findMany', async () => {
    const listExecute = jest.fn().mockResolvedValue({
      data: [mockSearch],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    });
    const controller = new PesquisasController(
      { execute: listExecute } as unknown as ListPesquisasUseCase,
      {} as unknown as CreateFieldSearchUseCase,
      {} as unknown as GetFieldSearchByIdUseCase,
      {} as unknown as UpdateFieldSearchUseCase,
      {} as unknown as DeleteFieldSearchUseCase,
    );

    const result = await controller.findMany({ page: 1, limit: 20 });
    expect(result.data).toEqual([mockSearch]);
    expect(listExecute).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('deve buscar pesquisa por id', async () => {
    const getExecute = jest.fn().mockResolvedValue(mockSearch);
    const controller = new PesquisasController(
      {} as unknown as ListPesquisasUseCase,
      {} as unknown as CreateFieldSearchUseCase,
      { execute: getExecute } as unknown as GetFieldSearchByIdUseCase,
      {} as unknown as UpdateFieldSearchUseCase,
      {} as unknown as DeleteFieldSearchUseCase,
    );

    const result = await controller.findById('search-1');
    expect(result).toEqual(mockSearch);
    expect(getExecute).toHaveBeenCalledWith('search-1');
  });

  it('deve criar uma nova pesquisa', async () => {
    const createExecute = jest.fn().mockResolvedValue(mockSearch);
    const controller = new PesquisasController(
      {} as unknown as ListPesquisasUseCase,
      { execute: createExecute } as unknown as CreateFieldSearchUseCase,
      {} as unknown as GetFieldSearchByIdUseCase,
      {} as unknown as UpdateFieldSearchUseCase,
      {} as unknown as DeleteFieldSearchUseCase,
    );

    const dto = {
      clienteId: 'cli-1',
      larvas: ['Larvifort'],
      maioriaLarvifort: true,
      parouLarvifort: false,
      motivosSaida: [],
    };
    const result = await controller.create(dto);
    expect(result).toEqual(mockSearch);
    expect(createExecute).toHaveBeenCalledWith(dto);
  });

  it('deve atualizar uma pesquisa', async () => {
    const updateExecute = jest.fn().mockResolvedValue(mockSearch);
    const controller = new PesquisasController(
      {} as unknown as ListPesquisasUseCase,
      {} as unknown as CreateFieldSearchUseCase,
      {} as unknown as GetFieldSearchByIdUseCase,
      { execute: updateExecute } as unknown as UpdateFieldSearchUseCase,
      {} as unknown as DeleteFieldSearchUseCase,
    );

    const dto = { sobrevBercario: 90 };
    const result = await controller.update('search-1', dto);
    expect(result).toEqual(mockSearch);
    expect(updateExecute).toHaveBeenCalledWith('search-1', dto);
  });

  it('deve deletar uma pesquisa', async () => {
    const deleteExecute = jest.fn().mockResolvedValue(undefined);
    const controller = new PesquisasController(
      {} as unknown as ListPesquisasUseCase,
      {} as unknown as CreateFieldSearchUseCase,
      {} as unknown as GetFieldSearchByIdUseCase,
      {} as unknown as UpdateFieldSearchUseCase,
      { execute: deleteExecute } as unknown as DeleteFieldSearchUseCase,
    );

    await controller.delete('search-1');
    expect(deleteExecute).toHaveBeenCalledWith('search-1');
  });
});
