import { Inject, Injectable } from '@nestjs/common';
import type { CommercialGroup } from '../domain/company';
import type { CommercialGroupRepositoryPort } from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class ListCommercialGroupsUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(): Promise<CommercialGroup[]> {
    return this.groups.findAll();
  }
}
