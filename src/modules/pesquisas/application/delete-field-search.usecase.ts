import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { FieldSearchRepositoryPort } from './ports/field-repository.port';
import { FIELD_SEARCH_REPOSITORY_PORT } from './ports/field-repository.port';

@Injectable()
export class DeleteFieldSearchUseCase {
  constructor(
    @Inject(FIELD_SEARCH_REPOSITORY_PORT)
    private readonly pesquisas: FieldSearchRepositoryPort,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.pesquisas.findById(id);
    if (!existing) {
      throw new NotFoundException('Pesquisa não encontrada.');
    }
    await this.pesquisas.delete(id);
  }
}
