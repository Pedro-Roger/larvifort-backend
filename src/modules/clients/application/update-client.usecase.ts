import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Client } from '../domain/client';
import type {
  ClientRepositoryPort,
  UpdateClientData,
} from './ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from './ports/client-repository.port';

@Injectable()
export class UpdateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clients: ClientRepositoryPort,
  ) {}

  async execute(id: string, input: UpdateClientData): Promise<Client> {
    const existing = await this.clients.findById(id);
    if (!existing) {
      throw new NotFoundException('Cliente não encontrado.');
    }

    if (input.cpfCnpj !== undefined && input.cpfCnpj !== null) {
      const cpfCnpj = input.cpfCnpj.trim();
      if (cpfCnpj && cpfCnpj !== existing.cpfCnpj) {
        const clientWithDoc = await this.clients.findByCpfCnpj(cpfCnpj);
        if (clientWithDoc && clientWithDoc.id !== id) {
          throw new ConflictException('CPF/CNPJ já cadastrado.');
        }
      }
    }

    const data: UpdateClientData = { ...input };

    const willHaveBercario =
      input.temBercario !== undefined
        ? input.temBercario
        : existing.temBercario;

    if (!willHaveBercario) {
      data.qtdBercarios = null;
      data.volumeBercarios = null;
    }

    return this.clients.update(id, data);
  }
}
