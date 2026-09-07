import { ConflictException } from '@nestjs/common';
import { CreateClientUseCase } from './create-client.usecase';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import type { Client } from '../domain/client';

describe('CreateClientUseCase', () => {
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

  it('cria cliente e zera berçários se temBercario for falso', async () => {
    const findByCpfCnpj = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const clients = {
      findByCpfCnpj,
      create,
    } as unknown as ClientRepositoryPort;
    const sut = new CreateClientUseCase(clients);

    const result = await sut.execute({
      firstName: 'João',
      lastName: 'Pescador',
      cpfCnpj: '12345678901',
      temBercario: false,
      qtdBercarios: 10,
      volumeBercarios: 200,
    });

    expect(findByCpfCnpj).toHaveBeenCalledWith('12345678901');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        temBercario: false,
        qtdBercarios: null,
        volumeBercarios: null,
      }),
    );
    expect(result).toEqual(SAMPLE_CLIENT);
  });

  it('lança 409 quando o CPF/CNPJ já existe', async () => {
    const findByCpfCnpj = jest.fn().mockResolvedValue(SAMPLE_CLIENT);
    const create = jest.fn();
    const clients = {
      findByCpfCnpj,
      create,
    } as unknown as ClientRepositoryPort;
    const sut = new CreateClientUseCase(clients);

    await expect(
      sut.execute({
        firstName: 'João',
        lastName: 'Pescador',
        cpfCnpj: '12345678901',
      }),
    ).rejects.toThrow(ConflictException);

    expect(create).not.toHaveBeenCalled();
  });
});
