import { NotFoundException } from '@nestjs/common';
import { GetClientByIdUseCase } from './get-client-by-id.usecase';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import type { Client } from '../domain/client';

describe('GetClientByIdUseCase', () => {
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

  it('retorna cliente quando encontrado', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const clients = { findById } as unknown as ClientRepositoryPort;
    const sut = new GetClientByIdUseCase(clients);

    const result = await sut.execute('c-1');

    expect(findById).toHaveBeenCalledWith('c-1');
    expect(result).toEqual(SAMPLE_CLIENT);
  });

  it('lança 404 quando cliente não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const clients = { findById } as unknown as ClientRepositoryPort;
    const sut = new GetClientByIdUseCase(clients);

    await expect(sut.execute('c-ghost')).rejects.toThrow(NotFoundException);
  });
});
