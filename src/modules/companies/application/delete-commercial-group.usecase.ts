import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class DeleteCommercialGroupUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.groups.findById(id);
    if (!existing) {
      throw new NotFoundException('Grupo comercial não encontrado.');
    }
    await this.groups.delete(id);
  }
}
