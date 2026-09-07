import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateClientUseCase } from './update-client.usecase';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import type { Client } from '../domain/client';

describe('UpdateClientUseCase', () => {
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
    temBercario: true,
    qtdBercarios: 2,
    volumeBercarios: 100,
    alimentadorAutomatico: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('atualiza cliente com sucesso', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const findByCpfCnpj = jest.fn().mockResolvedValue(null);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_CLIENT,
      firstName: 'Novo Nome',
    });
    const clients = {
      findById,
      findByCpfCnpj,
      update,
    } as unknown as ClientRepositoryPort;
    const sut = new UpdateClientUseCase(clients);

    const result = await sut.execute('c-1', { firstName: 'Novo Nome' });

    expect(findById).toHaveBeenCalledWith('c-1');
    expect(update).toHaveBeenCalledWith('c-1', { firstName: 'Novo Nome' });
    expect(result.firstName).toBe('Novo Nome');
  });

  it('zera berçários quando temBercario passa a ser false', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const update = jest.fn().mockResolvedValue({
      ...SAMPLE_CLIENT,
      temBercario: false,
      qtdBercarios: null,
      volumeBercarios: null,
    });
    const clients = { findById, update } as unknown as ClientRepositoryPort;
    const sut = new UpdateClientUseCase(clients);

    await sut.execute('c-1', { temBercario: false });

    expect(update).toHaveBeenCalledWith('c-1', {
      temBercario: false,
      qtdBercarios: null,
      volumeBercarios: null,
    });
  });

  it('lança 404 quando cliente não existe', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const clients = { findById } as unknown as ClientRepositoryPort;
    const sut = new UpdateClientUseCase(clients);

    await expect(sut.execute('c-ghost', { firstName: 'Novo' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança 409 quando o novo CPF/CNPJ já pertence a outro cliente', async () => {
    const findById = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const findByCpfCnpj = jest.fn().mockResolvedValue({
      ...SAMPLE_CLIENT,
      id: 'c-2',
      cpfCnpj: '98765432100',
    });
    const update = jest.fn();
    const clients = {
      findById,
      findByCpfCnpj,
      update,
    } as unknown as ClientRepositoryPort;
    const sut = new UpdateClientUseCase(clients);

    await expect(
      sut.execute('c-1', { cpfCnpj: '98765432100' }),
    ).rejects.toThrow(ConflictException);

    expect(update).not.toHaveBeenCalled();
  });
});
