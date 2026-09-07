import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Client } from '../domain/client';
import type {
  ClientRepositoryPort,
  CreateClientData,
} from './ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from './ports/client-repository.port';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clients: ClientRepositoryPort,
  ) {}

  async execute(input: CreateClientData): Promise<Client> {
    if (input.cpfCnpj?.trim()) {
      const existing = await this.clients.findByCpfCnpj(input.cpfCnpj.trim());
      if (existing) {
        throw new ConflictException('CPF/CNPJ já cadastrado.');
      }
    }

    const temBercario = Boolean(input.temBercario);
    const data: CreateClientData = {
      ...input,
      temBercario,
      qtdBercarios: temBercario ? (input.qtdBercarios ?? null) : null,
      volumeBercarios: temBercario ? (input.volumeBercarios ?? null) : null,
    };

    return this.clients.create(data);
  }
}
