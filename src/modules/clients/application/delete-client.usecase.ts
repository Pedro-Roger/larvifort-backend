import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ClientRepositoryPort } from './ports/client-repository.port';
import { CLIENT_REPOSITORY_PORT } from './ports/client-repository.port';

@Injectable()
export class DeleteClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY_PORT)
    private readonly clients: ClientRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.clients.findById(id);
    if (!existing) {
      throw new NotFoundException('Cliente não encontrado.');
    }
    await this.clients.delete(id);
  }
}
