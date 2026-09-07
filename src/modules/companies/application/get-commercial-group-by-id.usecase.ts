import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CommercialGroup } from '../domain/company';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class GetCommercialGroupByIdUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(id: string): Promise<CommercialGroup> {
    const group = await this.groups.findById(id);
    if (!group) {
      throw new NotFoundException('Grupo comercial não encontrado.');
    }
    return group;
  }
}
