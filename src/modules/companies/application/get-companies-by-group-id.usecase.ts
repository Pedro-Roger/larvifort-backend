import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Company } from '../domain/company';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class GetCompaniesByGroupIdUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(groupId: string): Promise<Company[]> {
    const group = await this.groups.findById(groupId);
    if (!group) {
      throw new NotFoundException('Grupo comercial não encontrado.');
    }
    return this.groups.findCompaniesByGroupId(groupId);
  }
}
