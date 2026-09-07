import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Client } from '../domain/client';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from './ports/client-repository.port';

@Injectable()
export class GetClientByIdUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clients: ClientRepositoryPort,
  ) {}

  async execute(id: string): Promise<Client> {
    const client = await this.clients.findById(id);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    return client;
  }
}
