import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CommercialGroup } from '../domain/company';
import type {
  CommercialGroupRepositoryPort,
  UpdateCommercialGroupData,
} from './ports/commercial-group-repository.port';
import { COMMERCIAL_GROUP_REPOSITORY_PORT } from './ports/commercial-group-repository.port';

@Injectable()
export class UpdateCommercialGroupUseCase {
  constructor(
    @Inject(COMMERCIAL_GROUP_REPOSITORY_PORT)
    private readonly groups: CommercialGroupRepositoryPort,
  ) {}

  async execute(
    id: string,
    input: UpdateCommercialGroupData,
  ): Promise<CommercialGroup> {
    const existing = await this.groups.findById(id);
    if (!existing) {
      throw new NotFoundException('Grupo comercial não encontrado.');
    }

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (name && name !== existing.name) {
        const groupWithName = await this.groups.findByName(name);
        if (groupWithName && groupWithName.id !== id) {
          throw new ConflictException('Nome de grupo já cadastrado.');
        }
      }
    }

    return this.groups.update(id, input);
  }
}
