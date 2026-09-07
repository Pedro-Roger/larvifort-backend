import { ClientsController } from './clients.controller';
import type { ListClientsUseCase } from '../application/list-clients.usecase';
import type { GetClientByIdUseCase } from '../application/get-client-by-id.usecase';
import type { CreateClientUseCase } from '../application/create-client.usecase';
import type { UpdateClientUseCase } from '../application/update-client.usecase';
import type { DeleteClientUseCase } from '../application/delete-client.usecase';
import type { Client } from '../domain/client';

describe('ClientsController', () => {
  const SAMPLE_CLIENT: Client = {
    id: 'c-1',
    firstName: 'João',
    lastName: 'Pescador',
    email: 'joao@fazenda.com.br',
    phone: null,
    birthdate: null,
    cpfCnpj: '12345678901',
    statusLead: 'NOVO',
    origem: null,
    pais: 'Brasil',
    cidade: 'Rifaina',
    uf: 'SP',
    endereco: null,
    observacoes: null,
    empresaId: null,
    laminaAgua: null,
    qtdViveiros: null,
    densidade: null,
    producaoMedia: null,
    temBercario: false,
    qtdBercarios: null,
    volumeBercarios: null,
    alimentadorAutomatico: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  function makeSut() {
    const listExecute = jest.fn();
    const getExecute = jest.fn();
    const createExecute = jest.fn();
    const updateExecute = jest.fn();
    const deleteExecute = jest.fn();

    const listClients = {
      execute: listExecute,
    } as unknown as ListClientsUseCase;
    const getClientById = {
      execute: getExecute,
    } as unknown as GetClientByIdUseCase;
    const createClient = {
      execute: createExecute,
    } as unknown as CreateClientUseCase;
    const updateClient = {
      execute: updateExecute,
    } as unknown as UpdateClientUseCase;
    const deleteClient = {
      execute: deleteExecute,
    } as unknown as DeleteClientUseCase;

    const sut = new ClientsController(
      listClients,
      getClientById,
      createClient,
      updateClient,
      deleteClient,
    );

    return {
      sut,
      listExecute,
      getExecute,
      createExecute,
      updateExecute,
      deleteExecute,
    };
  }

  it('findMany delega para ListClientsUseCase', async () => {
    const { sut, listExecute } = makeSut();
    const paginatedResult = {
      data: [SAMPLE_CLIENT],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    listExecute.mockResolvedValue(paginatedResult);

    const result = await sut.findMany({ page: 1, limit: 10, search: 'joao' });

    expect(listExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'joao',
    });
    expect(result).toEqual(paginatedResult);
  });

  it('findById delega para GetClientByIdUseCase', async () => {
    const { sut, getExecute } = makeSut();
    getExecute.mockResolvedValue(SAMPLE_CLIENT);

    const result = await sut.findById('c-1');

    expect(getExecute).toHaveBeenCalledWith('c-1');
    expect(result).toEqual(SAMPLE_CLIENT);
  });

  it('create delega para CreateClientUseCase', async () => {
    const { sut, createExecute } = makeSut();
    createExecute.mockResolvedValue(SAMPLE_CLIENT);

    const dto = {
      firstName: 'João',
      lastName: 'Pescador',
      cpfCnpj: '12345678901',
    };
    const result = await sut.create(dto);

    expect(createExecute).toHaveBeenCalledWith(dto);
    expect(result).toEqual(SAMPLE_CLIENT);
  });

  it('update delega para UpdateClientUseCase', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({ ...SAMPLE_CLIENT, firstName: 'Novo' });

    const result = await sut.update('c-1', { firstName: 'Novo' });

    expect(updateExecute).toHaveBeenCalledWith('c-1', { firstName: 'Novo' });
    expect(result.firstName).toBe('Novo');
  });

  it('updateStatus delega para UpdateClientUseCase com { statusLead }', async () => {
    const { sut, updateExecute } = makeSut();
    updateExecute.mockResolvedValue({
      ...SAMPLE_CLIENT,
      statusLead: 'CLIENTE_ATIVO',
    });

    const result = await sut.updateStatus('c-1', { status: 'CLIENTE_ATIVO' });

    expect(updateExecute).toHaveBeenCalledWith('c-1', {
      statusLead: 'CLIENTE_ATIVO',
    });
    expect(result.statusLead).toBe('CLIENTE_ATIVO');
  });

  it('delete delega para DeleteClientUseCase', async () => {
    const { sut, deleteExecute } = makeSut();
    deleteExecute.mockResolvedValue(undefined);

    await sut.delete('c-1');

    expect(deleteExecute).toHaveBeenCalledWith('c-1');
  });
});
