import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { CommercialGroup } from '../domain/company';
import type {
  CommercialGroupRepositoryPort,
  CreateCommercialGroupData,
} from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class CreateCommercialGroupUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(input: CreateCommercialGroupData): Promise<CommercialGroup> {
    const existing = await this.groups.findByName(input.name.trim());
    if (existing) {
      throw new ConflictException('Nome de grupo já cadastrado.');
    }

    return this.groups.create(input);
  }
}
