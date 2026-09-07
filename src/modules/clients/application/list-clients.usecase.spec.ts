import { ListClientsUseCase } from './list-clients.usecase';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import type { Client } from '../domain/client';

describe('ListClientsUseCase', () => {
  const SAMPLE_CLIENT: Client = {
    id: 'c-1',
    firstName: 'João',
    lastName: 'Pescador',
    email: 'joao@fazenda.com.br',
    phone: null,
    birthdate: null,
    cpfCnpj: null,
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

  it('retorna lista paginada de clientes', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue({ data: [SAMPLE_CLIENT], total: 1 });
    const clients = { findMany } as unknown as ClientRepositoryPort;
    const sut = new ListClientsUseCase(clients);

    const result = await sut.execute({ page: 1, limit: 10, search: 'joao' });

    expect(findMany).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: 'joao',
    });
    expect(result).toEqual({
      data: [SAMPLE_CLIENT],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });
});
